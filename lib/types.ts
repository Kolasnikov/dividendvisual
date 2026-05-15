export type WeissSignal = 'undervalued' | 'fair' | 'overvalued'
export type QualityCategory = 'Excellent' | 'Good' | 'Average' | 'Risky'

export interface Company {
  symbol: string
  name: string
  sector: string | null
  industry: string | null
  isDividendKing: boolean
  isDividendAristocrat: boolean
  isBlueChip: boolean
  yearsIncreasingDividends: number
}

export interface ComputedMetrics {
  symbol: string
  currentPrice: number
  annualDividend: number
  currentYield: number
  historicalMaxYield: number
  historicalMinYield: number
  medianYield: number
  undervaluedPrice: number
  overvaluedPrice: number
  weissSignal: WeissSignal
  qualityScore: number
  qualityCategory: QualityCategory
  payoutRatio: number | null
  fcfPayout: number | null
  dividendCagr5y: number | null
  dividendCagr10y: number | null
  yearsNoCut: number
  whyNowText: string
  updatedAt: string
}

export interface WeissChartPoint {
  date: string
  price: number | null
  undervaluedBand: number | null
  overvaluedBand: number | null
  annualDividend: number | null
}

export interface TickerResponse {
  company: Company
  metrics: ComputedMetrics
  chartData: WeissChartPoint[]
}

export interface WatchlistItem extends Company, ComputedMetrics {}

export interface CollectionItem extends Company, ComputedMetrics {}

export interface SearchResult {
  symbol: string
  name: string
  sector: string | null
}
