'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { track } from '@vercel/analytics'
import Link from 'next/link'
import { Search, X, Bookmark, Download } from 'lucide-react'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { useWatchlist } from '@/hooks/useWatchlist'

type Row = Company & ComputedMetrics
type SortCol = 'quality' | 'yield' | 'cagr' | 'price' | 'payout'

const SIGNAL_FILTERS = [
  { key: '',            label: 'All signals' },
  { key: 'undervalued', label: 'Undervalued' },
  { key: 'fair',        label: 'Fair value' },
  { key: 'overvalued',  label: 'Overvalued' },
]

const BADGE_FILTERS = [
  { key: '',            label: 'All' },
  { key: 'king',        label: '👑 Kings' },
  { key: 'aristocrat',  label: 'Aristocrats' },
]

function pct(v: number | null, d = 2) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(d)}%`
}

function exportCsv(rows: Row[]) {
  const esc = (v: string | number | null | undefined) => {
    if (v == null) return ''
    const s = String(v)
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const fmt = (v: number | null, mult = 100, d = 2) =>
    v == null ? '' : (v * mult).toFixed(d)

  const headers = [
    'Symbol', 'Name', 'Sector', 'Industry', 'Signal',
    'Price', 'Yield %', 'Annual Dividend',
    'Quality Score', 'Quality Category',
    'Payout Ratio %', 'FCF Payout %',
    'CAGR 5Y %', 'CAGR 10Y %',
    'Years Increasing Dividends', 'Years No Cut',
    'Undervalued Price', 'Overvalued Price',
    'Min Yield %', 'Median Yield %', 'Max Yield %',
    'Dividend King', 'Dividend Aristocrat',
  ]

  const csvRows = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.symbol,
        esc(r.name),
        esc(r.sector),
        esc(r.industry),
        r.weissSignal,
        r.currentPrice.toFixed(2),
        fmt(r.currentYield),
        r.annualDividend.toFixed(4),
        r.qualityScore,
        esc(r.qualityCategory),
        fmt(r.payoutRatio, 100, 1),
        fmt(r.fcfPayout, 100, 1),
        fmt(r.dividendCagr5y, 100, 1),
        fmt(r.dividendCagr10y, 100, 1),
        r.yearsIncreasingDividends,
        r.yearsNoCut,
        r.undervaluedPrice.toFixed(2),
        r.overvaluedPrice.toFixed(2),
        fmt(r.historicalMinYield),
        fmt(r.medianYield),
        fmt(r.historicalMaxYield),
        r.isDividendKing ? 'Yes' : 'No',
        r.isDividendAristocrat ? 'Yes' : 'No',
      ].join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dividendvisual-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function SortTh({
  label, col, sort, order, onSort, className = '',
}: {
  label: string; col: SortCol; sort: SortCol; order: 'asc' | 'desc'
  onSort: (c: SortCol) => void; className?: string
}) {
  const active = sort === col
  return (
    <th
      className={`px-4 py-3 text-xs font-medium cursor-pointer select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(col)}
    >
      <span className={`flex items-center gap-1 ${active ? 'text-[#f4f4f5]' : 'text-[#71717a] hover:text-[#a1a1aa]'} ${className.includes('text-right') ? 'justify-end' : ''}`}>
        {label}
        {active ? (
          <span className="text-[#6366f1]">{order === 'desc' ? '↓' : '↑'}</span>
        ) : (
          <span className="text-[#3e3e4e]">↕</span>
        )}
      </span>
    </th>
  )
}

