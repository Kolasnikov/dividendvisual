import type { ComputedMetrics } from '@/lib/types'

interface MetricsCardProps {
  metrics: ComputedMetrics
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#1e1e2e] last:border-0">
      <span className="text-sm text-[#71717a]">{label}</span>
      <span className="text-sm font-medium text-[#f4f4f5]">{value}</span>
    </div>
  )
}

function pct(v: number | null, decimals = 2): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(decimals)}%`
}

function usd(v: number | null): string {
  if (v == null || v === 0) return '—'
  return `$${v.toFixed(2)}`
}

export function MetricsCard({ metrics }: MetricsCardProps) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <h3 className="text-sm font-medium text-[#71717a] mb-1">Key Metrics</h3>
      <div>
        <MetricRow label="Current Price" value={usd(metrics.currentPrice)} />
        <MetricRow label="Annual Dividend" value={usd(metrics.annualDividend)} />
        <MetricRow label="Current Yield" value={pct(metrics.currentYield)} />
        <MetricRow label="Yield — Max (10Y)" value={pct(metrics.historicalMaxYield)} />
        <MetricRow label="Yield — Min (10Y)" value={pct(metrics.historicalMinYield)} />
        <MetricRow label="Undervalued Below" value={usd(metrics.undervaluedPrice)} />
        <MetricRow label="Overvalued Above" value={usd(metrics.overvaluedPrice)} />
        <MetricRow label="Payout Ratio" value={pct(metrics.payoutRatio)} />
        <MetricRow label="CAGR Dividend 5Y" value={pct(metrics.dividendCagr5y, 1)} />
        <MetricRow label="CAGR Dividend 10Y" value={pct(metrics.dividendCagr10y, 1)} />
        <MetricRow label="Years No Cut" value={metrics.yearsNoCut > 0 ? `${metrics.yearsNoCut}y` : '—'} />
      </div>
    </div>
  )
}
