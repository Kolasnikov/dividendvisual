import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkRateLimit, getIp, tooManyRequests } from '@/lib/rateLimit'

function cleanField(value: unknown, fallback: string, maxLength = 120) {
  if (typeof value !== 'string') return fallback
  const cleaned = value.trim().replace(/[^\w./:-]/g, '-').slice(0, maxLength)
  return cleaned || fallback
}

export async function POST(req: NextRequest) {
  if (!checkRateLimit('subscribe', getIp(req), 5, 60_000).ok) return tooManyRequests()

  const body = await req.json()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const source = cleanField(body.source, 'unknown')
  const symbol = cleanField(body.symbol, '', 12).toUpperCase()
  const path = cleanField(body.path, '', 200)
  const referer = cleanField(req.headers.get('referer'), '', 300)
  const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 300)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: source,
        utm_medium: 'website',
        utm_campaign: 'newsletter_signup',
        utm_content: symbol || path || 'generic',
        referring_site: referer || undefined,
        custom_fields: [
          { name: 'Signup Source', value: source },
          ...(symbol ? [{ name: 'Signup Symbol', value: symbol }] : []),
          ...(path ? [{ name: 'Signup Path', value: path }] : []),
        ],
      }),
    }
  )

  if (!res.ok && res.status !== 409) {
    const body = await res.json().catch(() => ({}))
    console.error('Beehiiv subscribe error', res.status, body)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const resendAudienceId = process.env.RESEND_AUDIENCE_ID

  if (resendApiKey && resendAudienceId) {
    const resendRes = await fetch(`https://api.resend.com/audiences/${resendAudienceId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    })

    if (!resendRes.ok && resendRes.status !== 409) {
      const body = await resendRes.json().catch(() => ({}))
      console.error('Resend contact sync error', resendRes.status, body)
    }
  }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_signups (
        email TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        symbol TEXT,
        path TEXT,
        referer TEXT,
        user_agent TEXT,
        subscribed_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)
    await db.execute({
      sql: `
        INSERT INTO newsletter_signups (
          email, source, symbol, path, referer, user_agent, subscribed_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(email) DO UPDATE SET
          source = excluded.source,
          symbol = excluded.symbol,
          path = excluded.path,
          referer = excluded.referer,
          user_agent = excluded.user_agent,
          updated_at = datetime('now')
      `,
      args: [email, source, symbol || null, path || null, referer || null, userAgent || null],
    })
  } catch (error) {
    console.error('Newsletter signup source tracking error', error)
  }

  return NextResponse.json({ ok: true })
}
