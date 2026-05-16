import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Company, ComputedMetrics, WeissChartPoint, TickerResponse } from '@/lib/types'
import { checkRateLimit, getIp, tooManyRequests } from '@/lib/rateLimit'

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

  const response: TickerResponse = { company, metrics, chartData }
  return NextResponse.json(response, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  })
}
