'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'

interface DividendAlertsCTAProps {
  source: string
  symbol?: string
  title?: string
  description?: string
  compact?: boolean
}

export function DividendAlertsCTA({
  source,
  symbol,
  title,
  description,
  compact = false,
}: DividendAlertsCTAProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.ok) {
        setEmail('')
        setStatus('success')
        track('email_subscribed', { source, symbol: symbol ?? 'none' })
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  const heading = title ?? (symbol
    ? `Get alerts when ${symbol} or similar dividend stocks become undervalued`
    : 'Get weekly undervalued dividend stock alerts')
  const body = description ??
    'A short weekly email with quality dividend stocks entering historically attractive yield territory. No noise, just signals worth reviewing.'

  return (
    <aside className={`rounded-lg border border-[#22c55e]/25 bg-[#111118] ${compact ? 'p-4' : 'p-5'}`}>
      <div className="grid gap-4 md:grid-cols-[1fr_320px] md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#22c55e]">Free weekly digest</span>
          </div>
          <p className="text-sm font-semibold text-[#f4f4f5]">{heading}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#71717a]">{body}</p>
        </div>

        {status === 'success' ? (
          <div className="rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-2 text-sm font-medium text-[#22c55e]">
            You are on the list.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your@email.com"
                required
                className="min-w-0 flex-1 rounded-md border border-[#2e2e3e] bg-[#09090b] px-3 py-2 text-sm text-[#f4f4f5] placeholder-[#52525b] outline-none transition-colors focus:border-[#6366f1]"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-md bg-[#22c55e] px-3 py-2 text-sm font-medium text-[#07130b] transition-colors hover:bg-[#4ade80] disabled:opacity-60"
              >
                {status === 'loading' ? '...' : 'Notify me'}
              </button>
            </div>
            {status === 'error' ? (
              <p className="text-xs text-[#ef4444]">{errorMsg}</p>
            ) : (
              <p className="text-xs text-[#52525b]">No spam. Unsubscribe any time.</p>
            )}
          </form>
        )}
      </div>
    </aside>
  )
}
