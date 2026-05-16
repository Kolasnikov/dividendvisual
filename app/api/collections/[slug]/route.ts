import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Company, ComputedMetrics } from '@/lib/types'
import { checkRateLimit, getIp, tooManyRequests } from '@/lib/rateLimit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!checkRateLimit('collections', getIp(req), 30, 60_000).ok) return tooManyRequests()
  const { slug } = await params

  const result = await db.execute({
    sql: `SELECT
            c.symbol, c.name, c.sector, c.industry,
            c.is_dividend_king, c.is_dividend_aristocrat, c.is_blue_chip,
            c.years_increasing_dividends,
            cm.current_price, cm.annual_dividend, cm.current_yield,
            cm.historical_max_yield, cm.historical_min_yield, cm.median_yield,
            cm.undervalued_price, cm.overvalued_price, cm.weiss_signal,
            cm.quality_score, cm.quality_category,
            cm.payout_ratio, cm.fcf_payout,
            cm.dividend_cagr_5y, cm.dividend_cagr_10y,
            cm.years_no_cut, cm.why_now_text, cm.updated_at
          FROM collections col
          JOIN companies c ON col.symbol = c.symbol
          LEFT JOIN computed_metrics cm ON c.symbol = cm.symbol
          WHERE col.slug = ?
          ORDER BY cm.quality_score DESC NULLS LAST`,
    args: [slug],
  })

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
  }

  const rows = result.rows.map((r) => ({
    symbol: r.symbol as string,
    name: r.name as string,
    sector: r.sector as string | null,
    industry: r.industry as string | null,
    isDividendKing: Boolean(r.is_dividend_king),
    isDividendAristocrat: Boolean(r.is_dividend_aristocrat),
    isBlueChip: Boolean(r.is_blue_chip),
    yearsIncreasingDividends: (r.years_increasing_dividends as number) ?? 0,
    currentPrice: (r.current_price as number) ?? 0,
    annualDividend: (r.annual_dividend as number) ?? 0,
    currentYield: (r.current_yield as number) ?? 0,
    historicalMaxYield: (r.historical_max_yield as number) ?? 0,
    historicalMinYield: (r.historical_min_yield as number) ?? 0,
    medianYield: (r.median_yield as number) ?? 0,
    undervaluedPrice: (r.undervalued_price as number) ?? 0,
    overvaluedPrice: (r.overvalued_price as number) ?? 0,
    weissSignal: ((r.weiss_signal as string) ?? 'fair') as ComputedMetrics['weissSignal'],
    qualityScore: (r.quality_score as number) ?? 0,
    qualityCategory: ((r.quality_category as string) ?? 'Average') as ComputedMetrics['qualityCategory'],
    payoutRatio: r.payout_ratio as number | null,
    fcfPayout: r.fcf_payout as number | null,
    dividendCagr5y: r.dividend_cagr_5y as number | null,
    dividendCagr10y: r.dividend_cagr_10y as number | null,
    yearsNoCut: (r.years_no_cut as number) ?? 0,
    whyNowText: (r.why_now_text as string) ?? '',
    updatedAt: (r.updated_at as string) ?? '',
  }))

  return NextResponse.json(rows, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  })
}
