'use client'

import { useState } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import type { WatchlistItem } from '@/lib/types'

interface EmailCaptureProps {
  variant?: 'hero' | 'banner'
}

export function EmailCapture({ variant = 'hero' }: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [picks, setPicks] = useState<WatchlistItem[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        setStatus('success')
        setEmail('')
        track('email_subscribed')
        fetch('/api/watchlist?sort=quality&order=desc')
          .then((r) => r.json())
          .then((all: WatchlistItem[]) => {
            setPicks(all.filter((s) => s.weissSignal === 'undervalued').slice(0, 6))
          })
          .catch(() => {})
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  if (variant === 'banner') {
    return (
      <section className="border-t border-b border-[#1e1e2e] bg-[#111118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-[#f4f4f5] mb-1">Get the weekly undervalued picks</p>
            <p className="text-sm text-[#71717a]">Quality dividend stocks entering historically undervalued territory — delivered weekly.</p>
          </div>
          {status === 'success' ? (
            <div className="flex items-center gap-2 text-[#22c55e] font-medium text-sm">
              <span>✓</span>
              <span>You&apos;re on the list.</span>
            </div>
          ) : (
            <Form email={email} setEmail={setEmail} status={status} errorMsg={errorMsg} onSubmit={handleSubmit} compact />
          )}
        </div>
      </section>
    )
  }

  if (status === 'success') {
    return (
      <section className="max-w-2xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-4 py-1.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-[#22c55e] font-medium">You&apos;re on the list</span>
        </div>
        <h2 className="text-2xl font-bold text-[#f4f4f5] mb-2">
          {picks.length > 0
            ? `${picks.length} undervalued dividend stock${picks.length === 1 ? '' : 's'} right now`
            : 'You\'re confirmed'}
        </h2>
        <p className="text-[#71717a] mb-6 text-sm leading-relaxed">
          {picks.length > 0
            ? "These stocks are currently in historically undervalued territory by the Weiss method. We'll track them and send updates weekly."
            : "No stocks are undervalued right now — we'll email you when quality dividend stocks enter historically attractive yield territory."}
        </p>
        {picks.length > 0 && (
          <div className="text-left border border-[#22c55e]/20 rounded-xl overflow-hidden mb-6">
            {picks.map((pick, i) => (
              <Link
                key={pick.symbol}
                href={`/ticker/${pick.symbol}`}
                className={`flex items-center justify-between px-4 py-3 hover:bg-[#22c55e]/5 transition-colors group ${i > 0 ? 'border-t border-[#1e1e2e]' : ''}`}
              >
                <div className="min-w-0">
                  <span className="font-mono font-bold text-sm text-[#f4f4f5] group-hover:text-[#22c55e] transition-colors">{pick.symbol}</span>
                  <span className="text-xs text-[#71717a] ml-2 truncate">{pick.name}</span>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#22c55e]">{(pick.currentYield * 100).toFixed(2)}%</p>
                    <p className="text-[10px] text-[#52525b]">yield</p>
                  </div>
                  <div className="text-right w-9">
                    <p className="text-sm font-bold text-[#6366f1]">{pick.qualityScore}</p>
                    <p className="text-[10px] text-[#52525b]">quality</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/opportunities"
          className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          → View full analysis and historical charts
        </Link>
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-4 text-center">
      <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-4 py-1.5 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
        <span className="text-xs text-[#22c55e] font-medium">Free weekly digest</span>
      </div>
      <h2 className="text-2xl font-bold text-[#f4f4f5] mb-2">
        See which dividend stocks are undervalued right now
      </h2>
      <p className="text-[#71717a] mb-6 text-sm leading-relaxed">
        Subscribe and we&apos;ll show you today&apos;s undervalued picks — dividend stocks with yields near
        their 10-year historical highs, ranked by quality score. Updated daily, delivered weekly.
      </p>
      <Form email={email} setEmail={setEmail} status={status} errorMsg={errorMsg} onSubmit={handleSubmit} />
    </section>
  )
}

function Form({
  email, setEmail, status, errorMsg, onSubmit, compact = false,
}: {
  email: string
  setEmail: (v: string) => void
  status: 'idle' | 'loading' | 'error'
  errorMsg: string
  onSubmit: (e: React.FormEvent) => void
  compact?: boolean
}) {
  return (
    <div>
      <form onSubmit={onSubmit} className={`flex gap-2 ${compact ? '' : 'max-w-md mx-auto'}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-[#09090b] border border-[#1e1e2e] rounded-lg px-4 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#6366f1] transition-colors min-w-0"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2.5 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#818cf8] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? '...' : 'Get the picks'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-[#ef4444] mt-2 text-left">{errorMsg}</p>
      )}
      {!compact && (
        <p className="text-xs text-[#52525b] mt-3">No spam. Unsubscribe any time.</p>
      )}
    </div>
  )
}
