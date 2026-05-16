'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowLeftRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { TickerResponse, SearchResult, WeissSignal } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'

const COMPARISON_ARTICLES: Record<string, string> = {
  'KO-PEP': 'ko-vs-pep-dividend-comparison',     'PEP-KO': 'ko-vs-pep-dividend-comparison',
  'XOM-CVX': 'xom-vs-cvx-dividend-comparison',   'CVX-XOM': 'xom-vs-cvx-dividend-comparison',
  'JNJ-ABBV': 'jnj-vs-abbv-dividend-comparison',  'ABBV-JNJ': 'jnj-vs-abbv-dividend-comparison',
  'O-NNN': 'o-vs-nnn-reit-dividend-comparison',   'NNN-O': 'o-vs-nnn-reit-dividend-comparison',
  'AAPL-MSFT': 'aapl-vs-msft-dividend-comparison', 'MSFT-AAPL': 'aapl-vs-msft-dividend-comparison',
  'UNH-CVS': 'unh-vs-cvs-dividend-comparison',    'CVS-UNH': 'unh-vs-cvs-dividend-comparison',
  'LMT-NOC': 'lmt-vs-noc-dividend-comparison',    'NOC-LMT': 'lmt-vs-noc-dividend-comparison',
  'AVGO-QCOM': 'avgo-vs-qcom-dividend-comparison', 'QCOM-AVGO': 'avgo-vs-qcom-dividend-comparison',
  'T-VZ': 't-vs-vz-dividend-comparison',          'VZ-T': 't-vs-vz-dividend-comparison',
  'CAT-MMM': 'cat-vs-mmm-dividend-comparison',    'MMM-CAT': 'cat-vs-mmm-dividend-comparison',
}

const SUGGESTED_PAIRS = [
  { a: 'KO',   b: 'PEP'  },
  { a: 'XOM',  b: 'CVX'  },
  { a: 'JNJ',  b: 'ABBV' },
  { a: 'AAPL', b: 'MSFT' },
  { a: 'O',    b: 'NNN'  },
  { a: 'T',    b: 'VZ'   },
  { a: 'UNH',  b: 'CVS'  },
  { a: 'LMT',  b: 'NOC'  },
  { a: 'AVGO', b: 'QCOM' },
  { a: 'CAT',  b: 'MMM'  },
]

const SIGNAL_RANK: Record<WeissSignal, number> = { undervalued: 3, fair: 2, overvalued: 1 }

