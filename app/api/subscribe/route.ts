import { createHash, createHmac } from 'crypto'
import { after, NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkRateLimit, getIp, tooManyRequests } from '@/lib/rateLimit'

function cleanField(value: unknown, fallback: string, maxLength = 120) {
  if (typeof value !== 'string') return fallback
  const cleaned = value.trim().replace(/[^\w./:-]/g, '-').slice(0, maxLength)
  return cleaned || fallback
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://dividendvisual.com').replace(/\/$/, '')
}

function unsubscribeToken(email: string) {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY || ''
  return createHmac('sha256', secret).update(email).digest('hex')
}

function unsubscribeUrl(email: string) {
  return `${getSiteUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email)}`
}

function buildWelcomeEmail(email: string, source: string, symbol: string) {
  const siteUrl = getSiteUrl()
  const unsub = unsubscribeUrl(email)
  const sourceNote = symbol
    ? `You joined from ${source} while viewing ${symbol}.`
    : `You joined from ${source}.`
  const subject = 'Welcome to DividendVisual: start with the signal, then check the risk'
  const ctaUrl = symbol ? `${siteUrl}/analysis/${symbol.toLowerCase()}` : `${siteUrl}/undervalued-dividend-stocks`
  const ctaLabel = symbol ? `Review ${symbol} analysis` : 'Open current opportunities'

  const sections = [
    [
      '1. Weiss valuation signal',
      'A stock is marked undervalued when its current dividend yield is high versus its own historical yield range. That usually means the market is offering more income per dollar invested than usual.',
    ],
    [
      '2. Quality score',
      'The quality score keeps the signal honest. A high yield is only interesting when dividend history, payout coverage, growth, and balance-sheet context support it.',
    ],
    [
      '3. Payout safety',
      'Before treating a high yield as attractive, check whether earnings and free cash flow can actually fund the dividend.',
    ],
  ]

  const sectionHtml = sections
    .map(([title, body]) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e5e7eb;">
            <h2 style="margin:0 0 6px;font-size:15px;line-height:1.35;color:#111827;">${escapeHtml(title)}</h2>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">${escapeHtml(body)}</p>
          </td>
        </tr>`)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">A practical guide to reading DividendVisual's dividend signals.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 14px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#09090b;padding:24px 28px;">
            <a href="${siteUrl}" style="color:#ffffff;text-decoration:none;font-size:19px;font-weight:800;">Dividend<span style="color:#6366f1;">Visual</span></a>
            <div style="color:#a1a1aa;font-size:12px;margin-top:5px;">Dividend research onboarding</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#111827;">Start with the signal, then check the risk</h1>
            <p style="margin:0 0 18px;color:#374151;font-size:15px;line-height:1.65;">
              DividendVisual is built for one job: helping you find dividend stocks whose current yield looks attractive versus their own history, without ignoring quality and payout risk.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">${sectionHtml}</table>
            <p style="margin:22px 0;color:#6b7280;font-size:13px;line-height:1.55;">${escapeHtml(sourceNote)}</p>
            <a href="${ctaUrl}" style="display:inline-block;background:#09090b;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-size:14px;font-weight:700;">${escapeHtml(ctaLabel)}</a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 28px;">
            <p style="margin:0;color:#6b7280;font-size:11px;line-height:1.6;">
              Educational research only. Not financial, investment, or tax advice.
              <a href="${siteUrl}/methodology" style="color:#4f46e5;">Methodology</a>
              &middot; <a href="${unsub}" style="color:#4f46e5;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = `Start with the signal, then check the risk

DividendVisual is built for one job: helping you find dividend stocks whose current yield looks attractive versus their own history, without ignoring quality and payout risk.

${sections.map(([title, body]) => `${title}\n${body}`).join('\n\n')}

${sourceNote}

${ctaLabel}: ${ctaUrl}
Unsubscribe: ${unsub}
`

  return { subject, html, text }
}

async function sendImmediateWelcomeEmail(email: string, source: string, symbol: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) throw new Error('RESEND_API_KEY is not set')

  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.ALERT_FROM_EMAIL || 'newsletter@dividendvisual.com'
  const { subject, html, text } = buildWelcomeEmail(email, source, symbol)
  const idempotencyDigest = createHash('sha256').update(`${email}:0`).digest('hex')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
      'Idempotency-Key': `welcome-${idempotencyDigest}`,
    },
    body: JSON.stringify({
      from: `DividendVisual <${fromEmail}>`,
      to: [email],
      subject,
      html,
      text,
      tags: [
        { name: 'sequence', value: 'welcome' },
        { name: 'step', value: '1' },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(`Resend welcome email error ${response.status}: ${JSON.stringify(body)}`)
  }

  return response.json() as Promise<{ id: string }>
}

async function syncResendContact(email: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  const resendAudienceId = process.env.RESEND_AUDIENCE_ID

  if (!resendApiKey || !resendAudienceId) {
    throw new Error('Resend audience sync is not configured')
  }

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
    signal: AbortSignal.timeout(8_000),
  })

  if (!resendRes.ok && resendRes.status !== 409) {
    const body = await resendRes.json().catch(() => ({}))
    throw new Error(`Resend contact sync error ${resendRes.status}: ${JSON.stringify(body)}`)
  }
}

async function syncBeehiivContact(email: string, source: string, symbol: string, path: string, referer: string) {
  const beehiivApiKey = process.env.BEEHIIV_API_KEY
  const beehiivPublicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!beehiivApiKey || !beehiivPublicationId) return

  const beehiivRes = await fetch(
    `https://api.beehiiv.com/v2/publications/${beehiivPublicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${beehiivApiKey}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: false,
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
      signal: AbortSignal.timeout(8_000),
    }
  )

  if (!beehiivRes.ok && beehiivRes.status !== 409) {
    const body = await beehiivRes.json().catch(() => ({}))
    console.error('Beehiiv optional sync error', beehiivRes.status, body)
  }
}

