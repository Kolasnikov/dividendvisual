'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Position {
  symbol: string
  shares: number
  costPerShare?: number
}

const STORAGE_KEY = 'dv_portfolio'

export function usePortfolio() {
  const [positions, setPositions] = useState<Position[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPositions(JSON.parse(raw) as Position[])
    } catch {}
    setReady(true)
  }, [])

  const persist = useCallback((next: Position[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
    setPositions(next)
  }, [])

  const add = useCallback(
    (pos: Position) => {
      setPositions((prev) => {
        const existing = prev.findIndex((p) => p.symbol === pos.symbol)
        const next =
          existing >= 0
            ? prev.map((p, i) => (i === existing ? pos : p))
            : [...prev, pos]
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
        return next
      })
    },
    [],
  )

  const remove = useCallback(
    (symbol: string) => {
      setPositions((prev) => {
        const next = prev.filter((p) => p.symbol !== symbol)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
        return next
      })
    },
    [],
  )

  void persist // used indirectly via add/remove closures

  return { positions, add, remove, ready }
}
