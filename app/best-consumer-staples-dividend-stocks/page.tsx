import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-consumer-staples-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('consumer-staples') ?? 'Consumer Defensive'

export const metadata: Metadata = {
  title: `Best Consumer Staples Dividend Stocks ${YEAR} - Ranked by Safety & Weiss Signal`,
  description:
    'Best consumer staples dividend stocks ranked by dividend yield, payout safety, quality score, dividend growth, and Geraldine Weiss valuation signal. Compare KO, PEP, PG, CL, KMB, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Consumer Staples Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare consumer staples dividend stocks by yield, payout safety, dividend growth, quality score, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Consumer Staples Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Consumer staples dividend stocks ranked by safety, growth, quality, and Weiss valuation signal.',
  },
}

export default function BestConsumerStaplesDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_consumer_staples_dividend_stocks_viewed"
      source="best-consumer-staples-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Defensive brand-moat dividend stocks"
      title={`Best Consumer Staples Dividend Stocks ${YEAR}`}
      description="Compare consumer staples dividend stocks by current yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for dividend investors looking for defensive income from durable brands."
      statLabel="Staples stocks"
      ctaTitle="Get alerts when consumer staples dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with defensive staples and other quality income stocks entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/dividend-kings', label: 'Dividend Kings' },
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/compare/ko-vs-pep', label: 'KO vs PEP comparison' },
        { href: '/compare/ko-vs-pg', label: 'KO vs PG comparison' },
        { href: '/compare/mo-vs-pm', label: 'MO vs PM comparison' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
      ]}
      sections={[
        {
          heading: 'How to evaluate consumer staples dividend stocks',
          paragraphs: [
            'Consumer staples companies sell products people continue buying through recessions: beverages, household goods, food, tobacco, personal care, and basic grocery categories.',
            'The best staples dividend stocks usually have brand moats, pricing power, international distribution, and decades of payout discipline. That combination supports stable cash flow and makes historical yield ranges more reliable for valuation.',
          ],
        },
        {
          heading: 'Why Dividend Kings dominate consumer staples',
          paragraphs: [
            'Many of the longest dividend growth streaks in the market come from consumer staples. Coca-Cola, Procter & Gamble, Colgate-Palmolive, Kimberly-Clark, and similar businesses have raised dividends through inflation spikes, recessions, market crashes, and changing consumer cycles.',
            'For Weiss-method investors, that long payout history matters. A staples company with a 50-year dividend record has a yield range tested by real market cycles, which makes an elevated current yield more meaningful than it would be for a younger dividend payer.',
          ],
        },
        {
          heading: 'Yield is only one part of the staples thesis',
          paragraphs: [
            'Consumer staples are often mature businesses, so dividend growth matters as much as starting yield. A 3% yield growing 6% annually can be more valuable over a long holding period than a static 5% yield with little growth.',
            'The strongest staples setups combine an Undervalued Weiss signal, a manageable payout ratio, positive dividend growth, and a quality score that confirms the business can keep funding increases.',
          ],
        },
      ]}
      checklist={[
        'Brand moat supports pricing power through inflation.',
        'Dividend history includes multiple recession cycles.',
        'Payout ratio leaves room for future raises.',
        'Dividend growth still beats inflation.',
        'Weiss signal confirms the yield is attractive versus history.',
      ]}
    />
  )
}