async function sendWelcomeIfDue(email: string, source: string, symbol: string) {
  const subscriber = await db.execute({
    sql: 'SELECT welcome_step FROM newsletter_subscribers WHERE email = ?',
    args: [email],
  })
  const welcomeStep = Number(subscriber.rows[0]?.welcome_step ?? 0)

  if (welcomeStep !== 0) return

  const welcome = await sendImmediateWelcomeEmail(email, source, symbol)
  await db.execute({
    sql: `
      UPDATE newsletter_subscribers
      SET welcome_step = 1, last_welcome_sent_at = datetime('now'), updated_at = datetime('now')
      WHERE email = ?
    `,
    args: [email],
  })
  await db.execute({
    sql: `
      INSERT INTO newsletter_events (email, event_type, metadata)
      VALUES (?, 'welcome_email_sent', ?)
    `,
    args: [email, JSON.stringify({ step: 1, resend_id: welcome.id, delivery: 'immediate' })],
  })
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

  const resendApiKey = process.env.RESEND_API_KEY
  const resendAudienceId = process.env.RESEND_AUDIENCE_ID

  if (!resendApiKey || !resendAudienceId) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  let subscriptionState: 'new' | 'existing' | 'reactivated' = 'new'

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        email TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        symbol TEXT,
        path TEXT,
        referer TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        welcome_step INTEGER NOT NULL DEFAULT 0,
        last_welcome_sent_at TEXT,
        subscribed_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)
    const existing = await db.execute({
      sql: 'SELECT status FROM newsletter_subscribers WHERE email = ?',
      args: [email],
    })
    const previousStatus = String(existing.rows[0]?.status ?? '')

    await db.execute({
      sql: `
        INSERT INTO newsletter_subscribers (
          email, source, symbol, path, referer, status, subscribed_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
        ON CONFLICT(email) DO UPDATE SET
          source = excluded.source,
          symbol = excluded.symbol,
          path = excluded.path,
          referer = excluded.referer,
          status = 'active',
          updated_at = datetime('now')
      `,
      args: [email, source, symbol || null, path || null, referer || null],
    })

    subscriptionState = previousStatus === 'active'
      ? 'existing'
      : previousStatus === 'unsubscribed'
        ? 'reactivated'
        : 'new'
  } catch (error) {
    console.error('Newsletter subscriber persistence error', error)
    return NextResponse.json({ error: 'We could not save your subscription. Please try again.' }, { status: 500 })
  }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        event_type TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    await db.execute({
      sql: `
        INSERT INTO newsletter_events (email, event_type, metadata)
        VALUES (?, 'subscribed', ?)
      `,
      args: [email, JSON.stringify({ source, symbol: symbol || null, path: path || null, referer: referer || null })],
    })
  } catch (error) {
    console.error('Newsletter event tracking error', error)
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

  after(async () => {
    try {
      await Promise.all([
        syncResendContact(email),
        syncBeehiivContact(email, source, symbol, path, referer),
        sendWelcomeIfDue(email, source, symbol),
      ])
    } catch (error) {
      console.error('Newsletter post-signup background work error', error)
    }
  })

  return NextResponse.json({ ok: true, subscriptionState })
}
