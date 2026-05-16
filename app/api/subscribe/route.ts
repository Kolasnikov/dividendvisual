import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit, getIp, tooManyRequests } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  if (!checkRateLimit('subscribe', getIp(req), 5, 60_000).ok) return tooManyRequests()
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  try {
    const resend = new Resend(apiKey)
    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    // Resend returns 409 if contact already exists — treat as success
    if (msg.includes('already exists') || msg.includes('409')) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