function pct(v: number | null, d = 2) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(d)}%`
}

function winner(va: number | null, vb: number | null, higherBetter: boolean): 'a' | 'b' | null {
  if (va == null || vb == null) return null
  if (Math.abs(va - vb) < 0.0001) return null
  return (higherBetter ? va > vb : va < vb) ? 'a' : 'b'
}

function signalWinner(sa: WeissSignal, sb: WeissSignal): 'a' | 'b' | null {
  const ra = SIGNAL_RANK[sa], rb = SIGNAL_RANK[sb]
  if (ra === rb) return null
  return ra > rb ? 'a' : 'b'
}

function TickerPicker({
  label,
  symbol,
  companyName,
  onSelect,
}: {
  label: string
  symbol: string
  companyName?: string
  onSelect: (s: string) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(!symbol)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!symbol) setEditing(true)
  }, [symbol])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); setOpen(false); return }
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResult[] = await res.json()
        setResults(data); setOpen(data.length > 0); setActiveIndex(-1)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        if (symbol) setEditing(false)
      }
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [symbol])

  function select(s: string) {
    setOpen(false); setQuery(''); setEditing(false); onSelect(s)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); if (symbol) setEditing(false); return }
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const t = activeIndex >= 0 ? results[activeIndex] : results[0]
      if (t) select(t.symbol)
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      {symbol && !editing ? (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left bg-[#1e1e2e] border border-[#2e2e3e] rounded-xl px-4 py-3.5 hover:border-[#6366f1]/50 transition-colors group"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono font-bold text-[#f4f4f5] text-xl leading-tight">{symbol}</div>
              {companyName && (
                <div className="text-xs text-[#71717a] truncate mt-0.5">{companyName}</div>
              )}
            </div>
            <span className="text-xs text-[#52525b] group-hover:text-[#6366f1] transition-colors shrink-0">change</span>
          </div>
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder={label}
            className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-xl pl-10 pr-4 py-3.5 text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#6366f1] transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full min-w-[260px] bg-[#111118] border border-[#1e1e2e] rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onMouseDown={() => select(r.symbol)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === activeIndex ? 'bg-[#1e1e2e]' : 'hover:bg-[#1e1e2e]/50'
              } ${i > 0 ? 'border-t border-[#1e1e2e]' : ''}`}
            >
              <span className="font-mono font-semibold text-[#6366f1] w-12 shrink-0 text-sm">{r.symbol}</span>
              <span className="text-[#f4f4f5] text-sm truncate flex-1">{r.name}</span>
              {r.sector && <span className="text-xs text-[#71717a] shrink-0 hidden sm:block">{r.sector}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ComparisonTable({
  dataA,
  dataB,
  comparisonSlug,
}: {
  dataA: TickerResponse
  dataB: TickerResponse
  comparisonSlug: string | null
}) {
  const { company: cA, metrics: mA } = dataA
  const { company: cB, metrics: mB } = dataB

  const wYield   = winner(mA.currentYield, mB.currentYield, true)
  const wQuality = winner(mA.qualityScore, mB.qualityScore, true)
  const wStreak  = winner(cA.yearsIncreasingDividends, cB.yearsIncreasingDividends, true)
  const wCagr5   = winner(mA.dividendCagr5y, mB.dividendCagr5y, true)
  const wCagr10  = winner(mA.dividendCagr10y, mB.dividendCagr10y, true)
  const wSignal  = signalWinner(mA.weissSignal, mB.weissSignal)

  const wPayout = (mA.payoutRatio != null && mA.payoutRatio <= 2.0 && mB.payoutRatio != null && mB.payoutRatio <= 2.0)
    ? winner(mA.payoutRatio, mB.payoutRatio, false)
    : null

  const wFcf = (mA.fcfPayout != null && mA.fcfPayout <= 2.0 && mB.fcfPayout != null && mB.fcfPayout <= 2.0)
    ? winner(mA.fcfPayout, mB.fcfPayout, false)
    : null

  function Row({ label, vA, vB, w }: { label: string; vA: string; vB: string; w: 'a' | 'b' | null }) {
    return (
      <tr className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1e1e2e]/20 transition-colors">
        <td className="px-4 py-3 text-sm text-[#71717a]">{label}</td>
        <td className={`px-4 py-3 text-sm text-right font-medium ${w === 'a' ? 'text-[#22c55e]' : 'text-[#f4f4f5]'}`}>
          {vA}{w === 'a' && <span className="ml-1 text-[10px]">▲</span>}
        </td>
        <td className={`px-4 py-3 text-sm text-right font-medium ${w === 'b' ? 'text-[#22c55e]' : 'text-[#f4f4f5]'}`}>
          {vB}{w === 'b' && <span className="ml-1 text-[10px]">▲</span>}
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ticker headers */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
        <div />
        {[{ company: cA, metrics: mA }, { company: cB, metrics: mB }].map(({ company, metrics }) => (
          <div key={company.symbol} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="min-w-0">
                <div className="font-mono font-bold text-[#f4f4f5] text-2xl">{company.symbol}</div>
                <div className="text-xs text-[#71717a] mt-0.5 truncate">{company.name}</div>
              </div>
              <SignalBadge signal={metrics.weissSignal} size="sm" />
            </div>
            {company.sector && <div className="text-xs text-[#52525b] mb-2">{company.sector}</div>}
            <div className="flex flex-wrap gap-1">
              {company.isDividendKing && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20">King</span>
              )}
              {company.isDividendAristocrat && !company.isDividendKing && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/20">Aristocrat</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Metric</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#f4f4f5]">{cA.symbol}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#f4f4f5]">{cB.symbol}</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Price" vA={`$${mA.currentPrice.toFixed(2)}`} vB={`$${mB.currentPrice.toFixed(2)}`} w={null} />
              <Row label="Annual Dividend" vA={`$${mA.annualDividend.toFixed(2)}`} vB={`$${mB.annualDividend.toFixed(2)}`} w={null} />
              <Row label="Current Yield" vA={pct(mA.currentYield)} vB={pct(mB.currentYield)} w={wYield} />
              {/* Signal row — custom because it renders a badge */}
              <tr className="border-b border-[#1e1e2e] hover:bg-[#1e1e2e]/20 transition-colors">
                <td className="px-4 py-3 text-sm text-[#71717a]">Weiss Signal</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <SignalBadge signal={mA.weissSignal} size="sm" />
                    {wSignal === 'a' && <span className="text-[10px] text-[#22c55e]">▲</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <SignalBadge signal={mB.weissSignal} size="sm" />
                    {wSignal === 'b' && <span className="text-[10px] text-[#22c55e]">▲</span>}
                  </div>
                </td>
              </tr>
              <Row label="Quality Score" vA={`${mA.qualityScore}/100`} vB={`${mB.qualityScore}/100`} w={wQuality} />
              <Row
                label="Dividend Streak"
                vA={cA.yearsIncreasingDividends > 0 ? `${cA.yearsIncreasingDividends} yrs` : '—'}
                vB={cB.yearsIncreasingDividends > 0 ? `${cB.yearsIncreasingDividends} yrs` : '—'}
                w={wStreak}
              />
              <Row label="CAGR 5Y" vA={pct(mA.dividendCagr5y, 1)} vB={pct(mB.dividendCagr5y, 1)} w={wCagr5} />
              <Row label="CAGR 10Y" vA={pct(mA.dividendCagr10y, 1)} vB={pct(mB.dividendCagr10y, 1)} w={wCagr10} />
              <Row
                label="Payout Ratio"
                vA={mA.payoutRatio != null && mA.payoutRatio <= 2.0 ? pct(mA.payoutRatio, 0) : '—'}
                vB={mB.payoutRatio != null && mB.payoutRatio <= 2.0 ? pct(mB.payoutRatio, 0) : '—'}
                w={wPayout}
              />
              <Row
                label="FCF Payout"
                vA={mA.fcfPayout != null && mA.fcfPayout <= 2.0 ? pct(mA.fcfPayout, 0) : '—'}
                vB={mB.fcfPayout != null && mB.fcfPayout <= 2.0 ? pct(mB.fcfPayout, 0) : '—'}
                w={wFcf}
              />
              <Row label="Undervalued Price" vA={`$${mA.undervaluedPrice.toFixed(2)}`} vB={`$${mB.undervaluedPrice.toFixed(2)}`} w={null} />
              <Row label="Overvalued Price" vA={`$${mA.overvaluedPrice.toFixed(2)}`} vB={`$${mB.overvaluedPrice.toFixed(2)}`} w={null} />
              <Row label="Median Yield (hist.)" vA={pct(mA.medianYield)} vB={pct(mB.medianYield)} w={null} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/analysis/${cA.symbol.toLowerCase()}`}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1e1e2e] hover:bg-[#2e2e3e] rounded-xl text-sm text-[#f4f4f5] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#71717a]" />
          {cA.symbol} Full Analysis
        </Link>
        <Link
          href={`/analysis/${cB.symbol.toLowerCase()}`}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1e1e2e] hover:bg-[#2e2e3e] rounded-xl text-sm text-[#f4f4f5] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#71717a]" />
          {cB.symbol} Full Analysis
        </Link>
      </div>

      {comparisonSlug && (
        <Link
          href={`/blog/${comparisonSlug}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#6366f1]/10 hover:bg-[#6366f1]/15 border border-[#6366f1]/20 rounded-xl text-sm text-[#6366f1] transition-colors"
        >
          Read our in-depth {cA.symbol} vs {cB.symbol} analysis →
        </Link>
      )}
    </div>
  )
}

interface CompareClientProps {
  symbolA: string
  symbolB: string
  dataA: TickerResponse | null
  dataB: TickerResponse | null
}

export function CompareClient({ symbolA, symbolB, dataA, dataB }: CompareClientProps) {
  const router = useRouter()

  function navigate(a: string, b: string) {
    const params = new URLSearchParams()
    if (a) params.set('a', a)
    if (b) params.set('b', b)
    router.push(`/compare?${params.toString()}`)
  }

  const comparisonSlug = symbolA && symbolB
    ? (COMPARISON_ARTICLES[`${symbolA}-${symbolB}`] ?? null)
    : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-1">Compare Dividend Stocks</h1>
        <p className="text-sm text-[#71717a]">
          Compare yield, Weiss signal, quality score, and dividend growth side by side.
        </p>
      </div>

      {/* Pickers */}
      <div className="flex items-center gap-3 mb-8">
        <TickerPicker
          label="First ticker..."
          symbol={symbolA}
          companyName={dataA?.company.name}
          onSelect={s => navigate(s, symbolB)}
        />
        <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#1e1e2e] text-[#52525b]">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
        <TickerPicker
          label="Second ticker..."
          symbol={symbolB}
          companyName={dataB?.company.name}
          onSelect={s => navigate(symbolA, s)}
        />
      </div>

      {dataA && dataB ? (
        <ComparisonTable dataA={dataA} dataB={dataB} comparisonSlug={comparisonSlug} />
      ) : (
        <div>
          <p className="text-sm text-[#71717a] mb-3">Popular comparisons:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PAIRS.map((p) => (
              <button
                key={`${p.a}-${p.b}`}
                onClick={() => navigate(p.a, p.b)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5] border border-[#2e2e3e] hover:border-[#6366f1]/30 transition-colors"
              >
                {p.a} vs {p.b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
