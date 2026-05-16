import type { Metadata } from 'next'
import type { Company, ComputedMetrics } from '@/lib/types'
import { WatchlistClient } from '@/components/watchlist/WatchlistClient'

export const metadata: Metadata = {
  title: 'Dividend Stocks Watchlist — Weiss Valuation Screener',
  description: 'Screener for 150+ curated dividend stocks. Filter by Weiss signal, Dividend Kings, Aristocrats, or sector. Sort by yield, quality score, or dividend CAGR.',
  openGraph: {
    title: 'Dividend Stocks Watchlist | DividendVisual',
    description: 'Screener for 150+ curated dividend stocks. Filter by signal, Kings, Aristocrats, or sector.',
    url: 'https://dividendvisual.com/watchlist',
  },
}

type WatchlistRow = Company & ComputedMetrics

async function getWatchlist(): Promise<WatchlistRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/watchlist?sort=quality&order=desc`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

export default async function WatchlistPage() {
  const rows = await getWatchlist()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-1">Dividend Stocks Screener</h1>
        <p className="text-[#71717a] text-sm">
          {rows.length} curated dividend stocks — filter by signal, badge, or sector. Click column headers to sort.
        </p>
      </div>

      <WatchlistClient rows={rows} />
    </div>
  )
}
