import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-financial-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('financials') ?? 'Financial Services'

export const metadata: Metadata = {
  title: `Best Financial Dividend Stocks ${YEAR} - Banks, Insurers & Payment Networks`,
  description:
    'Best financial dividend stocks ranked by dividend yield, payout safety, quality score, dividend growth, and Geraldine Weiss valuation signal. Compare JPM, V, MA, AFL, CB, TROW, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Financial Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare financial dividend stocks by yield, quality score, dividend growth, payout coverage, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Financial Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Financial dividend stocks ranked by safety, growth, quality, and Weiss valuation signal.',
  },
}

export default function BestFinancialDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_financial_dividend_stocks_viewed"
      source="best-financial-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Banks, insurers, asset managers, and payment networks"
      title={`Best Financial Dividend Stocks ${YEAR}`}
      description="Compare financial dividend stocks by current yield, dividend growth, payout safety, quality score, and Geraldine Weiss valuation signal. Built for income investors separating durable financial compounders from credit-cycle dividend risk."
      statLabel="Financial stocks"
      ctaTitle="Get alerts when financial dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with banks, insurers, asset managers, payment networks, and other dividend stocks entering attractive Weiss yield territory."
      relatedLinks={[
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/collections/low-payout-compounders', label: 'Low payout compounders' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
        { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'Geraldine Weiss method' },
        { href: '/blog/dividend-yield-trap', label: 'Dividend yield trap guide' },
      ]}
      sections={[
        {
          heading: 'How to evaluate financial dividend stocks',
          paragraphs: [
            'Financial dividend stocks are not one category. Banks, insurers, asset managers, exchanges, and payment networks all earn money differently and carry different dividend risks.',
            'Banks depend on credit cycles, net interest margins, and regulatory capital. Insurers depend on underwriting discipline and investment income. Payment networks and exchanges often have cleaner dividend profiles because they collect transaction fees without taking the same balance-sheet risk.',
          ],
        },
        {
          heading: 'Why quality matters more in financials',
          paragraphs: [
            'The financial sector has a long memory. The 2008 financial crisis broke dividend streaks across many banks, which means yield history alone is not enough. A high current yield can signal value, but it can also signal credit stress, capital pressure, or earnings normalization.',
            'The strongest setups usually combine an attractive Weiss signal with conservative payout metrics, resilient fee income, and a dividend history that survived multiple rate and credit cycles.',
          ],
        },
        {
          heading: 'Banks vs payment networks',
          paragraphs: [
            'Banks can provide high current income, but the dividend depends on capital requirements, loan losses, and stress-test outcomes. Even strong banks can pause dividend growth when regulators want more capital retained.',
            'Payment networks such as Visa and Mastercard usually start with lower yields, but they can compound dividends quickly because margins are high, capital needs are light, and credit risk sits mostly with issuing banks rather than the network itself.',
          ],
        },
      ]}
      checklist={[
        'Payout ratio is conservative relative to earnings volatility.',
        'Credit-cycle or capital requirements do not dominate the thesis.',
        'Dividend growth survived rate and recession cycles.',
        'Quality score confirms balance-sheet and payout durability.',
        'Weiss signal shows the yield is attractive versus the stock history.',
      ]}
    />
  )
}
