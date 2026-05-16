import { NextRequest, NextResponse } from 'next/server'

// In-memory store — persists across requests on warm Lambda instances.
// Best-effort: cold starts reset the counters. Sufficient for basic abuse prevention.
// Upgrade to Vercel KV / Upstash if you need distributed, guaranteed rate limiting.
const store = new Map<string, { count: number; resetAt: number }>()

// Prune expired entries every ~200 requests to prevent unbounded growth.
let pruneCounter = 0
function maybePrune() {
  if (++pruneCounter < 200) return
  pruneCounter = 0
  const now = Date.now()
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key)
  }
}

export function checkRateLimit(
  namespace: string,
  ip: string,
  limit: number,
  windowMs: number,
): { ok: boolean } {
  maybePrune()
  const key = `${namespace}:${ip}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (entry.count >= limit) return { ok: false }

  entry.count++
  return { ok: true }
}

export function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export function tooManyRequests() {
  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    { status: 429, headers: { 'Retry-After': '60' } },
  )
}
