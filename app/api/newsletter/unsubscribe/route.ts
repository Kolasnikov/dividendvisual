import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

function getSecret() {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY || ''
}

function tokenFor(email: string) {
  return createHmac('sha256', getSecret()).update(email).digest('hex')
}

function isValidToken(email: string, token: string) {
  const expected = tokenFor(email)
  const expectedBuffer = Buffer.from(expected, 'hex')
  const tokenBuffer = Buffer.from(token, 'hex')
  return expectedBuffer.length === tokenBuffer.length && timingSafeEqual(expectedBuffer, tokenBuffer)
}

function htmlPage(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title} | DividendVisual</title>
    <style>
      body{margin:0;background:#09090b;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      main{min-height:100vh;display:grid;place-items:center;padding:24px}
      section{max-width:560px;border:1px solid #1e1e2e;background:#111118;border-radius:12px;padding:32px}
      a{color:#818cf8}
      p{color:#a1a1aa;line-height:1.6}
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${title}</h1>
        <p>${body}</p>
        <p><a href="https://dividendvisual.com">Back to DividendVisual</a></p>
      </section>
    </main>
  </body>
</html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

async function syncResendUnsubscribe(email: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  const resendAudienceId = process.env.RESEND_AUDIENCE_ID
  if (!resendApiKey || !resendAudienceId) return

  const response = await fetch(
    `https://api.resend.com/audiences/${resendAudienceId}/contacts/${encodeURIComponent(email)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({ unsubscribed: true }),
    }
  )

  if (!response.ok && response.status !== 404) {
    const body = await response.json().catch(() => ({}))
    console.error('Resend unsubscribe sync error', response.status, body)
  }
}

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase()
  const token = req.nextUrl.searchParams.get('token') || ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !token || !getSecret()) {
    return htmlPage('Invalid unsubscribe link', 'This unsubscribe link is missing required information.', 400)
  }

  try {
    if (!isValidToken(email, token)) {
      return htmlPage('Invalid unsubscribe link', 'This unsubscribe link is not valid or has expired.', 400)
    }
  } catch {
    return htmlPage('Invalid unsubscribe link', 'This unsubscribe link is not valid or has expired.', 400)
  }

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
    await db.execute({
      sql: `
        UPDATE newsletter_subscribers
        SET status = 'unsubscribed', updated_at = datetime('now')
        WHERE email = ?
      `,
      args: [email],
    })
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
        VALUES (?, 'unsubscribed', ?)
      `,
      args: [email, JSON.stringify({ source: 'unsubscribe_link' })],
    })
    await syncResendUnsubscribe(email)
  } catch (error) {
    console.error('Newsletter unsubscribe error', error)
    return htmlPage('Something went wrong', 'We could not process the unsubscribe request. Please try again.', 500)
  }

  return htmlPage('You are unsubscribed', 'You will no longer receive DividendVisual newsletter emails.')
}
