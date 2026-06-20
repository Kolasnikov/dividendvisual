'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TapeItem {
  symbol: string
  price: number
  yield: number
  signal: string
}

const SIGNAL_COLOR: Record<string, string> = {
  undervalued: '#22c55e',
  overvalued:  '#ef4444',
  'fair-value': '#f59e0b',
}

export function TickerTape() {
  const [items, setItems] = useState<TapeItem[]>([])

  useEffect(() => {
    fetch('/api/watchlist?sort=price&order=asc')
      .then((r) => r.json())
      .then((data) => {
        setItems(
          data
            .filter((d: { currentPrice: number; currentYield: number }) => d.currentPrice > 0 && d.currentYield > 0)
            .map((d: { symbol: string; currentPrice: number; currentYield: number; weissSignal: string }) => ({
              symbol: d.symbol,
              price: d.currentPrice,
              yield: d.currentYield,
              signal: d.weissSignal,
            }))
        )
      })
      .catch(() => {})
  }, [])

  if (items.length === 0) {
    return <div aria-hidden className="h-[33px] border-b border-[#1e1e2e] bg-[#09090b]" />
  }

  // Duplicate for seamless loop
  const tape = [...items, ...items]

  return (
    <div className="border-b border-[#1e1e2e] bg-[#09090b] overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center gap-0 ticker-tape-scroll"
        style={{ width: 'max-content' }}
      >
        {tape.map((item, i) => {
          const color = SIGNAL_COLOR[item.signal] ?? '#71717a'
          return (
            <Link
              key={`${item.symbol}-${i}`}
              href={`/ticker/${item.symbol}`}
              className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e1e2e]/40 transition-colors shrink-0 border-r border-[#1e1e2e]/50"
              tabIndex={i >= items.length ? -1 : 0}
            >
              <span className="font-mono font-semibold text-xs text-[#f4f4f5]">{item.symbol}</span>
              <span className="text-xs text-[#71717a]">${item.price.toFixed(2)}</span>
              <span className="text-xs font-medium" style={{ color }}>
                {(item.yield * 100).toFixed(2)}%
              </span>
            </Link>
          )
        })}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-tape-scroll {
          animation: ticker-scroll 120s linear infinite;
        }
        .ticker-tape-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
