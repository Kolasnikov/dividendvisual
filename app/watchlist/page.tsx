import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'

export const metadata: Metadata = {
  title: 'Dividend Stocks Watchlist — Weiss Valuation Screener',
  description: 'Screener for 30+ curated dividend stocks. Sort by yield, quality score, Weiss valuation signal, or dividend CAGR. Includes Dividend Kings, Aristocrats, REITs, and high-yield payers.',
  openGraph: {
    title: 'Dividend Stocks Watchlist | DividendVisual',
    description: 'Screener for 30+ curated dividend stocks. Sort by yield, quality score, Weiss valuation signal, or dividend CAGR.',
    url: 'https://dividendvisual.com/watchlist',
  },
}

type WatchlistRow = Company & ComputedMetrics

async function getWatchlist(sort = 'quality', order = 'desc'): Promise<WatchlistRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/watchlist?sort=${sort}&order=${order}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

interface PageProps {
  searchParams: Promise<{ sort?: string; order?: string }>
}

function SortHeader({
  label,
  column,
  currentSort,
  currentOrder,
}: {
  label: string
  column: string
  currentSort: string
  currentOrder: string
}) {
  const isActive = currentSort === column
  const nextOrder = isActive && currentOrder === 'desc' ? 'asc' : 'desc'
  return (
    <Link
      href={`/watchlist?sort=${column}&order=${nextOrder}`}
      className={`flex items-center gap-1 hover:text-[#f4f4f5] transition-colors ${
        isActive ? 'text-[#f4f4f5]' : 'text-[#71717a]'
      }`}
    >
      {label}
      {isActive && <span className="text-[#6366f1]">{currentOrder === 'desc' ? '↓' : '↑'}</span>}
    </Link>
  )
}

function pct(v: number | null, decimals = 2): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(decimals)}%`
}

export default async function WatchlistPage({ searchParams }: PageProps) {
  const { sort = 'quality', order = 'desc' } = await searchParams
  const rows = await getWatchlist(sort, order)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-1">Watchlist</h1>
        <p className="text-[#71717a] text-sm">
          {rows.length} curated dividend stocks. Click any column header to sort.
        </p>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left px-4 py-3 text-xs font-medium">
                  <SortHeader label="Company" column="price" currentSort={sort} currentOrder={order} />
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium">
                  <SortHeader label="Price" column="price" currentSort={sort} currentOrder={order} />
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium">
                  <SortHeader label="Yield" column="yield" currentSort={sort} currentOrder={order} />
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium">
                  <SortHeader label="Signal" column="signal" currentSort={sort} currentOrder={order} />
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium">
                  <SortHeader label="Quality" column="quality" currentSort={sort} currentOrder={order} />
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium">
                  <SortHeader label="CAGR 5Y" column="cagr" currentSort={sort} currentOrder={order} />
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">
                  Payout
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.symbol}
                  className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1e1e2e]/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <Link href={`/ticker/${row.symbol}`} className="flex flex-col">
                      <span className="font-mono font-medium text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
                        {row.symbol}
                      </span>
                      <span className="text-xs text-[#71717a] truncate max-w-[180px]">{row.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#f4f4f5]">
                    ${row.currentPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#f4f4f5]">
                    {pct(row.currentYield)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SignalBadge signal={row.weissSignal} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${
                      row.qualityScore >= 80 ? 'text-[#22c55e]' :
                      row.qualityScore >= 60 ? 'text-[#6366f1]' :
                      row.qualityScore >= 40 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                    }`}>
                      {row.qualityScore}
                    </span>
                    <span className="text-[#71717a] text-xs ml-0.5">/100</span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#f4f4f5]">
                    {pct(row.dividendCagr5y, 1)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#71717a]">
                    {/* Cap display at 200% — higher values are data artifacts */}
                    {row.payoutRatio != null && row.payoutRatio <= 2.0
                      ? pct(row.payoutRatio, 0)
                      : <span className="text-[#71717a]/40">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {row.isDividendKing && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20 whitespace-nowrap">
                          King
                        </span>
                      )}
                      {row.isDividendAristocrat && !row.isDividendKing && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/20 whitespace-nowrap">
                          Arist.
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
