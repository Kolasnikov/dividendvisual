import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-energy-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('energy') ?? 'Energy'

export const metadata: Metadata = {
  title: `Best Energy Dividend Stocks ${YEAR} - Oil, Gas & Midstream Income`,
  description:
    'Best energy dividend stocks ranked by dividend yield, quality score, payout safety, dividend growth, and Geraldine Weiss valuation signal. Compare XOM, CVX, OKE, PSX, VLO, EPD, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Energy Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare energy dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Energy Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Energy dividend stocks ranked by yield, quality, payout safety, and Weiss valuation signal.',
  },
}

export default function BestEnergyDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_energy_dividend_stocks_viewed"
      source="best-energy-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Oil majors, refiners, and midstream dividend stocks"
      title={`Best Energy Dividend Stocks ${YEAR}`}
      description="Compare energy dividend stocks by current yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for income investors evaluating oil majors, refiners, midstream operators, and commodity-cycle dividend risk."
      statLabel="Energy stocks"
      ctaTitle="Get alerts when energy dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with energy dividend stocks and other income names entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/compare/xom-vs-cvx', label: 'XOM vs CVX comparison' },
        { href: '/high-yield-dividend-stocks', label: 'High yield dividend stocks' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/blog/dividend-yield-trap', label: 'Dividend yield trap guide' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
      ]}
      sections={[
        {
          heading: 'How to evaluate energy dividend stocks',
          paragraphs: [
            'Energy dividend stocks are shaped by commodity cycles. Oil majors, refiners, and midstream operators can all pay attractive dividends, but their cash-flow stability is not the same.',
            'Integrated majors such as Exxon Mobil and Chevron have long dividend records because their balance sheets and integrated operations help them survive oil downturns. Midstream companies can be more fee-based, but they still depend on volumes, leverage, and contract quality.',
          ],
        },
        {
          heading: 'Why high yield needs context in energy',
          paragraphs: [
            'A high energy yield can be an opportunity when commodity fear pushes prices down temporarily. It can also be a warning when the market expects lower cash flow, refinancing pressure, or a payout reset.',
            'The Weiss method is useful because many energy leaders have long yield histories across oil cycles. Still, the signal should be paired with payout coverage, debt, commodity exposure, and management commitment to the dividend.',
          ],
        },
        {
          heading: 'Integrated majors vs midstream income',
          paragraphs: [
            'Integrated majors earn from exploration, production, refining, and chemicals. That diversification helps, but earnings still move with oil and gas prices. The dividend survives because the balance sheet is managed for downcycles.',
            'Midstream companies operate pipelines, terminals, and processing assets. Fee-based contracts can make cash flows steadier than upstream producers, but investors still need to check leverage, contract duration, counterparty quality, and distribution coverage.',
          ],
        },
      ]}
      checklist={[
        'Dividend survived prior oil and gas downturns.',
        'Balance sheet can support the payout through weak commodity prices.',
        'Payout coverage is based on normalized cash flow, not peak-cycle cash flow.',
        'Midstream contracts or integrated operations reduce volatility.',
        'Weiss signal is supported by dividend safety and quality metrics.',
      ]}
    />
  )
}
