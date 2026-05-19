import type { Metadata } from 'next'
import MonthlyDividendStocksPage from '../monthly-dividend-stocks/page'

const PAGE_URL = 'https://dividendvisual.com/best-monthly-dividend-stocks'
const YEAR = 2026

export const metadata: Metadata = {
  title: `Best Monthly Dividend Stocks ${YEAR} - Ranked by Yield, Safety & Weiss Signal`,
  description:
    'Best monthly dividend stocks ranked by dividend yield, quality score, payout safety, dividend growth, and Geraldine Weiss valuation signal. Compare O, MAIN, STAG, ADC, and other monthly payers.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Monthly Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare the best monthly dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Monthly Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Monthly dividend payers ranked by yield, safety, dividend growth, and Weiss valuation signal.',
  },
}

export default MonthlyDividendStocksPage
