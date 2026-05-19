import type { Metadata } from 'next'
import type { Company, ComputedMetrics } from '@/lib/types'
import { WatchlistClient } from '@/components/watchlist/WatchlistClient'

export const metadata: Metadata = {
  title: 'Dividend Stocks Watchlist — Weiss Valuation Screener',
  description: 'Screener for 150+ curated dividend stocks. Filter by Weiss signal, Dividend Kings, Aristocrats, or sector. Sort by yield, quality score, or dividend CAGR.',
  alternates: {
    canonical: 'https://dividendvisual.com/dividend-screener',
  },
  robots: {
    index: false,
    follow: true,
  },
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

  const undervaluedCount = rows.filter(r => r.weissSignal === 'undervalued').length
  const sectors = [...new Set(rows.map(r => r.sector).filter(Boolean))].length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-2">Dividend Stocks Screener — Weiss Yield Valuation</h1>
        <p className="text-[#71717a] text-sm leading-relaxed">
          Screen {rows.length} curated dividend stocks — Dividend Kings, Aristocrats, REITs, and utilities — by Weiss
          valuation signal, quality score, sector, and dividend growth rate. All data updated daily.{' '}
          {undervaluedCount > 0 && (
            <span className="text-[#22c55e] font-medium">{undervaluedCount} stocks currently in historically undervalued territory</span>
          )}
          {undervaluedCount === 0 && <span>across {sectors} sectors.</span>}
        </p>
      </div>

      <WatchlistClient rows={rows} />
    </div>
  )
}
