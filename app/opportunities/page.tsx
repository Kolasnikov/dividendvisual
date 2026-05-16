import type { Metadata } from 'next'
import Link from 'next/link'
import type { WatchlistItem } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'

export const metadata: Metadata = {
  title: 'Dividend Opportunities — Undervalued Stocks Right Now',
  description: 'Dividend stocks currently trading in historically undervalued territory, ranked by quality score. Based on the Geraldine Weiss dividend yield valuation method.',
  openGraph: {
    title: 'Dividend Opportunities | DividendVisual',
    description: 'Dividend stocks currently trading in historically undervalued territory, ranked by quality score.',
    url: 'https://dividendvisual.com/opportunities',
  },
}

async function getWatchlist(): Promise<WatchlistItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/watchlist?sort=quality&order=desc`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

function pct(v: number | null, d = 2) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(d)}%`
}

// How close is current yield to the undervalued threshold (0–100%)
function yieldProximity(item: WatchlistItem): number {
  if (!item.historicalMaxYield || !item.historicalMinYield) return 0
  const range = item.historicalMaxYield - item.historicalMinYield
  if (range <= 0) return 0
  return Math.min(100, Math.round(((item.currentYield - item.historicalMinYield) / range) * 100))
}

function OpportunityCard({ item }: { item: WatchlistItem }) {
  const proximity = yieldProximity(item)
  const scoreColor = item.qualityScore >= 80 ? '#22c55e'
    : item.qualityScore >= 65 ? '#6366f1'
    : item.qualityScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <Link
      href={`/ticker/${item.symbol}`}
      className="block bg-[#111118] border border-[#22c55e]/25 rounded-xl p-5 hover:border-[#22c55e]/50 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-lg text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
              {item.symbol}
            </span>
            <SignalBadge signal={item.weissSignal} size="sm" />
          </div>
          <p className="text-xs text-[#71717a] line-clamp-1 max-w-[200px]">{item.name}</p>
          {item.sector && <p className="text-[10px] text-[#52525b] mt-0.5">{item.sector}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-[#f4f4f5]">${item.currentPrice.toFixed(2)}</p>
          <p className="text-sm font-semibold text-[#22c55e]">{pct(item.currentYield)} yield</p>
        </div>
      </div>

      {/* Yield position bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-[#52525b] mb-1.5">
          <span>Min {pct(item.historicalMinYield)}</span>
          <span className="text-[#22c55e] font-medium">{proximity}% of range</span>
          <span>Max {pct(item.historicalMaxYield)}</span>
        </div>
        <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#6366f1] to-[#22c55e] transition-all"
            style={{ width: `${proximity}%` }}
          />
        </div>
        <p className="text-[10px] text-[#52525b] mt-1">
          Undervalued below ${item.undervaluedPrice.toFixed(2)} · Overvalued above ${item.overvaluedPrice.toFixed(2)}
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#09090b] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#52525b] mb-0.5">Quality</p>
          <p className="text-sm font-bold" style={{ color: scoreColor }}>{item.qualityScore}</p>
        </div>
        <div className="bg-[#09090b] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#52525b] mb-0.5">CAGR 5Y</p>
          <p className="text-sm font-semibold text-[#f4f4f5]">{pct(item.dividendCagr5y, 1)}</p>
        </div>
        <div className="bg-[#09090b] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#52525b] mb-0.5">Payout</p>
          <p className="text-sm font-semibold text-[#f4f4f5]">
            {item.payoutRatio != null && item.payoutRatio <= 2.0 ? pct(item.payoutRatio, 0) : '—'}
          </p>
        </div>
      </div>

      {/* Badges + streak */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {item.isDividendKing && <DividendBadge type="king" />}
          {item.isDividendAristocrat && !item.isDividendKing && <DividendBadge type="aristocrat" />}
        </div>
        {item.yearsIncreasingDividends > 0 && (
          <span className="text-[10px] text-[#52525b]">
            {item.yearsIncreasingDividends}yr streak
          </span>
        )}
      </div>
    </Link>
  )
}

function WatchCard({ item }: { item: WatchlistItem }) {
  const proximity = yieldProximity(item)
  return (
    <Link
      href={`/ticker/${item.symbol}`}
      className="flex items-center gap-4 bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3 hover:border-[#6366f1]/30 transition-all group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-sm text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
            {item.symbol}
          </span>
          <span className="text-xs text-[#71717a] truncate">{item.name}</span>
        </div>
        <div className="mt-1.5 h-1 bg-[#1e1e2e] rounded-full overflow-hidden w-32">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#6366f1] to-[#22c55e]"
            style={{ width: `${proximity}%` }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-[#f4f4f5]">{pct(item.currentYield)}</p>
        <p className="text-[10px] text-[#52525b]">{proximity}% of range</p>
      </div>
      <div className="text-right shrink-0 w-10">
        <p className="text-sm font-bold" style={{
          color: item.qualityScore >= 65 ? '#6366f1' : item.qualityScore >= 50 ? '#f59e0b' : '#71717a'
        }}>{item.qualityScore}</p>
        <p className="text-[10px] text-[#52525b]">score</p>
      </div>
    </Link>
  )
}

export default async function OpportunitiesPage() {
  const all = await getWatchlist()

  const strong = all.filter((s) => s.weissSignal === 'undervalued')
  const watching = all
    .filter((s) => s.weissSignal === 'fair' && s.qualityScore >= 55)
    .map((s) => ({ ...s, proximity: yieldProximity(s) }))
    .filter((s) => s.proximity >= 60)
    .sort((a, b) => b.proximity - a.proximity)
    .slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold text-[#f4f4f5]">Dividend Opportunities</h1>
          {strong.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/25 text-xs font-semibold text-[#22c55e]">
              {strong.length} undervalued
            </span>
          )}
        </div>
        <p className="text-[#71717a] max-w-2xl">
          Dividend stocks currently trading in historically undervalued territory based on 10 years of yield data.
          Sorted by quality score — higher means a safer, more reliable dividend.
        </p>
      </div>

      {/* Strong opportunities */}
      {strong.length > 0 ? (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-[#f4f4f5] uppercase tracking-wide">
              Undervalued Now
            </h2>
            <div className="h-px flex-1 bg-[#1e1e2e]" />
            <span className="text-xs text-[#71717a]">Yield near 10-year high · Weiss signal: Undervalued</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {strong.map((item) => (
              <OpportunityCard key={item.symbol} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="mb-12 bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 text-center">
          <p className="text-[#f4f4f5] font-medium mb-1">No undervalued stocks right now</p>
          <p className="text-sm text-[#71717a]">The market is currently pricing most dividend stocks at or above fair value. Check back when conditions change.</p>
        </div>
      )}

      {/* Worth watching */}
      {watching.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-[#f4f4f5] uppercase tracking-wide">
              Worth Watching
            </h2>
            <div className="h-px flex-1 bg-[#1e1e2e]" />
            <span className="text-xs text-[#71717a]">Fair value · Yield approaching undervalued zone</span>
          </div>
          <div className="space-y-2">
            {watching.map((item) => (
              <WatchCard key={item.symbol} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Footer note */}
      <p className="text-xs text-[#52525b] mt-10 text-center">
        Signals based on 10-year dividend yield history. Updated daily.{' '}
        <Link href="/blog/geraldine-weiss-dividend-valuation-method" className="text-[#6366f1] hover:text-[#818cf8]">
          How the Weiss method works →
        </Link>
      </p>
    </div>
  )
}
