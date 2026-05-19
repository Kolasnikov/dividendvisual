import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-technology-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('technology') ?? 'Technology'

export const metadata: Metadata = {
  title: `Best Technology Dividend Stocks ${YEAR} - Growth, Quality & Weiss Signal`,
  description:
    'Best technology dividend stocks ranked by dividend growth, quality score, current yield, payout safety, and Geraldine Weiss valuation signal. Compare MSFT, AAPL, TXN, AVGO, CSCO, IBM, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Technology Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare technology dividend stocks by yield, dividend growth, payout safety, quality score, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Technology Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Technology dividend stocks ranked by growth, quality, payout safety, and Weiss valuation signal.',
  },
}

export default function BestTechnologyDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_technology_dividend_stocks_viewed"
      source="best-technology-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Low-yield, high-growth dividend compounders"
      title={`Best Technology Dividend Stocks ${YEAR}`}
      description="Compare technology dividend stocks by current yield, dividend growth, payout safety, quality score, and Geraldine Weiss valuation signal. Built for long-term dividend investors evaluating software, semiconductors, hardware, and IT services compounders."
      statLabel="Tech stocks"
      ctaTitle="Get alerts when technology dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with technology dividend compounders and other quality stocks entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/compare/aapl-vs-msft', label: 'AAPL vs MSFT comparison' },
        { href: '/compare/avgo-vs-qcom', label: 'AVGO vs QCOM comparison' },
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
        { href: '/drip-calculator', label: 'Dividend DRIP calculator' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
      ]}
      sections={[
        {
          heading: 'How to evaluate technology dividend stocks',
          paragraphs: [
            'Technology dividend stocks are usually dividend growth investments rather than high-yield income vehicles. Microsoft, Apple, Texas Instruments, Broadcom, Cisco, and similar companies often start with modest yields but can grow payouts quickly.',
            'The best tech dividend stocks combine high margins, low capital intensity, durable competitive advantages, and conservative payout ratios. That leaves room for reinvestment while still compounding the dividend.',
          ],
        },
        {
          heading: 'Why dividend growth matters more than starting yield',
          paragraphs: [
            'A 1.5% yield growing at a double-digit rate can become a powerful income stream over a long holding period. This is the core appeal of technology dividend compounders: current income is low, but income growth can be exceptional.',
            'The trade-off is valuation. High-quality tech companies often trade at premium multiples, so the Weiss signal helps identify periods when the current yield is attractive relative to the stock own history.',
          ],
        },
        {
          heading: 'Semiconductors vs software vs hardware',
          paragraphs: [
            'Semiconductors can be cyclical, but leading firms with design moats and diversified end markets can still compound dividends through cycles. Software and services companies often have smoother cash flow but lower starting yields.',
            'Hardware companies need closer monitoring because product cycles and platform transitions can affect cash flow. A strong balance sheet and low payout ratio are especially important when evaluating tech income stocks.',
          ],
        },
      ]}
      checklist={[
        'Payout ratio leaves room for reinvestment and dividend growth.',
        'Dividend CAGR meaningfully exceeds inflation.',
        'Balance sheet is strong enough for technology cycles.',
        'Business moat supports durable free cash flow.',
        'Weiss signal confirms the yield is attractive versus history.',
      ]}
    />
  )
}
