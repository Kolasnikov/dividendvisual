import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Company, ComputedMetrics, TickerChangeItem, TickerChangeSummary, WeissChartPoint, TickerResponse } from '@/lib/types'
import { checkRateLimit, getIp, tooManyRequests } from '@/lib/rateLimit'

interface MetricSnapshot {
  snapshotDate: string
  currentPrice: number | null
  currentYield: number | null
  weissSignal: ComputedMetrics['weissSignal'] | null
  qualityScore: number | null
  payoutRatio: number | null
}

function pct(value: number, decimals = 2) {
  return `${(value * 100).toFixed(decimals)}%`
}

function pp(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(2)} pp`
}

function money(value: number) {
  return `$${value.toFixed(2)}`
}

function signalLabel(signal: ComputedMetrics['weissSignal'] | null) {
  if (signal === 'undervalued') return 'Undervalued'
  if (signal === 'overvalued') return 'Overvalued'
  return 'Fair'
}

function signalTone(previous: ComputedMetrics['weissSignal'] | null, current: ComputedMetrics['weissSignal']) {
  if (current === previous) return 'neutral'
  if (current === 'undervalued') return 'positive'
  if (current === 'overvalued') return 'negative'
  if (previous === 'overvalued') return 'positive'
  return 'neutral'
}

function numberFromRow(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

async function getPreviousSnapshot(symbol: string, currentUpdatedAt: string): Promise<MetricSnapshot | null> {
  try {
    const result = await db.execute({
      sql: `SELECT snapshot_date, current_price, current_yield, weiss_signal, quality_score, payout_ratio
            FROM ticker_metric_snapshots
            WHERE symbol = ?
              AND snapshot_date < date(COALESCE(NULLIF(?, ''), 'now'))
            ORDER BY snapshot_date DESC
            LIMIT 1`,
      args: [symbol, currentUpdatedAt],
    })
    const row = result.rows[0]
    if (row) {
      return {
        snapshotDate: row.snapshot_date as string,
        currentPrice: numberFromRow(row.current_price),
        currentYield: numberFromRow(row.current_yield),
        weissSignal: (row.weiss_signal as ComputedMetrics['weissSignal'] | null) ?? null,
        qualityScore: numberFromRow(row.quality_score),
        payoutRatio: numberFromRow(row.payout_ratio),
      }
    }
  } catch {
    // The product snapshot table is created by the compute workflow. Fall back
    // to newsletter snapshots so older installs still get useful comparisons.
  }

  try {
    const result = await db.execute({
      sql: `SELECT snapshot_date, current_price, current_yield, weiss_signal, quality_score, payout_ratio
            FROM newsletter_signal_snapshots
            WHERE symbol = ?
              AND snapshot_date < date(COALESCE(NULLIF(?, ''), 'now'))
            ORDER BY snapshot_date DESC
            LIMIT 1`,
      args: [symbol, currentUpdatedAt],
    })
    const row = result.rows[0]
    if (!row) return null
    return {
      snapshotDate: row.snapshot_date as string,
      currentPrice: numberFromRow(row.current_price),
      currentYield: numberFromRow(row.current_yield),
      weissSignal: (row.weiss_signal as ComputedMetrics['weissSignal'] | null) ?? null,
      qualityScore: numberFromRow(row.quality_score),
      payoutRatio: numberFromRow(row.payout_ratio),
    }
  } catch {
    return null
  }
}

function buildChangeSummary(metrics: ComputedMetrics, previous: MetricSnapshot | null): TickerChangeSummary {
  const currentDate = metrics.updatedAt ? metrics.updatedAt.slice(0, 10) : null
  if (!previous) {
    return { previousDate: null, currentDate, items: [] }
  }

  const items: TickerChangeItem[] = []

  if (previous.weissSignal && previous.weissSignal !== metrics.weissSignal) {
    items.push({
      kind: 'signal',
      label: 'Weiss signal',
      previous: signalLabel(previous.weissSignal),
      current: signalLabel(metrics.weissSignal),
      delta: null,
      tone: signalTone(previous.weissSignal, metrics.weissSignal),
      sentence: `Signal moved from ${signalLabel(previous.weissSignal).toLowerCase()} to ${signalLabel(metrics.weissSignal).toLowerCase()}.`,
    })
  }

  if (previous.currentPrice != null && metrics.currentPrice > 0) {
    const deltaPct = (metrics.currentPrice - previous.currentPrice) / previous.currentPrice
    if (Math.abs(deltaPct) >= 0.01) {
      items.push({
        kind: 'price',
        label: 'Price',
        previous: money(previous.currentPrice),
        current: money(metrics.currentPrice),
        delta: `${deltaPct > 0 ? '+' : ''}${(deltaPct * 100).toFixed(1)}%`,
        tone: metrics.weissSignal === 'overvalued' ? (deltaPct > 0 ? 'negative' : 'positive') : (deltaPct < 0 ? 'positive' : 'neutral'),
        sentence: `Price ${deltaPct > 0 ? 'rose' : 'fell'} ${Math.abs(deltaPct * 100).toFixed(1)}% since the prior snapshot.`,
      })
    }
  }

  if (previous.currentYield != null) {
    const deltaYield = metrics.currentYield - previous.currentYield
    if (Math.abs(deltaYield) >= 0.001) {
      items.push({
        kind: 'yield',
        label: 'Dividend yield',
        previous: pct(previous.currentYield),
        current: pct(metrics.currentYield),
        delta: pp(deltaYield),
        tone: deltaYield > 0 ? 'positive' : 'negative',
        sentence: `Yield ${deltaYield > 0 ? 'expanded' : 'compressed'} from ${pct(previous.currentYield)} to ${pct(metrics.currentYield)}.`,
      })
    }
  }

  if (previous.qualityScore != null) {
    const deltaScore = metrics.qualityScore - previous.qualityScore
    if (Math.abs(deltaScore) >= 3) {
      items.push({
        kind: 'quality',
        label: 'Quality score',
        previous: `${previous.qualityScore}/100`,
        current: `${metrics.qualityScore}/100`,
        delta: `${deltaScore > 0 ? '+' : ''}${deltaScore}`,
        tone: deltaScore > 0 ? 'positive' : 'negative',
        sentence: `Quality score ${deltaScore > 0 ? 'improved' : 'weakened'} by ${Math.abs(deltaScore)} points.`,
      })
    }
  }

  if (previous.payoutRatio != null && metrics.payoutRatio != null) {
    const deltaPayout = metrics.payoutRatio - previous.payoutRatio
    if (Math.abs(deltaPayout) >= 0.05) {
      items.push({
        kind: 'payout',
        label: 'Payout ratio',
        previous: pct(previous.payoutRatio, 0),
        current: pct(metrics.payoutRatio, 0),
        delta: pp(deltaPayout),
        tone: deltaPayout < 0 ? 'positive' : 'negative',
        sentence: `Payout ratio ${deltaPayout > 0 ? 'increased' : 'declined'} by ${Math.abs(deltaPayout * 100).toFixed(0)} percentage points.`,
      })
    }
  }

  return {
    previousDate: previous.snapshotDate,
    currentDate,
    items: items.slice(0, 4),
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  if (!checkRateLimit('ticker', getIp(req), 30, 60_000).ok) return tooManyRequests()
  const { symbol } = await params
  const sym = symbol.toUpperCase()

  const [companyResult, metricsResult, chartResult] = await Promise.all([
    db.execute({
      sql: 'SELECT * FROM companies WHERE symbol = ?',
      args: [sym],
    }),
    db.execute({
      sql: 'SELECT * FROM computed_metrics WHERE symbol = ?',
      args: [sym],
    }),
    db.execute({
      sql: `SELECT date, price, undervalued_band, overvalued_band, annual_dividend
            FROM weiss_chart_data
            WHERE symbol = ?
              AND date >= date('now', '-10 years')
            ORDER BY date ASC`,
      args: [sym],
    }),
  ])

  if (companyResult.rows.length === 0) {
    return NextResponse.json({ error: 'Ticker not found' }, { status: 404 })
  }

  const row = companyResult.rows[0]
  const company: Company = {
    symbol: row.symbol as string,
    name: row.name as string,
    sector: row.sector as string | null,
    industry: row.industry as string | null,
    isDividendKing: Boolean(row.is_dividend_king),
    isDividendAristocrat: Boolean(row.is_dividend_aristocrat),
    isBlueChip: Boolean(row.is_blue_chip),
    yearsIncreasingDividends: (row.years_increasing_dividends as number) ?? 0,
  }

  const m = metricsResult.rows[0] ?? {}
  const metrics: ComputedMetrics = {
    symbol: sym,
    currentPrice: (m.current_price as number) ?? 0,
    annualDividend: (m.annual_dividend as number) ?? 0,
    currentYield: (m.current_yield as number) ?? 0,
    historicalMaxYield: (m.historical_max_yield as number) ?? 0,
    historicalMinYield: (m.historical_min_yield as number) ?? 0,
    medianYield: (m.median_yield as number) ?? 0,
    undervaluedPrice: (m.undervalued_price as number) ?? 0,
    overvaluedPrice: (m.overvalued_price as number) ?? 0,
    weissSignal: (m.weiss_signal as string ?? 'fair') as ComputedMetrics['weissSignal'],
    qualityScore: (m.quality_score as number) ?? 0,
    qualityCategory: (m.quality_category as string ?? 'Average') as ComputedMetrics['qualityCategory'],
    payoutRatio: m.payout_ratio as number | null,
    fcfPayout: m.fcf_payout as number | null,
    dividendCagr5y: m.dividend_cagr_5y as number | null,
    dividendCagr10y: m.dividend_cagr_10y as number | null,
    yearsNoCut: (m.years_no_cut as number) ?? 0,
    whyNowText: (m.why_now_text as string) ?? '',
    updatedAt: (m.updated_at as string) ?? '',
  }

  const chartData: WeissChartPoint[] = chartResult.rows.map((r) => ({
    date: r.date as string,
    price: r.price as number | null,
    undervaluedBand: r.undervalued_band as number | null,
    overvaluedBand: r.overvalued_band as number | null,
    annualDividend: r.annual_dividend as number | null,
  }))

  const previousSnapshot = await getPreviousSnapshot(sym, metrics.updatedAt)
  const changes = buildChangeSummary(metrics, previousSnapshot)

  const response: TickerResponse = { company, metrics, chartData, changes }
  return NextResponse.json(response, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  })
}
