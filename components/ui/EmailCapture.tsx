'use client'

import { useState } from 'react'

interface EmailCaptureProps {
  variant?: 'hero' | 'banner'
}

export function EmailCapture({ variant = 'hero' }: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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
            <p className="font-semibold text-[#f4f4f5] mb-1">Get the weekly undervalued digest</p>
            <p className="text-sm text-[#71717a]">We&apos;ll email you when quality dividend stocks enter the undervalued zone.</p>
          </div>
          <Form email={email} setEmail={setEmail} status={status} errorMsg={errorMsg} onSubmit={handleSubmit} compact />
        </div>
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
        Know when a dividend stock becomes undervalued
      </h2>
      <p className="text-[#71717a] mb-6 text-sm leading-relaxed">
        Every week we send a short email with the dividend stocks that have just entered historically undervalued territory — based on the Weiss method. No noise, just signal.
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
  status: 'idle' | 'loading' | 'success' | 'error'
  errorMsg: string
  onSubmit: (e: React.FormEvent) => void
  compact?: boolean
}) {
  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-[#22c55e] font-medium text-sm">
        <span>✓</span>
        <span>You&apos;re on the list. We&apos;ll be in touch.</span>
      </div>
    )
  }

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
          {status === 'loading' ? '...' : 'Notify me'}
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
