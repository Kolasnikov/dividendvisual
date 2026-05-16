'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'dv_watchlist'

export function useWatchlist() {
  const [symbols, setSymbols] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSymbols(new Set(JSON.parse(raw) as string[]))
    } catch {}
    setReady(true)
  }, [])

  const toggle = useCallback((symbol: string) => {
    setSymbols((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) next.delete(symbol)
      else next.add(symbol)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {}
      return next
    })
  }, [])

  return {
    has: (symbol: string) => symbols.has(symbol),
    toggle,
    count: symbols.size,
    symbols,
    ready,
  }
}
