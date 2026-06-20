import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { TickerResponse } from '@/lib/types'
import { CompareClient } from '@/components/compare/CompareClient'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { serializeJsonLd } from '@/lib/json-ld'

export const COMPARE_PAIRS = [
  // Pairs with dedicated blog articles
  'ko-vs-pep', 'xom-vs-cvx', 'jnj-vs-abbv', 'o-vs-nnn', 'aapl-vs-msft',
  'unh-vs-cvs', 'lmt-vs-noc', 'avgo-vs-qcom', 't-vs-vz', 'cat-vs-mmm',
  // Additional high-search pairs
  'v-vs-ma', 'hd-vs-low', 'pg-vs-ko', 'mo-vs-pm', 'so-vs-duk',
  'jpm-vs-usb', 'nee-vs-so', 'o-vs-stag', 'msft-vs-txn', 'ko-vs-pg',
]

export const COMPARE_PAIR_META: Record<string, { category: string; angle: string }> = {
  'ko-vs-pep': { category: 'Consumer staples', angle: 'cola and snack dividend compounders' },
  'xom-vs-cvx': { category: 'Energy', angle: 'integrated oil dividend stocks' },
  'jnj-vs-abbv': { category: 'Healthcare', angle: 'pharma dividend stocks' },
  'o-vs-nnn': { category: 'REITs', angle: 'net lease monthly and quarterly REIT income' },
  'aapl-vs-msft': { category: 'Technology', angle: 'mega-cap dividend growth compounders' },
  'unh-vs-cvs': { category: 'Healthcare', angle: 'managed care and healthcare income' },
  'lmt-vs-noc': { category: 'Industrials', angle: 'defense dividend stocks' },
  'avgo-vs-qcom': { category: 'Technology', angle: 'semiconductor dividend growers' },
  't-vs-vz': { category: 'Telecom', angle: 'high-yield telecom income stocks' },
  'cat-vs-mmm': { category: 'Industrials', angle: 'cyclical industrial dividend stocks' },
  'v-vs-ma': { category: 'Financials', angle: 'payment network dividend compounders' },
  'hd-vs-low': { category: 'Consumer discretionary', angle: 'home improvement dividend stocks' },
  'pg-vs-ko': { category: 'Consumer staples', angle: 'defensive Dividend Kings' },
  'mo-vs-pm': { category: 'Consumer staples', angle: 'tobacco income stocks' },
  'so-vs-duk': { category: 'Utilities', angle: 'regulated utility dividend stocks' },
  'jpm-vs-usb': { category: 'Financials', angle: 'bank dividend stocks' },
  'nee-vs-so': { category: 'Utilities', angle: 'utility growth vs income' },
  'o-vs-stag': { category: 'REITs', angle: 'monthly REIT dividend stocks' },
  'msft-vs-txn': { category: 'Technology', angle: 'technology dividend growth stocks' },
  'ko-vs-pg': { category: 'Consumer staples', angle: 'Dividend King core holdings' },
}

interface PageProps {
  params: Promise<{ pair: string }>
}

function parsePair(pair: string): [string, string] | null {
  const parts = pair.split('-vs-')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  return [parts[0].toUpperCase(), parts[1].toUpperCase()]
}

function pct(v: number | null, d = 2) {
  if (v == null) return 'n/a'
  return `${(v * 100).toFixed(d)}%`
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
  const title = `${symA} vs ${symB} Dividend Stock Comparison 2026`
  const description = `Compare ${symA} vs ${symB} for dividend yield, Weiss valuation signal, quality score, payout ratio, dividend growth, and income safety. See which dividend stock looks better today.`
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

function buildArticleJsonLd(pair: string, dataA: TickerResponse, dataB: TickerResponse) {
  const { company: cA } = dataA
  const { company: cB } = dataB
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${cA.symbol} vs ${cB.symbol} Dividend Stock Comparison 2026`,
    description: `Dividend comparison of ${cA.name} (${cA.symbol}) and ${cB.name} (${cB.symbol}) by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.`,
    url: `https://dividendvisual.com/compare/${pair}`,
    author: { '@type': 'Organization', name: 'DividendVisual' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    isAccessibleForFree: true,
  }
}

function buildBreadcrumbJsonLd(pair: string, dataA: TickerResponse, dataB: TickerResponse) {
  const { company: cA } = dataA
  const { company: cB } = dataB
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dividendvisual.com/' },
      { '@type': 'ListItem', position: 2, name: 'Dividend Stock Comparisons', item: 'https://dividendvisual.com/dividend-stock-comparisons' },
      { '@type': 'ListItem', position: 3, name: `${cA.symbol} vs ${cB.symbol}`, item: `https://dividendvisual.com/compare/${pair}` },
    ],
  }
}

