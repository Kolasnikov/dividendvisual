import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIp, tooManyRequests } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  if (!checkRateLimit('subscribe', getIp(req), 5, 60_000).ok) return tooManyRequests()

  const { email } = await req.json()

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

  return NextResponse.json({ ok: true })
}
