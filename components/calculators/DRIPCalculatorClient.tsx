'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface YearData {
  year: number
  income: number
  yieldOnCost: number
}

function computeDRIP(
  investment: number,
  yieldPct: number,
  cagrPct: number,
  years: number,
): YearData[] {
  const yield_ = yieldPct / 100
  const cagr = cagrPct / 100
  // Normalize: treat share price as $100 so shares = investment / 100
  let shares = investment / 100
  let divPerShare = 100 * yield_
  const results: YearData[] = []
  for (let year = 1; year <= years; year++) {
    divPerShare *= (1 + cagr)
    const income = shares * divPerShare
    shares += income / 100
    results.push({
      year,
      income: Math.round(income),
      yieldOnCost: Math.round((shares * divPerShare / investment) * 1000) / 10,
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
      <p className="text-[#f4f4f5] font-medium">${d.income.toLocaleString()} / year</p>
      <p className="text-[#6366f1] text-xs mt-0.5">{d.yieldOnCost}% yield on cost</p>
    </div>
  )
}

export function DRIPCalculatorClient() {
  const [investmentStr, setInvestmentStr] = useState('10000')
  const [yieldStr, setYieldStr] = useState('3.00')
  const [cagrStr, setCagrStr] = useState('5.0')
  const [horizonStr, setHorizonStr] = useState('20')

  const investment = Math.max(100, parseFloat(investmentStr) || 100)
  const yieldPct = Math.max(0.1, Math.min(30, parseFloat(yieldStr) || 3))
  const cagrPct = Math.max(0, Math.min(30, parseFloat(cagrStr) || 0))
  const horizon = Math.max(1, Math.min(40, parseInt(horizonStr) || 1))

  const data = useMemo(
    () => computeDRIP(investment, yieldPct, cagrPct, horizon),
    [investment, yieldPct, cagrPct, horizon],
  )

  const year1 = data[0]?.income ?? 0
  const lastIncome = data[data.length - 1]?.income ?? 0
  const lastYoc = data[data.length - 1]?.yieldOnCost ?? 0
  const totalIncome = data.reduce((s, d) => s + d.income, 0)

  function clamp(val: string, min: number, max: number, decimals: number): string {
    return Math.max(min, Math.min(max, parseFloat(val) || min)).toFixed(decimals)
  }

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6" role="region" aria-label="Dividend reinvestment calculator">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Investment ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] text-sm">$</span>
            <input
              type="number"
              value={investmentStr}
              onChange={e => setInvestmentStr(e.target.value)}
              onBlur={() => setInvestmentStr(clamp(investmentStr, 100, 10_000_000, 0))}
              className="w-full bg-[#09090b] border border-[#1e1e2e] rounded-md pl-7 pr-3 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
              min={100}
              step={1000}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Dividend Yield (%)</label>
          <div className="relative">
            <input
              type="number"
              value={yieldStr}
              onChange={e => setYieldStr(e.target.value)}
              onBlur={() => setYieldStr(clamp(yieldStr, 0.1, 30, 2))}
              className="w-full bg-[#09090b] border border-[#1e1e2e] rounded-md px-3 pr-7 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
              min={0.1}
              max={30}
              step={0.1}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] text-sm">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Div. Growth CAGR (%)</label>
          <div className="relative">
            <input
              type="number"
              value={cagrStr}
              onChange={e => setCagrStr(e.target.value)}
              onBlur={() => setCagrStr(clamp(cagrStr, 0, 30, 1))}
              className="w-full bg-[#09090b] border border-[#1e1e2e] rounded-md px-3 pr-7 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
              min={0}
              max={30}
              step={0.5}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] text-sm">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Horizon (years)</label>
          <input
            type="number"
            value={horizonStr}
            onChange={e => setHorizonStr(e.target.value)}
            onBlur={() => setHorizonStr(clamp(horizonStr, 1, 40, 0))}
            className="w-full bg-[#09090b] border border-[#1e1e2e] rounded-md px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]"
            min={1}
            max={40}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Year 1 Income', value: `$${year1.toLocaleString()}` },
          { label: `Year ${horizon} Income`, value: `$${lastIncome.toLocaleString()}` },
          { label: 'Yield on Cost', value: `${lastYoc}%` },
          { label: 'Total Income', value: `$${totalIncome.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#09090b] rounded-lg p-3 text-center">
            <p className="text-xs text-[#71717a] mb-1">{label}</p>
            <p className="text-base font-semibold text-[#f4f4f5]">{value}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <Bar dataKey="income" fill="#6366f1" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={{ stroke: '#1e1e2e' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e1e2e' }} />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-[#71717a] mt-3 text-center">
        Assumes dividends reinvested at a constant share price. Simplified model — for illustrative purposes only.
      </p>
    </div>
  )
}
