import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'

const PAGE_URL = 'https://dividendvisual.com/best-utility-dividend-stocks'
const YEAR = 2026

export const metadata: Metadata = {
  title: `Best Utility Dividend Stocks ${YEAR} - Ranked by Yield, Safety & Weiss Signal`,
  description:
    'Best utility dividend stocks ranked by dividend yield, payout reliability, quality score, dividend growth, and Geraldine Weiss valuation signal. Compare NEE, SO, DUK, WEC, AEP, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Utility Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare utility dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Utility Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Utility dividend stocks ranked by yield, safety, quality, and Weiss valuation signal.',
  },
}

export default function BestUtilityDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_utility_dividend_stocks_viewed"
      source="best-utility-dividend-stocks"
      dbSector="Utilities"
      eyebrow="Regulated income stocks screened for payout reliability"
      title={`Best Utility Dividend Stocks ${YEAR}`}
      description="Compare utility dividend stocks by current yield, payout reliability, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for income investors looking for regulated cash flows and rate-cycle entry points."
      statLabel="Utilities tracked"
      ctaTitle="Get alerts when utility dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with utilities and other quality income stocks entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/high-yield-dividend-stocks', label: 'High yield dividend stocks' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
        { href: '/compare/so-vs-duk', label: 'SO vs DUK comparison' },
        { href: '/compare/nee-vs-so', label: 'NEE vs SO comparison' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
        { href: '/blog/best-utility-dividend-stocks-2026', label: 'Utility dividend stock guide' },
      ]}
      sections={[
        {
          heading: 'How to evaluate utility dividend stocks',
          paragraphs: [
            'Utilities are different from most dividend stocks because regulated rates and approved capital spending drive earnings. A utility builds infrastructure, adds it to the rate base, earns an allowed return, and uses that predictable cash flow to support dividends.',
            'This makes utilities strong candidates for dividend income, but not all utilities are equal. Regulatory environment, debt, capital investment plans, and dividend growth targets all matter when comparing yield and safety.',
          ],
        },
        {
          heading: 'Why the Weiss method works well for utilities',
          paragraphs: [
            'Utility yields are heavily shaped by interest-rate cycles. When bond yields rise, income investors often rotate away from utilities, prices fall, and current yields move toward historical highs.',
            'That rate-driven repricing can create attractive Weiss undervalue signals when the underlying utility business is still healthy. The best entries usually combine an Undervalued signal with a constructive regulatory backdrop and a dividend growth plan that still beats inflation.',
          ],
        },
        {
          heading: 'The key utility risk is not usually demand',
          paragraphs: [
            'Electricity and gas demand is relatively stable, but utilities are capital-intensive. Rising debt costs, difficult rate cases, and large project overruns can pressure earnings and slow dividend growth.',
            'Before buying a utility stock for income, compare yield against history, then check payout ratio, rate base growth, allowed returns, and whether the company operates in states with constructive regulators.',
          ],
        },
      ]}
      checklist={[
        'Yield is high versus the utility\'s own history.',
        'Regulatory environment supports cost recovery.',
        'Payout ratio is normal for a regulated utility.',
        'Rate base growth can fund future dividend raises.',
        'Debt and large projects do not threaten dividend growth.',
      ]}
    />
  )
}
