import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DRIPCalculatorClient } from '@/components/calculators/DRIPCalculatorClient'
import { serializeJsonLd } from '@/lib/json-ld'
import type { TickerResponse } from '@/lib/types'

const STATIC_TICKERS = ['KO', 'JNJ', 'PG', 'O', 'ABBV', 'HD', 'MO', 'XOM', 'TXN', 'BDX', 'MKC', 'NNN', 'VZ', 'FAST', 'STAG']

interface PageProps {
  params: Promise<{ ticker: string }>
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

export function generateStaticParams() {
  return STATIC_TICKERS.map((t) => ({ ticker: t.toLowerCase() }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params
  const sym = ticker.toUpperCase()
  const data = await getTickerData(sym)
  if (!data) return { title: `${sym} DRIP Calculator` }

  const { company, metrics } = data
  const yieldPct = (metrics.currentYield * 100).toFixed(1)
  const cagrPct = metrics.dividendCagr5y != null
    ? (metrics.dividendCagr5y * 100).toFixed(1)
    : null

  const title = `${company.name} (${sym}) DRIP Calculator 2026 — Project Your Dividend Reinvestment Income`
  const description = cagrPct
    ? `Pre-filled with ${sym}'s current ${yieldPct}% yield and ${cagrPct}% 5-year dividend CAGR. See how much annual dividend income a $10,000 ${company.name} DRIP investment generates after 10 or 20 years.`
    : `Pre-filled with ${sym}'s current ${yieldPct}% yield. See how much annual dividend income a $10,000 ${company.name} DRIP investment generates after 10 or 20 years.`

  return {
    title,
    description,
    alternates: { canonical: `https://dividendvisual.com/drip-calculator/${ticker.toLowerCase()}` },
    openGraph: {
      title: `${title} | DividendVisual`,
      description,
      url: `https://dividendvisual.com/drip-calculator/${ticker.toLowerCase()}`,
      type: 'website',
    },
  }
}

export default async function TickerDRIPCalculatorPage({ params }: PageProps) {
  const { ticker } = await params
  const sym = ticker.toUpperCase()
  const data = await getTickerData(sym)
  if (!data) notFound()

  const { company, metrics } = data
  const yieldPct = (metrics.currentYield * 100).toFixed(1)
  const cagrPct = metrics.dividendCagr5y != null
    ? (metrics.dividendCagr5y * 100).toFixed(1)
    : null

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${company.name} (${sym}) DRIP Calculator`,
    description: `Project ${company.name} dividend reinvestment compounding. Pre-filled with current yield and historical dividend growth rate.`,
    url: `https://dividendvisual.com/drip-calculator/${ticker.toLowerCase()}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(webAppSchema) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'DRIP Calculator', href: '/drip-calculator' },
        { label: sym },
      ]} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#f4f4f5] leading-tight mb-3">
          {company.name} ({sym}) DRIP Calculator — Project Your Dividend Income
        </h1>
        <p className="text-[#71717a] leading-relaxed">
          {company.name} ({sym}) currently yields {yieldPct}%
          {cagrPct ? ` with a 5-year dividend CAGR of approximately ${cagrPct}%` : ''}.
          {' '}This calculator is pre-filled with those values so you can project exactly how much
          annual income a {sym} DRIP investment would generate over your target horizon.
        </p>
      </header>

      <DRIPCalculatorClient
        initialYield={parseFloat(yieldPct)}
        initialCagr={cagrPct ? parseFloat(cagrPct) : undefined}
      />

      <div className="mt-6 p-4 bg-[#111118] border border-[#1e1e2e] rounded-xl">
        <p className="text-xs text-[#71717a] mb-3">Read the full {sym} dividend analysis:</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/analysis/${ticker.toLowerCase()}`}
            className="px-3 py-1.5 rounded-md bg-[#6366f1]/10 text-xs text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors"
          >
            {sym} Dividend Analysis →
          </Link>
          <Link
            href={`/ticker/${sym}`}
            className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-xs font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
          >
            {sym} Weiss Chart
          </Link>
          <Link
            href="/drip-calculator"
            className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-xs text-[#71717a] hover:text-[#f4f4f5] transition-colors"
          >
            ← DRIP Calculator (blank)
          </Link>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#111118] border border-[#1e1e2e] rounded-xl">
        <p className="text-xs text-[#71717a] mb-3">Try other dividend stocks:</p>
        <div className="flex flex-wrap gap-2">
          {STATIC_TICKERS.filter((t) => t !== sym).slice(0, 8).map((t) => (
            <Link
              key={t}
              href={`/drip-calculator/${t.toLowerCase()}`}
              className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-xs font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
