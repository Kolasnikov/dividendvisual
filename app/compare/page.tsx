import type { Metadata } from 'next'
import type { TickerResponse } from '@/lib/types'
import { CompareClient } from '@/components/compare/CompareClient'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>
}

async function getTickerData(symbol: string): Promise<TickerResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/ticker/${symbol.toUpperCase()}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { a, b } = await searchParams
  const symA = a?.toUpperCase()
  const symB = b?.toUpperCase()

  const title = symA && symB
    ? `${symA} vs ${symB} Dividend Comparison`
    : 'Compare Dividend Stocks'

  const description = symA && symB
    ? `Compare ${symA} and ${symB} side by side — yield, Weiss signal, quality score, dividend streak, and CAGR. Find which dividend stock is more undervalued today.`
    : 'Compare any two dividend stocks side by side. Yield, Weiss valuation signal, quality score, dividend streak, and growth rate — all in one view.'

  return {
    title: `${title} | DividendVisual`,
    description,
    alternates: {
      canonical: 'https://dividendvisual.com/compare',
    },
    openGraph: {
      title: `${title} | DividendVisual`,
      description,
      url: 'https://dividendvisual.com/compare',
    },
  }
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { a, b } = await searchParams
  const symbolA = a?.toUpperCase() ?? ''
  const symbolB = b?.toUpperCase() ?? ''

  const [dataA, dataB] = await Promise.all([
    symbolA ? getTickerData(symbolA) : Promise.resolve(null),
    symbolB ? getTickerData(symbolB) : Promise.resolve(null),
  ])

  const breadcrumbLabel = symbolA && symbolB
    ? `${symbolA} vs ${symbolB}`
    : 'Compare'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: breadcrumbLabel },
      ]} />
      <CompareClient
        symbolA={symbolA}
        symbolB={symbolB}
        dataA={dataA}
        dataB={dataB}
      />
    </div>
  )
}
