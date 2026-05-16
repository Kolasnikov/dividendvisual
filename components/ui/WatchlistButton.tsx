'use client'

import { Bookmark } from 'lucide-react'
import { useWatchlist } from '@/hooks/useWatchlist'

interface WatchlistButtonProps {
  symbol: string
}

export function WatchlistButton({ symbol }: WatchlistButtonProps) {
  const { has, toggle, ready } = useWatchlist()

  if (!ready) return null

  const saved = has(symbol)

  return (
    <button
      onClick={() => toggle(symbol)}
      title={saved ? 'Remove from watchlist' : 'Save to watchlist'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
        saved
          ? 'bg-[#6366f1]/15 border-[#6366f1]/40 text-[#6366f1]'
          : 'bg-[#1e1e2e] border-[#2e2e3e] text-[#71717a] hover:border-[#6366f1]/30 hover:text-[#f4f4f5]'
      }`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#6366f1]' : ''}`} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
