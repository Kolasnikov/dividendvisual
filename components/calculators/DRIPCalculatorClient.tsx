'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, RotateCcw } from 'lucide-react'
import { track } from '@vercel/analytics'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface YearData {
  year: number
  dripIncome: number
  cashIncome: number
  contributed: number
  yieldOnCost: number
}

interface DRIPCalculatorClientProps {
  initialInvestment?: number
  initialMonthlyContribution?: number
  initialYield?: number
  initialCagr?: number
  initialHorizon?: number
  ticker?: string
}

function currency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function computeProjection(
  initialInvestment: number,
  monthlyContribution: number,
  yieldPct: number,
  cagrPct: number,
  years: number,
): YearData[] {
  const sharePrice = 100
  const annualGrowth = cagrPct / 100
  let dividendPerShare = sharePrice * (yieldPct / 100)
  let dripShares = initialInvestment / sharePrice
  let cashShares = initialInvestment / sharePrice
  let contributed = initialInvestment
  const results: YearData[] = []

  for (let year = 1; year <= years; year++) {
    let dripIncome = 0
    let cashIncome = 0

    for (let month = 1; month <= 12; month++) {
      if (monthlyContribution > 0) {
        const newShares = monthlyContribution / sharePrice
        dripShares += newShares
        cashShares += newShares
        contributed += monthlyContribution
      }

      const monthlyDividendPerShare = dividendPerShare / 12
      const dripPayment = dripShares * monthlyDividendPerShare
      const cashPayment = cashShares * monthlyDividendPerShare
      dripIncome += dripPayment
      cashIncome += cashPayment
      dripShares += dripPayment / sharePrice
    }

    results.push({
      year,
      dripIncome: Math.round(dripIncome),
      cashIncome: Math.round(cashIncome),
      contributed: Math.round(contributed),
      yieldOnCost: Math.round(((dripIncome / contributed) * 100) * 10) / 10,
    })

    dividendPerShare *= 1 + annualGrowth
  }

  return results
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload as YearData
  return (
    <div className="rounded-lg border border-[#2e2e3e] bg-[#111118] p-3 text-sm shadow-xl">
      <p className="mb-2 text-xs text-[#71717a]">Year {label}</p>
      <p className="font-medium text-[#818cf8]">{currency(data.dripIncome)} with DRIP</p>
      <p className="mt-1 text-xs text-[#a1a1aa]">{currency(data.cashIncome)} without reinvestment</p>
      <p className="mt-1 text-xs text-[#22c55e]">{data.yieldOnCost}% on contributed capital</p>
    </div>
  )
}

function clamp(value: string, min: number, max: number, decimals: number) {
  return Math.max(min, Math.min(max, parseFloat(value) || min)).toFixed(decimals)
}

