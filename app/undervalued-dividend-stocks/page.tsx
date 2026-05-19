import type { Metadata } from 'next'
import OpportunitiesPage from '@/app/opportunities/page'

export const metadata: Metadata = {
  title: 'Undervalued Dividend Stocks Today - Weiss Signal Opportunities',
  description:
    'Undervalued dividend stocks trading near 10-year high dividend yields, ranked by quality score, payout safety, and Geraldine Weiss valuation signal. Updated daily.',
  alternates: {
    canonical: 'https://dividendvisual.com/undervalued-dividend-stocks',
  },
  openGraph: {
    title: 'Undervalued Dividend Stocks Today | DividendVisual',
    description:
      'Find dividend stocks currently trading in historically undervalued territory by the Geraldine Weiss dividend yield method.',
    url: 'https://dividendvisual.com/undervalued-dividend-stocks',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Undervalued Dividend Stocks Today | DividendVisual',
    description:
      'Dividend stocks near 10-year high yields, ranked by quality score and Weiss valuation signal.',
  },
}

export default OpportunitiesPage
