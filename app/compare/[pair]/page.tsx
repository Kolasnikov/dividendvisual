import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { TickerResponse } from '@/lib/types'
import { CompareClient } from '@/components/compare/CompareClient'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const COMPARE_PAIRS = [
  // Pairs with dedicated blog articles
  'ko-vs-pep', 'xom-vs-cvx', 'jnj-vs-abbv', 'o-vs-nnn', 'aapl-vs-msft',
  'unh-vs-cvs', 'lmt-vs-noc', 'avgo-vs-qcom', 't-vs-vz', 'cat-vs-mmm',
  // Additional high-search pairs
  'v-vs-ma', 'hd-vs-low', 'pg-vs-ko', 'mo-vs-pm', 'so-vs-duk',
  'jpm-vs-usb', 'nee-vs-so', 'o-vs-stag', 'msft-vs-txn', 'ko-vs-pg',
]

interface PageProps {
  params: Promise<{ pair: string }>
}

function parsePair(pair: string): [string, string] | null {
  const parts = pair.split('-vs-')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  return [parts[0].toUpperCase(), parts[1].toUpperCase()]
}

async function getTickerData(symbol: string): Promise<TickerResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/ticker/${symbol}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  return COMPARE_PAIRS.map(pair => ({ pair }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params
  const parsed = parsePair(pair)
  if (!parsed) return { title: 'Compare Dividend Stocks' }
  const [symA, symB] = parsed
  const title = `${symA} vs ${symB} Dividend Comparison — Which Is More Undervalued?`
  const description = `Compare ${symA} and ${symB} side by side — dividend yield, Weiss signal, quality score, dividend streak, payout ratio, and 5-year CAGR. Find which dividend stock offers better income value today.`
  return {
    title,
    description,
    alternates: { canonical: `https://dividendvisual.com/compare/${pair}` },
    openGraph: {
      title: `${symA} vs ${symB} Dividend Comparison | DividendVisual`,
      description,
      url: `https://dividendvisual.com/compare/${pair}`,
      type: 'article',
    },
  }
}

function buildFaqJsonLd(dataA: TickerResponse, dataB: TickerResponse) {
  const { company: cA, metrics: mA } = dataA
  const { company: cB, metrics: mB } = dataB
  const symA = cA.symbol, symB = cB.symbol

  const signalAnswer = (() => {
    const under = (s: string) => s === 'undervalued'
    if (under(mA.weissSignal) && !under(mB.weissSignal))
      return `${cA.name} (${symA}) is currently undervalued by the Weiss method, while ${cB.name} (${symB}) is ${mB.weissSignal}. ${symA} has the more attractive entry signal.`
    if (under(mB.weissSignal) && !under(mA.weissSignal))
      return `${cB.name} (${symB}) is currently undervalued by the Weiss method, while ${cA.name} (${symA}) is ${mA.weissSignal}. ${symB} has the more attractive entry signal.`
    if (under(mA.weissSignal) && under(mB.weissSignal))
      return `Both ${symA} and ${symB} are currently undervalued by the Weiss method. Compare their quality scores (${symA}: ${mA.qualityScore}/100, ${symB}: ${mB.qualityScore}/100) to identify the stronger entry.`
    return `Neither ${symA} nor ${symB} is currently in Weiss undervalued territory — ${symA} is ${mA.weissSignal} and ${symB} is ${mB.weissSignal}.`
  })()

  const yieldWinner = mA.currentYield >= mB.currentYield ? cA : cB
  const qualityWinner = mA.qualityScore >= mB.qualityScore ? cA : cB

  const questions = [
    {
      '@type': 'Question',
      name: `Is ${symA} or ${symB} more undervalued right now?`,
      acceptedAnswer: { '@type': 'Answer', text: signalAnswer },
    },
    {
      '@type': 'Question',
      name: `Which has a higher dividend yield, ${symA} or ${symB}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${yieldWinner.name} (${yieldWinner.symbol}) currently has the higher dividend yield: ${symA} yields ${(mA.currentYield * 100).toFixed(2)}% versus ${symB} at ${(mB.currentYield * 100).toFixed(2)}%.`,
      },
    },
    {
      '@type': 'Question',
      name: `Which has a better dividend quality score, ${symA} or ${symB}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${qualityWinner.name} (${qualityWinner.symbol}) scores higher: ${symA} scores ${mA.qualityScore}/100 versus ${symB} at ${mB.qualityScore}/100. The quality score reflects payout ratio, dividend streak, 5-year CAGR, and FCF coverage.`,
      },
    },
    ...(mA.dividendCagr5y != null && mB.dividendCagr5y != null ? [{
      '@type': 'Question',
      name: `Which has grown its dividend faster, ${symA} or ${symB}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${(mA.dividendCagr5y >= mB.dividendCagr5y ? cA : cB).name} has the higher 5-year dividend CAGR: ${symA} at ${(mA.dividendCagr5y * 100).toFixed(1)}% versus ${symB} at ${(mB.dividendCagr5y * 100).toFixed(1)}% annually.`,
      },
    }] : []),
  ]

  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions }
}

export default async function ComparePairPage({ params }: PageProps) {
  const { pair } = await params
  const parsed = parsePair(pair)
  if (!parsed) notFound()

  const [symA, symB] = parsed
  const [dataA, dataB] = await Promise.all([getTickerData(symA), getTickerData(symB)])

  if (!dataA || !dataB) notFound()

  const faqJsonLd = buildFaqJsonLd(dataA, dataB)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: `${symA} vs ${symB}` },
      ]} />

      <CompareClient symbolA={symA} symbolB={symB} dataA={dataA} dataB={dataB} />
    </div>
  )
}