export function DRIPCalculatorClient({
  initialInvestment = 10_000,
  initialMonthlyContribution = 0,
  initialYield = 3,
  initialCagr = 5,
  initialHorizon = 20,
  ticker,
}: DRIPCalculatorClientProps = {}) {
  const [investmentStr, setInvestmentStr] = useState(String(initialInvestment))
  const [contributionStr, setContributionStr] = useState(String(initialMonthlyContribution))
  const [yieldStr, setYieldStr] = useState(initialYield.toFixed(2))
  const [cagrStr, setCagrStr] = useState(initialCagr.toFixed(1))
  const [horizonStr, setHorizonStr] = useState(String(initialHorizon))
  const [copied, setCopied] = useState(false)

  const investment = Math.max(100, Math.min(10_000_000, parseFloat(investmentStr) || 100))
  const monthlyContribution = Math.max(0, Math.min(100_000, parseFloat(contributionStr) || 0))
  const yieldPct = Math.max(0.1, Math.min(30, parseFloat(yieldStr) || 3))
  const cagrPct = Math.max(0, Math.min(30, parseFloat(cagrStr) || 0))
  const horizon = Math.max(1, Math.min(40, parseInt(horizonStr) || 1))

  const data = useMemo(
    () => computeProjection(investment, monthlyContribution, yieldPct, cagrPct, horizon),
    [investment, monthlyContribution, yieldPct, cagrPct, horizon],
  )

  const year1 = data[0]
  const finalYear = data[data.length - 1]
  const totalDripIncome = data.reduce((sum, year) => sum + year.dripIncome, 0)
  const totalCashIncome = data.reduce((sum, year) => sum + year.cashIncome, 0)
  const dripAdvantage = Math.max(0, finalYear.dripIncome - finalYear.cashIncome)
  const tableRows = data.filter((row) => row.year === 1 || row.year === horizon || row.year % 5 === 0)

  function trackCalculation(field: string) {
    track('drip_calculator_updated', {
      field,
      ticker: ticker ?? 'custom',
      horizon,
      has_monthly_contribution: monthlyContribution > 0,
    })
  }

  async function shareProjection() {
    const params = new URLSearchParams({
      investment: String(Math.round(investment)),
      monthly: String(Math.round(monthlyContribution)),
      yield: yieldPct.toFixed(2),
      growth: cagrPct.toFixed(1),
      years: String(horizon),
    })
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
      track('drip_projection_shared', { ticker: ticker ?? 'custom', horizon })
    } catch {
      window.history.replaceState(null, '', url)
      track('drip_projection_share_fallback', { ticker: ticker ?? 'custom', horizon })
    }
  }

  function resetProjection() {
    setInvestmentStr(String(initialInvestment))
    setContributionStr(String(initialMonthlyContribution))
    setYieldStr(initialYield.toFixed(2))
    setCagrStr(initialCagr.toFixed(1))
    setHorizonStr(String(initialHorizon))
    track('drip_projection_reset', { ticker: ticker ?? 'custom' })
  }

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5 sm:p-6" role="region" aria-label="Dividend reinvestment calculator">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f4f4f5]">Build your income projection</p>
          <p className="mt-1 text-xs leading-relaxed text-[#71717a]">Compare reinvesting every dividend with taking the same payments in cash.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={resetProjection} className="inline-flex items-center gap-1.5 rounded-md border border-[#2e2e3e] px-3 py-2 text-xs text-[#a1a1aa] hover:border-[#6366f1]/50 hover:text-[#f4f4f5]">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button type="button" onClick={shareProjection} className="inline-flex items-center gap-1.5 rounded-md bg-[#6366f1] px-3 py-2 text-xs font-medium text-white hover:bg-[#818cf8]">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Link copied' : 'Copy projection'}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Input label="Initial investment" prefix="$" value={investmentStr} onChange={setInvestmentStr} onBlur={() => { setInvestmentStr(clamp(investmentStr, 100, 10_000_000, 0)); trackCalculation('investment') }} min={100} step={1000} />
        <Input label="Monthly contribution" prefix="$" value={contributionStr} onChange={setContributionStr} onBlur={() => { setContributionStr(clamp(contributionStr, 0, 100_000, 0)); trackCalculation('monthly_contribution') }} min={0} step={100} />
        <Input label="Dividend yield" suffix="%" value={yieldStr} onChange={setYieldStr} onBlur={() => { setYieldStr(clamp(yieldStr, 0.1, 30, 2)); trackCalculation('yield') }} min={0.1} max={30} step={0.1} />
        <Input label="Dividend growth" suffix="%" value={cagrStr} onChange={setCagrStr} onBlur={() => { setCagrStr(clamp(cagrStr, 0, 30, 1)); trackCalculation('growth') }} min={0} max={30} step={0.5} />
        <Input label="Time horizon" suffix="yr" value={horizonStr} onChange={setHorizonStr} onBlur={() => { setHorizonStr(clamp(horizonStr, 1, 40, 0)); trackCalculation('horizon') }} min={1} max={40} step={1} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Result label="Year 1 income" value={currency(year1.dripIncome)} note="With DRIP" />
        <Result label={`Year ${horizon} income`} value={currency(finalYear.dripIncome)} note={`${currency(dripAdvantage)} more than cash`} accent />
        <Result label="Capital contributed" value={currency(finalYear.contributed)} note="Initial + monthly deposits" />
        <Result label="Final yield on cost" value={`${finalYear.yieldOnCost}%`} note="On all contributed capital" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-[#71717a]">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#6366f1]" /> Annual income with DRIP</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#3f3f50]" /> Annual income without reinvestment</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <Bar dataKey="dripIncome" fill="#6366f1" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="cashIncome" fill="#3f3f50" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#1e1e2e' }} tickLine={false} />
          <YAxis tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e1e2e' }} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-7 overflow-x-auto rounded-lg border border-[#1e1e2e]">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="bg-[#09090b] text-[#71717a]">
            <tr><th className="px-4 py-3 font-medium">Year</th><th className="px-4 py-3 font-medium">Contributed</th><th className="px-4 py-3 font-medium">With DRIP</th><th className="px-4 py-3 font-medium">Without DRIP</th><th className="px-4 py-3 font-medium">Income lift</th></tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.year} className="border-t border-[#1e1e2e] text-[#a1a1aa]">
                <td className="px-4 py-3 font-medium text-[#f4f4f5]">{row.year}</td><td className="px-4 py-3">{currency(row.contributed)}</td><td className="px-4 py-3 text-[#818cf8]">{currency(row.dripIncome)}</td><td className="px-4 py-3">{currency(row.cashIncome)}</td><td className="px-4 py-3 text-[#22c55e]">+{currency(Math.max(0, row.dripIncome - row.cashIncome))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-2 text-xs leading-relaxed text-[#71717a] sm:grid-cols-2">
        <p>Total dividends generated with DRIP: <strong className="text-[#a1a1aa]">{currency(totalDripIncome)}</strong></p>
        <p>Total dividends taken as cash: <strong className="text-[#a1a1aa]">{currency(totalCashIncome)}</strong></p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#52525b]">
        Illustrative model: contributions are invested monthly, dividends are modeled monthly, dividend growth is applied annually, and share price remains constant. Taxes, fees, price changes, and dividend cuts are excluded.
      </p>
    </div>
  )
}

function Input({ label, prefix, suffix, value, onChange, onBlur, min, max, step }: { label: string; prefix?: string; suffix?: string; value: string; onChange: (value: string) => void; onBlur: () => void; min: number; max?: number; step: number }) {
  return <div><label className="mb-1.5 block text-xs text-[#71717a]">{label}</label><div className="relative">{prefix ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#71717a]">{prefix}</span> : null}<input type="number" value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} min={min} max={max} step={step} className={`w-full rounded-md border border-[#1e1e2e] bg-[#09090b] py-2 text-sm text-[#f4f4f5] focus:border-[#6366f1] focus:outline-none ${prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-9' : 'px-3'}`} />{suffix ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71717a]">{suffix}</span> : null}</div></div>
}

function Result({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  return <div className="rounded-lg bg-[#09090b] p-3"><p className="text-xs text-[#71717a]">{label}</p><p className={`mt-1 text-lg font-semibold ${accent ? 'text-[#818cf8]' : 'text-[#f4f4f5]'}`}>{value}</p><p className="mt-1 text-[10px] text-[#52525b]">{note}</p></div>
}
