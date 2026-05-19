import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-reit-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('real-estate') ?? 'Real Estate'

export const metadata: Metadata = {
  title: `Best REIT Dividend Stocks ${YEAR} - Ranked by Yield, Safety & Weiss Signal`,
  description:
    'Best REIT dividend stocks ranked by yield, dividend safety, quality score, payout coverage, and Geraldine Weiss valuation signal. Compare O, NNN, STAG, PSA, DLR, PLD, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best REIT Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare REIT dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best REIT Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'REIT dividend stocks ranked by yield, safety, quality, and Weiss valuation signal.',
  },
}

export default function BestReitDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_reit_dividend_stocks_viewed"
      source="best-reit-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="REIT income stocks screened for rate-cycle value"
      title={`Best REIT Dividend Stocks ${YEAR}`}
      description="Compare REIT dividend stocks by current yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for income investors evaluating real estate dividends without blindly chasing high yield."
      statLabel="REITs tracked"
      ctaTitle="Get alerts when REIT dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with REITs and other income stocks entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/best-monthly-dividend-stocks', label: 'Best monthly dividend stocks' },
        { href: '/high-yield-dividend-stocks', label: 'High yield dividend stocks' },
        { href: '/compare/o-vs-nnn', label: 'O vs NNN comparison' },
        { href: '/compare/o-vs-stag', label: 'O vs STAG comparison' },
        { href: '/drip-calculator', label: 'Dividend DRIP calculator' },
        { href: '/blog/best-reit-dividend-stocks-2026', label: 'REIT dividend stock guide' },
      ]}
      sections={[
        {
          heading: 'How to evaluate REIT dividend stocks',
          paragraphs: [
            'REITs are legally required to distribute most taxable income, which makes them natural income vehicles. The trade-off is that REITs are sensitive to interest rates, debt costs, and property subsector cycles.',
            'For dividend investors, the most important question is whether a high REIT yield is caused by rate-driven price pressure or by weakening property cash flows. The Weiss method helps by comparing today\'s yield to the stock\'s own historical yield range.',
          ],
        },
        {
          heading: 'Why REIT Weiss signals often appear during rate stress',
          paragraphs: [
            'When Treasury yields rise, REIT prices often fall mechanically because income investors demand a wider spread over bonds. That pushes REIT dividend yields toward historical highs, even when occupancy, leases, and rent collection remain healthy.',
            'The best setups usually combine an Undervalued Weiss signal, a quality score above the peer group, manageable payout coverage, and a property type with durable demand such as net lease, industrial, storage, or infrastructure real estate.',
          ],
        },
        {
          heading: 'REIT payout ratios need context',
          paragraphs: [
            'Traditional earnings payout ratios can be misleading for REITs because real estate depreciation reduces GAAP earnings without reducing cash generation. FFO or AFFO coverage is usually the better framework.',
            'DividendVisual still treats very high payout metrics cautiously, but a REIT with durable rent collection, long leases, and a stable balance sheet can sustain a higher reported payout than an industrial or consumer company.',
          ],
        },
      ]}
      checklist={[
        'Dividend yield is attractive versus the REIT\'s own history.',
        'Payout coverage is sustainable on a cash-flow or FFO basis.',
        'Debt maturities and refinancing costs are manageable.',
        'Property type has durable demand through weak markets.',
        'Weiss signal confirms the entry price is historically attractive.',
      ]}
    />
  )
}
