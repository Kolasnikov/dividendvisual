import type { Metadata } from 'next'
import type { Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { PortfolioClient } from '@/components/portfolio/PortfolioClient'
import { getWatchlistStocks } from '@/lib/stock-data'

export const metadata: Metadata = {
  title: 'Dividend Portfolio Tracker — Income & Weiss Signal Overview',
  description: 'Track your dividend portfolio with live Weiss valuation signals, annual income, yield on cost, and quality scores. Saved locally — no account needed.',
  alternates: {
    canonical: 'https://dividendvisual.com/portfolio',
  },
  openGraph: {
    title: 'Dividend Portfolio Tracker | DividendVisual',
    description: 'Track your dividend holdings with live Weiss signals, annual income, and yield on cost. No account needed.',
    url: 'https://dividendvisual.com/portfolio',
  },
}

type UniverseRow = Company & ComputedMetrics

async function getUniverse(): Promise<UniverseRow[]> {
  return getWatchlistStocks()
}

export default async function PortfolioPage() {
  const universe = await getUniverse()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Portfolio Tracker' },
      ]} />

      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-2">Dividend Portfolio Tracker</h1>
        <p className="text-[#71717a] text-sm leading-relaxed">
          Add your holdings to see live Weiss signals, annual income, yield on cost, and portfolio quality score.
          Everything is saved locally in your browser — no account required.
        </p>
      </div>

      <PortfolioClient universe={universe} />
    </div>
  )
}
