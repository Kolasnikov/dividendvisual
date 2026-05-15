'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { ComputedMetrics } from '@/lib/types'

interface DRIPChartProps {
  metrics: ComputedMetrics
}

interface YearData {
  year: number
  income: number
  yieldOnCost: number
  shares: number
}

function computeDRIP(
  initialInvestment: number,
  initialYield: number,
  dividendCagr: number,
  horizonYears: number,
  currentPrice: number
): YearData[] {
  const results: YearData[] = []
  let shares = initialInvestment / currentPrice
  let annualDivPerShare = currentPrice * initialYield

  for (let year = 1; year <= horizonYears; year++) {
    annualDivPerShare *= 1 + dividendCagr
    const income = shares * annualDivPerShare
    // Reinvest dividends — buy more shares at current price (simplified: price unchanged)
    shares += income / currentPrice
    const yieldOnCost = (shares * annualDivPerShare) / initialInvestment

    results.push({
      year,
      income: Math.round(income * 100) / 100,
      yieldOnCost: Math.round(yieldOnCost * 10000) / 100,
      shares: Math.round(shares * 100) / 100,
    })
  }
  return results
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as YearData
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 text-sm shadow-xl">
      <p className="text-[#71717a] text-xs mb-1.5">Year {label}</p>
      <p className="text-[#f4f4f5] font-medium">
        ${d.income.toLocaleString('en-US', { maximumFractionDigits: 0 })} / year
      </p>
      <p className="text-[#6366f1] text-xs mt-0.5">{d.yieldOnCost}% yield on cost</p>
    </div>
  )
}

export function DRIPChart({ metrics }: DRIPChartProps) {
  const defaultCagr = metrics.dividendCagr5y != null
    ? Math.round(metrics.dividendCagr5y * 1000) / 10
    : 5.0

  const [investmentStr, setInvestmentStr] = useState('10000')
  const [horizonStr, setHorizonStr] = useState('10')
  const [cagrStr, setCagrStr] = useState(String(defaultCagr))

  const investment = Math.max(100, parseFloat(investmentStr) || 100)
  const horizon = Math.max(1, Math.min(40, parseInt(horizonStr) || 1))
  const cagrPct = Math.max(0, Math.min(30, parseFloat(cagrStr) || 0))

  const data = useMemo(() => {
    if (metrics.currentYield <= 0 || metrics.currentPrice <= 0) return []
    return computeDRIP(
      investment,
      metrics.currentYield,
      cagrPct / 100,
      horizon,
      metrics.currentPrice
    )
  }, [investment, horizon, cagrPct, metrics])

  const year1Income = data[0]?.income ?? 0
  const lastIncome = data[data.length - 1]?.income ?? 0
  const lastYoc = data[data.length - 1]?.yieldOnCost ?? 0
  const totalIncome = data.reduce((s, d) => s + d.income, 0)

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <h3 className="text-sm font-medium text-[#71717a] mb-5">Dividend Compounder (DRIP)</h3>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Initial Investment</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] text-sm">$</span>
            <input
              type="number"
              value={investmentStr}
              onChange={(e) => setInvestmentStr(e.target.value)}
              onBlur={() => setInvestmentStr(String(Math.max(100, parseFloat(investmentStr) || 100)))}
              className="w-full bg-[#09090b] border border-[#1e1e2e] rounded-md pl-7 pr-3 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
              min={100}
              step={1000}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Horizon (years)</label>
          <input
            type="number"
            value={horizonStr}
            onChange={(e) => setHorizonStr(e.target.value)}
            onBlur={() => setHorizonStr(String(Math.max(1, Math.min(40, parseInt(horizonStr) || 1))))}
            className="w-full bg-[#09090b] border border-[#1e1e2e] rounded-md px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
            min={1}
            max={40}
          />
        </div>
        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Div. CAGR (%)</label>
          <input
            type="number"
            value={cagrStr}
            onChange={(e) => setCagrStr(e.target.value)}
            onBlur={() => setCagrStr(String(Math.max(0, Math.min(30, parseFloat(cagrStr) || 0))))}
            className="w-full bg-[#09090b] border border-[#1e1e2e] rounded-md px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
            min={0}
            max={30}
            step={0.5}
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Year 1 Income', value: `$${year1Income.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
          { label: `Year ${horizon} Income`, value: `$${lastIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
          { label: 'Yield on Cost', value: `${lastYoc}%` },
          { label: 'Total Income', value: `$${totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#09090b] rounded-lg p-3 text-center">
            <p className="text-xs text-[#71717a] mb-1">{label}</p>
            <p className="text-base font-semibold text-[#f4f4f5]">{value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <Bar dataKey="income" fill="#6366f1" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={{ stroke: '#1e1e2e' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) =>
              v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`
            }
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e1e2e' }} />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-[#71717a] mt-3 text-center">
        Assumes dividends reinvested at current price. Simplified model — for illustrative purposes only.
      </p>
    </div>
  )
}
