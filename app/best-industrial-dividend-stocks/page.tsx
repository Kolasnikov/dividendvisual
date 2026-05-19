import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-industrial-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('industrials') ?? 'Industrials'

export const metadata: Metadata = {
  title: `Best Industrial Dividend Stocks ${YEAR} - Ranked by Quality & Weiss Signal`,
  description:
    'Best industrial dividend stocks ranked by dividend yield, quality score, payout safety, dividend growth, and Geraldine Weiss valuation signal. Compare CAT, HON, UNP, LMT, NOC, UPS, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Industrial Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare industrial dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Industrial Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Industrial dividend stocks ranked by quality, dividend growth, safety, and Weiss valuation signal.',
  },
}

export default function BestIndustrialDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_industrial_dividend_stocks_viewed"
      source="best-industrial-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Defense, railroads, automation, logistics, and industrial compounders"
      title={`Best Industrial Dividend Stocks ${YEAR}`}
      description="Compare industrial dividend stocks by current yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for dividend investors evaluating cyclical income, defense contractors, railroads, and industrial compounders."
      statLabel="Industrial stocks"
      ctaTitle="Get alerts when industrial dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with industrial dividend stocks and other quality income names entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/compare/lmt-vs-noc', label: 'LMT vs NOC comparison' },
        { href: '/compare/cat-vs-mmm', label: 'CAT vs MMM comparison' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
        { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to find undervalued dividend stocks' },
      ]}
      sections={[
        {
          heading: 'How to evaluate industrial dividend stocks',
          paragraphs: [
            'Industrial dividend stocks span defense contractors, railroads, logistics, factory automation, construction equipment, and diversified manufacturers. The common thread is exposure to capital spending, infrastructure, and long economic cycles.',
            'The best industrial dividend stocks usually have high switching costs, mission-critical products, long contract backlogs, or infrastructure-like assets. Those traits help smooth cash flow enough to support dividend growth through recessions.',
          ],
        },
        {
          heading: 'Defense and railroads behave differently from cyclicals',
          paragraphs: [
            'Defense contractors such as Lockheed Martin, Northrop Grumman, and General Dynamics have revenue visibility from multi-year government contracts. That backlog can make their dividends more predictable than the average industrial stock.',
            'Railroads and logistics companies have infrastructure moats, but freight volumes still move with the economy. Cyclical manufacturers such as Caterpillar require even more context because earnings can swing sharply between boom and recession periods.',
          ],
        },
        {
          heading: 'Using the Weiss signal in cyclical sectors',
          paragraphs: [
            'Industrial stocks often look most attractive by yield when the cycle is weak and sentiment is poor. That can be a real opportunity if the business has through-cycle cash generation and a dividend record that survived prior downturns.',
            'For cyclical industrials, pair the Weiss signal with balance-sheet strength, dividend growth discipline, and evidence that the payout can survive lower earnings without becoming stretched.',
          ],
        },
      ]}
      checklist={[
        'Dividend streak survived prior industrial downturns.',
        'Balance sheet can handle lower-cycle earnings.',
        'Business has backlog, infrastructure moat, or pricing power.',
        'Payout ratio is not based on peak-cycle earnings alone.',
        'Weiss signal is supported by quality score and dividend growth.',
      ]}
    />
  )
}
