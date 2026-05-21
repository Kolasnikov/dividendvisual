'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { Trash2, PlusCircle } from 'lucide-react'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { usePortfolio } from '@/hooks/usePortfolio'

type Row = Company & ComputedMetrics

interface Props {
  universe: Row[]
}

function fmt(v: number, prefix = '', suffix = '', decimals = 2) {
  return `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
}

function pct(v: number | null, d = 2) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(d)}%`
}

const SIGNAL_COLOR: Record<string, string> = {
  undervalued: '#22c55e',
  fair: '#f59e0b',
  overvalued: '#ef4444',
}

export function PortfolioClient({ universe }: Props) {
  const { positions, add, remove, ready } = usePortfolio()
  const [ticker, setTicker] = useState('')
  const [shares, setShares] = useState('')
  const [costPerShare, setCostPerShare] = useState('')
  const [error, setError] = useState('')

  const symbolMap = useMemo(
    () => new Map(universe.map((r) => [r.symbol, r])),
    [universe],
  )

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const sym = ticker.trim().toUpperCase()
    const sh = parseFloat(shares)
    if (!sym) { setError('Enter a ticker symbol.'); return }
    if (!symbolMap.has(sym)) { setError(`${sym} is not in the DividendVisual universe.`); return }
    if (!sh || sh <= 0) { setError('Enter a valid share count.'); return }
    const cps = costPerShare ? parseFloat(costPerShare) : undefined
    if (costPerShare && (!cps || cps <= 0)) { setError('Enter a valid cost per share.'); return }
    add({ symbol: sym, shares: sh, costPerShare: cps })
    track('portfolio_add', { symbol: sym, shares: sh })
    setTicker(''); setShares(''); setCostPerShare(''); setError('')
  }

  const enriched = useMemo(
    () =>
      positions.map((pos) => {
        const row = symbolMap.get(pos.symbol)
        const value = row ? pos.shares * row.currentPrice : 0
        const annualIncome = row ? pos.shares * row.annualDividend : 0
        const yoc = pos.costPerShare
          ? (row ? row.annualDividend / pos.costPerShare : 0)
          : null
        const totalCost = pos.costPerShare ? pos.shares * pos.costPerShare : null
        const pnl = totalCost != null ? ((value - totalCost) / totalCost) : null
        return { ...pos, row, value, annualIncome, yoc, totalCost, pnl }
      }),
    [positions, symbolMap],
  )

  const summary = useMemo(() => {
    const totalValue = enriched.reduce((s, p) => s + p.value, 0)
    const totalIncome = enriched.reduce((s, p) => s + p.annualIncome, 0)
    const totalCost = enriched.every((p) => p.totalCost != null)
      ? enriched.reduce((s, p) => s + (p.totalCost ?? 0), 0)
      : null
    const portfolioYield = totalValue > 0 ? totalIncome / totalValue : 0
    const yoc = totalCost != null && totalCost > 0 ? totalIncome / totalCost : null
    const avgQuality = enriched.length > 0 && totalValue > 0
      ? enriched.reduce((s, p) => s + (p.row?.qualityScore ?? 0) * p.value, 0) / totalValue
      : null
    const signals = enriched.reduce(
      (acc, p) => {
        const sig = p.row?.weissSignal ?? 'fair'
        acc[sig] = (acc[sig] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return { totalValue, totalIncome, portfolioYield, yoc, avgQuality, signals }
  }, [enriched])

  if (!ready) return null

  return (
    <div>
      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 mb-8">
        <p className="text-xs font-medium text-[#71717a] uppercase tracking-wide mb-4">Add Position</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <label className="text-[10px] text-[#71717a] uppercase tracking-wide">Ticker</label>
            <input
              list="portfolio-symbols"
              value={ticker}
              onChange={(e) => { setTicker(e.target.value.toUpperCase()); setError('') }}
              placeholder="KO"
              className="bg-[#09090b] border border-[#2e2e3e] text-sm text-[#f4f4f5] placeholder-[#52525b] rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1] font-mono uppercase"
            />
            <datalist id="portfolio-symbols">
              {universe.map((r) => (
                <option key={r.symbol} value={r.symbol}>{r.name}</option>
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-[10px] text-[#71717a] uppercase tracking-wide">Shares</label>
            <input
              type="number"
              min="0.001"
              step="any"
              value={shares}
              onChange={(e) => { setShares(e.target.value); setError('') }}
              placeholder="100"
              className="bg-[#09090b] border border-[#2e2e3e] text-sm text-[#f4f4f5] placeholder-[#52525b] rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-36">
            <label className="text-[10px] text-[#71717a] uppercase tracking-wide">
              Cost / Share <span className="normal-case text-[#3e3e4e]">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={costPerShare}
              onChange={(e) => { setCostPerShare(e.target.value); setError('') }}
              placeholder="52.50"
              className="bg-[#09090b] border border-[#2e2e3e] text-sm text-[#f4f4f5] placeholder-[#52525b] rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#818cf8] transition-colors self-end"
          >
            <PlusCircle className="w-4 h-4" />
            Add
          </button>
        </div>
        {error && <p className="text-xs text-[#ef4444] mt-2">{error}</p>}
      </form>

      {enriched.length === 0 ? (
        <div className="text-center py-16 text-[#71717a]">
          <p className="text-sm font-medium text-[#f4f4f5] mb-2">No positions yet</p>
          <p className="text-xs max-w-sm mx-auto leading-relaxed">
            Add stocks above, or browse the{' '}
            <Link href="/watchlist" className="text-[#6366f1] hover:text-[#818cf8]">screener</Link>{' '}
            to find candidates.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {[
              { label: 'Portfolio Value', value: fmt(summary.totalValue, '$') },
              { label: 'Annual Income', value: fmt(summary.totalIncome, '$') },
              { label: 'Portfolio Yield', value: pct(summary.portfolioYield) },
              { label: 'Avg Quality', value: summary.avgQuality != null ? `${summary.avgQuality.toFixed(0)}/100` : '—' },
              { label: 'Yield on Cost', value: summary.yoc != null ? pct(summary.yoc) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 text-center">
                <p className="text-[10px] text-[#71717a] uppercase tracking-wide mb-1">{label}</p>
                <p className="text-lg font-bold text-[#f4f4f5]">{value}</p>
              </div>
            ))}
          </div>

          {/* Weiss pulse */}
          {Object.keys(summary.signals).length > 0 && (
            <div className="flex items-center gap-4 mb-6 px-1">
              <span className="text-xs text-[#52525b]">Weiss pulse:</span>
              {(['undervalued', 'fair', 'overvalued'] as const).map((sig) => {
                const count = summary.signals[sig] ?? 0
                if (!count) return null
                return (
                  <span key={sig} className="flex items-center gap-1.5 text-xs" style={{ color: SIGNAL_COLOR[sig] }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: SIGNAL_COLOR[sig] }} />
                    {count} {sig}
                  </span>
                )
              })}
            </div>
          )}

          {/* Positions table */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e2e]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Company</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">Shares</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">Price</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">Value</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">Ann. Income</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">Yield</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#71717a]">Signal</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">Quality</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">YoC</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#71717a]">P&amp;L</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((pos) => {
                    const r = pos.row
                    const scoreColor = !r ? '#71717a'
                      : r.qualityScore >= 80 ? '#22c55e'
                      : r.qualityScore >= 60 ? '#6366f1'
                      : r.qualityScore >= 40 ? '#f59e0b' : '#ef4444'
                    const pnlColor = pos.pnl == null ? ''
                      : pos.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    return (
                      <tr key={pos.symbol} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1e1e2e]/30 transition-colors group">
                        <td className="px-4 py-3">
                          <Link href={`/ticker/${pos.symbol}`} className="flex flex-col">
                            <span className="font-mono font-medium text-[#f4f4f5] hover:text-[#6366f1] transition-colors">
                              {pos.symbol}
                            </span>
                            {r && <span className="text-xs text-[#71717a] truncate max-w-[160px]">{r.name}</span>}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right text-[#f4f4f5]">
                          {pos.shares.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </td>
                        <td className="px-4 py-3 text-right text-[#f4f4f5]">
                          {r ? `$${r.currentPrice.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#f4f4f5]">
                          {pos.value ? fmt(pos.value, '$') : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-[#22c55e] font-medium">
                          {pos.annualIncome ? fmt(pos.annualIncome, '$') : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-[#f4f4f5]">
                          {r ? pct(r.currentYield) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {r ? <SignalBadge signal={r.weissSignal} size="sm" /> : <span className="text-[#52525b]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r ? (
                            <span className="font-semibold" style={{ color: scoreColor }}>
                              {r.qualityScore}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-[#f4f4f5]">
                          {pos.yoc != null ? pct(pos.yoc) : <span className="text-[#3e3e4e]">—</span>}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${pnlColor}`}>
                          {pos.pnl != null
                            ? `${pos.pnl >= 0 ? '+' : ''}${(pos.pnl * 100).toFixed(1)}%`
                            : <span className="text-[#3e3e4e]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              track('portfolio_remove', { symbol: pos.symbol })
                              remove(pos.symbol)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#71717a] hover:text-[#ef4444]"
                            title={`Remove ${pos.symbol}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-[#3e3e4e] mt-4 text-center">
            Saved locally in your browser. Prices updated daily.
          </p>
        </>
      )}
    </div>
  )
}