function verdict(dataA: TickerResponse, dataB: TickerResponse) {
  const { company: cA, metrics: mA } = dataA
  const { company: cB, metrics: mB } = dataB
  const yieldWinner = mA.currentYield >= mB.currentYield ? cA : cB
  const qualityWinner = mA.qualityScore >= mB.qualityScore ? cA : cB
  const growthWinner = (mA.dividendCagr5y ?? -Infinity) >= (mB.dividendCagr5y ?? -Infinity) ? cA : cB
  const signalWinner =
    mA.weissSignal === 'undervalued' && mB.weissSignal !== 'undervalued' ? cA :
    mB.weissSignal === 'undervalued' && mA.weissSignal !== 'undervalued' ? cB :
    null

  return { yieldWinner, qualityWinner, growthWinner, signalWinner }
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
  const articleJsonLd = buildArticleJsonLd(pair, dataA, dataB)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(pair, dataA, dataB)
  const meta = COMPARE_PAIR_META[pair]
  const winners = verdict(dataA, dataB)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Comparisons', href: '/dividend-stock-comparisons' },
        { label: `${symA} vs ${symB}` },
      ]} />

      <section className="mb-8">
        {meta ? (
          <div className="mb-3 inline-flex items-center rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3 py-1 text-xs font-medium text-[#818cf8]">
            {meta.category} comparison
          </div>
        ) : null}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-3">
          {symA} vs {symB} Dividend Stock Comparison 2026
        </h1>
        <p className="text-[#a1a1aa] text-base leading-relaxed max-w-3xl">
          Compare {dataA.company.name} and {dataB.company.name} by dividend yield, payout safety, dividend growth,
          quality score, and Geraldine Weiss valuation signal{meta ? ` across ${meta.angle}.` : '.'}
        </p>
      </section>

      <section className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Higher yield', value: `${winners.yieldWinner.symbol} (${pct(winners.yieldWinner.symbol === symA ? dataA.metrics.currentYield : dataB.metrics.currentYield)})` },
          { label: 'Better quality', value: `${winners.qualityWinner.symbol} (${winners.qualityWinner.symbol === symA ? dataA.metrics.qualityScore : dataB.metrics.qualityScore}/100)` },
          { label: 'Faster 5Y growth', value: `${winners.growthWinner.symbol} (${pct(winners.growthWinner.symbol === symA ? dataA.metrics.dividendCagr5y : dataB.metrics.dividendCagr5y, 1)})` },
          { label: 'Weiss signal edge', value: winners.signalWinner ? winners.signalWinner.symbol : 'Tie / neutral' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
            <p className="text-sm font-semibold text-[#f4f4f5]">{value}</p>
            <p className="mt-1 text-xs text-[#71717a]">{label}</p>
          </div>
        ))}
      </section>

      <CompareClient symbolA={symA} symbolB={symB} dataA={dataA} dataB={dataB} />

      <section className="mt-10">
        <DividendAlertsCTA
          source="compare-page"
          title={`Get alerts when ${symA} or ${symB} becomes undervalued`}
          description="A weekly digest of quality dividend stocks entering historically attractive Weiss yield territory."
        />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        <article className="prose-dv max-w-3xl">
          <h2>How to read this comparison</h2>
          <p>
            Start with the Weiss signal to see whether either stock is historically cheap relative to its own dividend
            yield history. Then compare quality score, payout ratio, and dividend growth to avoid choosing a stock only
            because the current yield is higher.
          </p>
          <p>
            A higher yield can mean better income value, but it can also signal slower growth or higher dividend risk.
            The strongest dividend comparison winner usually combines an attractive Weiss signal, a manageable payout
            ratio, positive dividend growth, and a quality score that is stronger than the peer.
          </p>
        </article>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Related comparison pages</p>
          <div className="flex flex-col gap-2">
            {COMPARE_PAIRS.filter((slug) => slug !== pair).slice(0, 6).map((slug) => {
              const [a, b] = slug.split('-vs-').map((part) => part.toUpperCase())
              return (
                <a key={slug} href={`/compare/${slug}`} className="text-sm text-[#6366f1] hover:text-[#818cf8]">
                  {a} vs {b} -&gt;
                </a>
              )
            })}
          </div>
        </aside>
      </section>

      {/* TradingView deep links */}
      <div className="mt-8 pt-6 border-t border-[#1e1e2e] flex flex-wrap items-center gap-4">
        <span className="text-xs text-[#52525b]">Full charts on TradingView:</span>
        <a
          href={`https://www.tradingview.com/symbols/${symA}/?aff_id=166728&aff_sub=pairs`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          {symA} ↗
        </a>
        <a
          href={`https://www.tradingview.com/symbols/${symB}/?aff_id=166728&aff_sub=pairs`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          {symB} ↗
        </a>
      </div>
    </div>
  )
}