export function WatchlistClient({ rows }: { rows: Row[] }) {
  const [signal, setSignal] = useState('')
  const [badge, setBadge] = useState('')
  const [sector, setSector] = useState('')
  const [query, setQuery] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [sort, setSort] = useState<SortCol>('quality')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const { has, toggle, count: savedCount, ready: watchlistReady } = useWatchlist()

  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (signal || badge || sector) {
      track('watchlist_filtered', { signal: signal || 'all', badge: badge || 'all', sector: sector || 'all' })
    }
  }, [signal, badge, sector])

  const sectors = useMemo(() => {
    const s = new Set(rows.map((r) => r.sector).filter(Boolean) as string[])
    return Array.from(s).sort()
  }, [rows])

  const filtered = useMemo(() => {
    let out = rows
    if (savedOnly) out = out.filter((r) => has(r.symbol))
    if (signal) out = out.filter((r) => r.weissSignal === signal)
    if (badge === 'king') out = out.filter((r) => r.isDividendKing)
    if (badge === 'aristocrat') out = out.filter((r) => r.isDividendAristocrat && !r.isDividendKing)
    if (sector) out = out.filter((r) => r.sector === sector)
    if (query) {
      const q = query.toLowerCase()
      out = out.filter((r) => r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
    }
    return out
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, savedOnly, signal, badge, sector, query, watchlistReady])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = 0, vb = 0
      if (sort === 'yield')   { va = a.currentYield ?? 0;    vb = b.currentYield ?? 0 }
      else if (sort === 'cagr')   { va = a.dividendCagr5y ?? 0; vb = b.dividendCagr5y ?? 0 }
      else if (sort === 'price')  { va = a.currentPrice ?? 0;   vb = b.currentPrice ?? 0 }
      else if (sort === 'payout') { va = a.payoutRatio ?? 0;    vb = b.payoutRatio ?? 0 }
      else                        { va = a.qualityScore ?? 0;   vb = b.qualityScore ?? 0 }
      return order === 'desc' ? vb - va : va - vb
    })
  }, [filtered, sort, order])

  function toggleSort(col: SortCol) {
    if (sort === col) setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))
    else { setSort(col); setOrder('desc') }
  }

  const hasFilters = signal || badge || sector || query || savedOnly
  function resetFilters() { setSignal(''); setBadge(''); setSector(''); setQuery(''); setSavedOnly(false) }

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">

        {/* Saved filter */}
        {watchlistReady && savedCount > 0 && (
          <>
            <button
              onClick={() => setSavedOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                savedOnly
                  ? 'bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30'
                  : 'bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5]'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${savedOnly ? 'fill-[#6366f1]' : ''}`} />
              Saved ({savedCount})
            </button>
            <div className="w-px h-5 bg-[#2e2e3e]" />
          </>
        )}

        {/* Signal pills */}
        <div className="flex gap-1">
          {SIGNAL_FILTERS.map((s) => {
            const colors: Record<string, string> = {
              undervalued: signal === 'undervalued' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' : '',
              overvalued:  signal === 'overvalued'  ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' : '',
              fair:        signal === 'fair'         ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30' : '',
            }
            const active = signal === s.key
            const color = active && s.key ? colors[s.key] : ''
            return (
              <button
                key={s.key}
                onClick={() => setSignal(s.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? (color || 'bg-[#6366f1] text-white')
                    : 'bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5]'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-[#2e2e3e]" />

        {/* Badge pills */}
        <div className="flex gap-1">
          {BADGE_FILTERS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBadge(b.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                badge === b.key
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                  : 'bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5]'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-[#2e2e3e]" />

        {/* Sector dropdown */}
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="bg-[#1e1e2e] border border-[#2e2e3e] text-xs rounded-full px-3 py-1.5 focus:outline-none focus:border-[#6366f1] cursor-pointer text-[#71717a] hover:text-[#f4f4f5] transition-colors"
        >
          <option value="">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#71717a]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker..."
            className="bg-[#1e1e2e] border border-[#2e2e3e] text-xs text-[#f4f4f5] placeholder-[#71717a] rounded-full pl-7 pr-3 py-1.5 focus:outline-none focus:border-[#6366f1] w-32 transition-colors"
          />
        </div>

        {/* Count + actions */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#52525b]">
            {sorted.length === rows.length
              ? `${rows.length} stocks`
              : `${sorted.length} of ${rows.length}`}
          </span>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-[#71717a] hover:text-[#f4f4f5] transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <button
            onClick={() => {
              track('csv_exported', { count: sorted.length, filtered: !!hasFilters })
              exportCsv(sorted)
            }}
            title={`Export ${sorted.length} rows as CSV`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5] transition-colors border border-[#2e2e3e] hover:border-[#6366f1]/40"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Company</th>
                <SortTh label="Price"   col="price"   sort={sort} order={order} onSort={toggleSort} className="text-right" />
                <SortTh label="Yield"   col="yield"   sort={sort} order={order} onSort={toggleSort} className="text-right" />
                <th className="text-center px-4 py-3 text-xs font-medium text-[#71717a]">Signal</th>
                <SortTh label="Quality" col="quality" sort={sort} order={order} onSort={toggleSort} className="text-right" />
                <SortTh label="CAGR 5Y" col="cagr"    sort={sort} order={order} onSort={toggleSort} className="text-right" />
                <SortTh label="Payout"  col="payout"  sort={sort} order={order} onSort={toggleSort} className="text-right" />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#71717a]">
                    No stocks match your filters.{' '}
                    <button onClick={resetFilters} className="text-[#6366f1] hover:text-[#818cf8]">Clear filters</button>
                  </td>
                </tr>
              ) : sorted.map((row) => (
                <tr
                  key={row.symbol}
                  className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1e1e2e]/30 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <Link href={`/ticker/${row.symbol}`} className="flex flex-col">
                      <span className="font-mono font-medium text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
                        {row.symbol}
                      </span>
                      <span className="text-xs text-[#71717a] truncate max-w-[160px]">{row.name}</span>
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
                    {row.payoutRatio != null && row.payoutRatio <= 2.0
                      ? pct(row.payoutRatio, 0)
                      : <span className="text-[#71717a]/40">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
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
                      {watchlistReady && (
                        <button
                          onClick={(e) => { e.preventDefault(); toggle(row.symbol) }}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          title={has(row.symbol) ? 'Remove from saved' : 'Save'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${has(row.symbol) ? 'fill-[#6366f1] text-[#6366f1] opacity-100' : 'text-[#71717a]'}`} />
                        </button>
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
