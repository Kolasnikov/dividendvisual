'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SignalBadge } from '@/components/ui/SignalBadge'
import type { WatchlistItem } from '@/lib/types'

const PAGE_SIZE = 4

function pct(v: number | null) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(2)}%`
}

export function UndervaluedCarousel({ items }: { items: WatchlistItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (items.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visible.map((row) => (
          <Link
            key={row.symbol}
            href={`/ticker/${row.symbol}`}
            className="bg-[#111118] border border-[#22c55e]/30 rounded-xl p-4 hover:border-[#22c55e]/60 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-mono font-semibold text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
                  {row.symbol}
                </div>
                <div className="text-xs text-[#71717a] mt-0.5 line-clamp-1">{row.name}</div>
              </div>
              <SignalBadge signal="undervalued" size="sm" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[#71717a]">Yield</div>
                <div className="text-[#22c55e] font-semibold">{pct(row.currentYield)}</div>
              </div>
              <div>
                <div className="text-[#71717a]">Quality</div>
                <div className={`font-semibold ${
                  row.qualityScore >= 80 ? 'text-[#22c55e]' :
                  row.qualityScore >= 60 ? 'text-[#6366f1]' :
                  row.qualityScore >= 40 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                }`}>{row.qualityScore}/100</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#52525b]">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, items.length)} of {items.length}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-1.5 rounded-lg bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
