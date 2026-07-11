import { unstable_cache } from 'next/cache'
import type { Row } from '@libsql/client'
import { db } from '@/lib/db'
import type { Company, ComputedMetrics } from '@/lib/types'

export type StockScreenRow = Company & ComputedMetrics

const STOCK_COLUMNS = `
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
`

function mapStockRow(row: Row): StockScreenRow {
  return {
    symbol: row.symbol as string,
    name: row.name as string,
    sector: row.sector as string | null,
    industry: row.industry as string | null,
    isDividendKing: Boolean(row.is_dividend_king),
    isDividendAristocrat: Boolean(row.is_dividend_aristocrat),
    isBlueChip: Boolean(row.is_blue_chip),
    yearsIncreasingDividends: (row.years_increasing_dividends as number) ?? 0,
    currentPrice: (row.current_price as number) ?? 0,
    annualDividend: (row.annual_dividend as number) ?? 0,
    currentYield: (row.current_yield as number) ?? 0,
    historicalMaxYield: (row.historical_max_yield as number) ?? 0,
    historicalMinYield: (row.historical_min_yield as number) ?? 0,
    medianYield: (row.median_yield as number) ?? 0,
    undervaluedPrice: (row.undervalued_price as number) ?? 0,
    overvaluedPrice: (row.overvalued_price as number) ?? 0,
    weissSignal: ((row.weiss_signal as string) ?? 'fair') as ComputedMetrics['weissSignal'],
    qualityScore: (row.quality_score as number) ?? 0,
    qualityCategory: ((row.quality_category as string) ?? 'Average') as ComputedMetrics['qualityCategory'],
    payoutRatio: row.payout_ratio as number | null,
    fcfPayout: row.fcf_payout as number | null,
    dividendCagr5y: row.dividend_cagr_5y as number | null,
    dividendCagr10y: row.dividend_cagr_10y as number | null,
    yearsNoCut: (row.years_no_cut as number) ?? 0,
    whyNowText: (row.why_now_text as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  }
}

const getCachedWatchlist = unstable_cache(
  async (sector?: string) => {
    const result = await db.execute({
      sql: `SELECT ${STOCK_COLUMNS}
        FROM companies c
        LEFT JOIN computed_metrics cm ON c.symbol = cm.symbol
        ${sector ? 'WHERE c.sector = ?' : ''}
        ORDER BY cm.quality_score DESC NULLS LAST`,
      args: sector ? [sector] : [],
    })
    return result.rows.map(mapStockRow)
  },
  ['stock-screen-watchlist'],
  { revalidate: 3600, tags: ['stock-screens'] },
)

const getCachedCollection = unstable_cache(
  async (slug: string) => {
    const result = await db.execute({
      sql: `SELECT ${STOCK_COLUMNS}
        FROM collections col
        JOIN companies c ON col.symbol = c.symbol
        LEFT JOIN computed_metrics cm ON c.symbol = cm.symbol
        WHERE col.slug = ?
        ORDER BY cm.quality_score DESC NULLS LAST`,
      args: [slug],
    })
    return result.rows.map(mapStockRow)
  },
  ['stock-screen-collection'],
  { revalidate: 3600, tags: ['stock-screens', 'stock-collections'] },
)

async function safelyLoad(label: string, load: () => Promise<StockScreenRow[]>) {
  try {
    return await load()
  } catch (error) {
    console.error(`[stock-data] ${label} unavailable`, error)
    return []
  }
}

export function getWatchlistStocks(sector?: string) {
  return safelyLoad(sector ? `sector:${sector}` : 'watchlist', () => getCachedWatchlist(sector))
}

export function getCollectionStocks(slug: string) {
  return safelyLoad(`collection:${slug}`, () => getCachedCollection(slug))
}
