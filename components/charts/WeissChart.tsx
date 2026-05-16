'use client'

import { useState, useMemo } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import type { WeissChartPoint } from '@/lib/types'

interface WeissChartProps {
  data: WeissChartPoint[]
  currentPrice: number
  label?: string
}

type Range = '1Y' | '3Y' | '5Y' | '10Y' | 'MAX'
const RANGES: Range[] = ['1Y', '3Y', '5Y', '10Y', 'MAX']
const RANGE_YEARS: Record<Range, number | null> = {
  '1Y': 1, '3Y': 3, '5Y': 5, '10Y': 10, MAX: null,
}

function filterByRange(data: WeissChartPoint[], range: Range): WeissChartPoint[] {
  const years = RANGE_YEARS[range]
  if (years === null) return data
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - years)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  return data.filter((d) => d.date >= cutoffStr)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatCurrency(v: number | null | undefined): string {
  if (v == null) return '—'
  return `$${v.toFixed(2)}`
}

function formatYield(price: number | null, annualDiv: number | null): string {
  if (!price || !annualDiv || price === 0) return '—'
  return `${((annualDiv / price) * 100).toFixed(2)}%`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload as WeissChartPoint
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 text-sm shadow-xl min-w-[180px]">
      <p className="text-[#71717a] mb-2 text-xs">{formatDate(label)}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-[#71717a]">Price</span>
          <span className="text-[#f4f4f5] font-medium">{formatCurrency(data.price)}</span>
        </div>
        {data.undervaluedBand != null && (
          <div className="flex justify-between gap-4">
            <span className="text-[#22c55e]">Underval.</span>
            <span className="text-[#22c55e] font-medium">{formatCurrency(data.undervaluedBand)}</span>
          </div>
        )}
        {data.overvaluedBand != null && (
          <div className="flex justify-between gap-4">
            <span className="text-[#ef4444]">Overval.</span>
            <span className="text-[#ef4444] font-medium">{formatCurrency(data.overvaluedBand)}</span>
          </div>
        )}
        {data.annualDividend != null && (
          <div className="flex justify-between gap-4 border-t border-[#1e1e2e] pt-1 mt-1">
            <span className="text-[#71717a]">Ann. Div.</span>
            <span className="text-[#f59e0b] font-medium">{formatCurrency(data.annualDividend)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="text-[#71717a]">Yield</span>
          <span className="text-[#f4f4f5]">{formatYield(data.price, data.annualDividend)}</span>
        </div>
      </div>
    </div>
  )
}

function computeDomain(data: WeissChartPoint[]): [number, number] {
  const vals: number[] = []
  for (const d of data) {
    if (d.price != null) vals.push(d.price)
    if (d.undervaluedBand != null) vals.push(d.undervaluedBand)
    if (d.overvaluedBand != null) vals.push(d.overvaluedBand)
  }
  if (vals.length === 0) return [0, 100]
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = (max - min) * 0.1
  return [Math.max(0, min - pad), max + pad]
}

export function WeissChart({ data, currentPrice, label }: WeissChartProps) {
  const [range, setRange] = useState<Range>('5Y')

  const filtered = useMemo(() => filterByRange(data, range), [data, range])
  const [yMin, yMax] = useMemo(() => computeDomain(filtered), [filtered])

  const xTicks = useMemo(() => {
    if (filtered.length === 0) return []
    const step = Math.max(1, Math.floor(filtered.length / 6))
    return filtered
      .filter((_, i) => i % step === 0 || i === filtered.length - 1)
      .map((d) => d.date)
  }, [filtered])

  // Compute reference areas (zones) from the filtered data segments
  // Group consecutive points into "zones" based on signal
  const zones = useMemo(() => {
    const result: { x1: string; x2: string; signal: 'under' | 'over' | 'fair' }[] = []
    let zoneStart: string | null = null
    let currentSignal: 'under' | 'over' | 'fair' | null = null

    for (const d of filtered) {
      if (d.price == null || d.undervaluedBand == null || d.overvaluedBand == null) continue
      const signal: 'under' | 'over' | 'fair' =
        d.price <= d.undervaluedBand ? 'under'
        : d.price >= d.overvaluedBand ? 'over'
        : 'fair'

      if (signal !== currentSignal) {
        if (zoneStart && currentSignal) {
          result.push({ x1: zoneStart, x2: d.date, signal: currentSignal })
        }
        zoneStart = d.date
        currentSignal = signal
      }
    }
    if (zoneStart && currentSignal && filtered.length > 0) {
      result.push({ x1: zoneStart, x2: filtered[filtered.length - 1].date, signal: currentSignal })
    }
    return result
  }, [filtered])

  return (
    <div className="w-full" role="img" aria-label={label ?? 'Dividend yield history chart with Weiss valuation bands'}>
      {/* Range selector */}
      <div className="flex gap-1 mb-4 justify-end">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              range === r
                ? 'bg-[#6366f1] text-white'
                : 'text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1e1e2e]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={filtered} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>

          {/* Background zone shading where price crosses bands */}
          {zones.map((z, i) => (
            <ReferenceArea
              key={i}
              x1={z.x1}
              x2={z.x2}
              fill={z.signal === 'under' ? '#22c55e' : z.signal === 'over' ? '#ef4444' : 'transparent'}
              fillOpacity={0.06}
              strokeOpacity={0}
            />
          ))}

          {/* Overvalued band — stepped line */}
          <Line
            type="stepAfter"
            dataKey="overvaluedBand"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeOpacity={0.7}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />

          {/* Undervalued band — stepped line */}
          <Line
            type="stepAfter"
            dataKey="undervaluedBand"
            stroke="#22c55e"
            strokeWidth={1.5}
            strokeOpacity={0.7}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />

          {/* Price — prominent white line */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#e4e4e7"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />

          <XAxis
            dataKey="date"
            ticks={xTicks}
            tickFormatter={formatDate}
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#1e1e2e' }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 justify-center text-xs text-[#71717a]">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[#e4e4e7]" />
          <span>Price</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[#22c55e]" />
          <span>Undervalued band</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[#ef4444]" />
          <span>Overvalued band</span>
        </div>
      </div>
    </div>
  )
}
