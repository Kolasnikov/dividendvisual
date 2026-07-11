'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackNewsletterEvent, useNewsletterFunnel } from '@/components/analytics/useNewsletterFunnel'

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
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const { containerRef, trackStarted } = useNewsletterFunnel(source)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMsg('')
    trackNewsletterEvent('newsletter_form_submitted', source, { symbol: symbol ?? 'none' })

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          symbol,
          path: window.location.pathname,
        }),
      })
      const data = await res.json()

      if (data.ok) {
        setEmail('')
        setStatus('success')
        trackNewsletterEvent('email_subscribed', source, {
          symbol: symbol ?? 'none',
          subscription_state: data.subscriptionState ?? 'unknown',
        })
        const params = new URLSearchParams({ source })
        if (symbol) params.set('symbol', symbol)
        router.push(`/newsletter/confirmed?${params.toString()}`)
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong.')
        trackNewsletterEvent('newsletter_form_failed', source, { status: res.status })
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
      trackNewsletterEvent('newsletter_form_failed', source, { status: 'network_error' })
    }
  }

  const heading = title ?? (symbol
    ? `Get alerts when ${symbol} or similar dividend stocks become undervalued`
    : 'Get weekly undervalued dividend stock alerts')
  const body = description ??
    'A short weekly email with quality dividend stocks entering historically attractive yield territory. No noise, just signals worth reviewing.'

  return (
    <aside ref={containerRef} className={`rounded-lg border border-[#22c55e]/25 bg-[#111118] ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#22c55e]">Free weekly digest</span>
          </div>
          <p className="text-base font-semibold leading-snug text-[#f4f4f5]">{heading}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{body}</p>
        </div>

        {status === 'success' ? (
          <div className="rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-2 text-sm font-medium text-[#22c55e]">
            You are on the list. Check your inbox for the welcome email.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onFocus={trackStarted}
                placeholder="your@email.com"
                required
                className="min-w-0 flex-1 rounded-md border border-[#2e2e3e] bg-[#09090b] px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] outline-none transition-colors focus:border-[#6366f1]"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="shrink-0 rounded-md bg-[#22c55e] px-4 py-2.5 text-sm font-medium text-[#07130b] transition-colors hover:bg-[#4ade80] disabled:opacity-60"
              >
                {status === 'loading' ? '...' : 'Notify me'}
              </button>
            </div>
            {status === 'error' ? (
              <p className="text-xs text-[#ef4444]">{errorMsg}</p>
            ) : (
              <p className="text-xs text-[#52525b]">
                No spam. Unsubscribe any time.{' '}
                <Link href="/newsletter" className="text-[#22c55e] hover:text-[#4ade80]">
                  See what you get
                </Link>
                .
              </p>
            )}
          </form>
        )}
      </div>
    </aside>
  )
}
