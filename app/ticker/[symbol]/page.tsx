import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { TickerResponse, Company, ComputedMetrics } from '@/lib/types'
import { WeissChart } from '@/components/charts/WeissChart'
import { QualityScoreCard } from '@/components/cards/QualityScoreCard'
import { WhyNowCard } from '@/components/cards/WhyNowCard'
import { MetricsCard } from '@/components/cards/MetricsCard'
import { DRIPChart } from '@/components/charts/DRIPChart'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface PageProps {
  params: Promise<{ symbol: string }>
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params
  const data = await getTickerData(symbol)
  if (!data) return { title: symbol.toUpperCase() }
  const { company, metrics } = data
  const signalLabel = metrics.weissSignal === 'undervalued' ? 'undervalued' : metrics.weissSignal === 'overvalued' ? 'overvalued' : 'fairly valued'
  const description = `${company.name} (${company.symbol}) dividend analysis. Current yield ${(metrics.currentYield * 100).toFixed(2)}% — historically ${signalLabel} based on Weiss valuation bands. Quality score ${metrics.qualityScore}/100. Dividend yield history, DRIP income projections, and payout analysis.`
  return {
    title: `${company.symbol} Dividend Analysis — ${company.name}`,
    description,
    alternates: {
      canonical: `https://dividendvisual.com/analysis/${company.symbol.toLowerCase()}`,
    },
    openGraph: {
      title: `${company.symbol} Dividend Analysis | DividendVisual`,
      description,
      url: `https://dividendvisual.com/ticker/${company.symbol}`,
    },
  }
}

function buildSummary(company: Company, metrics: ComputedMetrics): string {
  const yieldPct = (metrics.currentYield * 100).toFixed(2)
  const signal =
    metrics.weissSignal === 'undervalued' ? 'historically undervalued'
    : metrics.weissSignal === 'overvalued' ? 'historically overvalued'
    : 'trading near fair value'

  const streakText = company.yearsIncreasingDividends > 0
    ? `${company.yearsIncreasingDividends} consecutive years of dividend growth`
    : 'an established dividend payment history'

  const payoutText = metrics.payoutRatio != null && metrics.payoutRatio <= 2.0
    ? ` with a ${(metrics.payoutRatio * 100).toFixed(0)}% payout ratio`
    : ''

  const cagrText = metrics.dividendCagr5y != null
    ? ` The 5-year dividend CAGR stands at ${(metrics.dividendCagr5y * 100).toFixed(1)}%.`
    : ''

  const sectorText = company.sector ? ` is a ${company.sector} company that` : ''

  return `${company.name} (${company.symbol})${sectorText} currently yields ${yieldPct}% — ${signal} based on 10 years of dividend yield history. The Weiss valuation model places the undervaluation threshold at $${metrics.undervaluedPrice.toFixed(2)} and the overvaluation threshold at $${metrics.overvaluedPrice.toFixed(2)}. ${company.name} holds a quality score of ${metrics.qualityScore}/100 (${metrics.qualityCategory}), reflecting ${streakText}${payoutText}.${cagrText}`
}

function buildJsonLd(company: Company, metrics: ComputedMetrics) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${company.symbol} Dividend Analysis — ${company.name}`,
    description: buildSummary(company, metrics),
    url: `https://dividendvisual.com/ticker/${company.symbol}`,
    dateModified: metrics.updatedAt ?? new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'DividendVisual',
      url: 'https://dividendvisual.com',
    },
    about: {
      '@type': 'Corporation',
      name: company.name,
      tickerSymbol: company.symbol,
    },
  }
}

const COLLECTION_LINKS: { slug: string; title: string; check: (c: Company) => boolean }[] = [
  { slug: 'dividend-kings',       title: 'Dividend Kings',       check: (c) => c.isDividendKing },
  { slug: 'dividend-aristocrats', title: 'Dividend Aristocrats', check: (c) => c.isDividendAristocrat && !c.isDividendKing },
  { slug: 'utilities',            title: 'Utilities',            check: (c) => c.sector === 'Utilities' },
  { slug: 'reits',                title: 'REITs',                check: (c) => c.sector === 'Real Estate' },
]

const BLOG_ARTICLES = {
  weiss:      { slug: 'geraldine-weiss-dividend-valuation-method',  title: 'The Geraldine Weiss Method Explained' },
  howTo:      { slug: 'how-to-find-undervalued-dividend-stocks',    title: 'How to Find Undervalued Dividend Stocks' },
  kings:      { slug: 'dividend-kings-list-analysis',               title: 'Dividend Kings: What 50 Years of Growth Means' },
  comparison: { slug: 'dividend-aristocrats-vs-kings',              title: 'Dividend Aristocrats vs Kings' },
  ko:         { slug: 'coca-cola-ko-dividend-analysis',             title: 'Coca-Cola (KO): 62 Years of Dividend Growth' },
  jnj:        { slug: 'johnson-johnson-jnj-dividend-analysis',      title: 'Johnson & Johnson (JNJ) Dividend Analysis' },
  pg:         { slug: 'procter-gamble-pg-dividend-analysis',        title: 'Procter & Gamble (PG) Dividend Analysis' },
  hd:         { slug: 'home-depot-hd-dividend-analysis',            title: 'Home Depot (HD): The Low-Yield Income Machine' },
  trap:       { slug: 'dividend-yield-trap',                        title: 'The Dividend Yield Trap Explained' },
} as const

const HIGH_YIELD_WATCH = new Set(['MO', 'T', 'VZ', 'PFE', 'BMY', 'MAIN', 'CPB', 'HRL', 'KMB', 'CLX', 'NNN', 'D'])

function getRelatedArticles(symbol: string, isDividendKing: boolean, isDividendAristocrat: boolean) {
  const keys: (keyof typeof BLOG_ARTICLES)[] = []
  if (symbol === 'KO') keys.push('ko')
  if (symbol === 'JNJ') keys.push('jnj')
  if (symbol === 'PG') keys.push('pg')
  if (symbol === 'HD') keys.push('hd')
  if (isDividendKing) keys.push('kings')
  if (isDividendKing || isDividendAristocrat) keys.push('comparison')
  if (HIGH_YIELD_WATCH.has(symbol)) keys.push('trap')
  keys.push('weiss')
  if (keys.length < 3) keys.push('howTo')
  return [...new Set(keys)].slice(0, 3).map((k) => BLOG_ARTICLES[k])
}

export default async function TickerPage({ params }: PageProps) {
  const { symbol } = await params
  const data = await getTickerData(symbol)
  if (!data) notFound()

  const { company, metrics, chartData } = data
  const relatedCollections = COLLECTION_LINKS.filter((c) => c.check(company))
  const summary = buildSummary(company, metrics)
  const jsonLd = buildJsonLd(company, metrics)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Watchlist', href: '/watchlist' },
        { label: `${company.symbol} — ${company.name}` },
      ]} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#f4f4f5]">{company.name}</h1>
              <span className="text-xl font-mono text-[#71717a]">{company.symbol}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {company.sector && (
                <span className="text-sm text-[#71717a]">{company.sector}</span>
              )}
              {company.isDividendKing && <DividendBadge type="king" />}
              {company.isDividendAristocrat && !company.isDividendKing && (
                <DividendBadge type="aristocrat" />
              )}
              {company.isBlueChip && !company.isDividendKing && !company.isDividendAristocrat && (
                <DividendBadge type="bluechip" />
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-[#f4f4f5] mb-1">
              ${metrics.currentPrice.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-lg font-medium text-[#f4f4f5]">
                {(metrics.currentYield * 100).toFixed(2)}%
              </span>
              <SignalBadge signal={metrics.weissSignal} />
            </div>
          </div>
        </div>

        {/* Server-rendered summary — crawlable by Google */}
        <p className="mt-4 text-sm text-[#71717a] leading-relaxed max-w-3xl">
          {summary}
        </p>
      </div>

      {/* Main layout: chart area + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Left — chart column */}
        <div className="space-y-6">
          {/* Weiss Chart */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-medium text-[#71717a]">
                {company.symbol} Dividend Yield History — Weiss Valuation
              </h2>
              <div className="flex items-center gap-4 text-xs text-[#71717a]">
                <span>
                  Underval. <span className="text-[#22c55e] font-medium">${metrics.undervaluedPrice.toFixed(2)}</span>
                </span>
                <span>
                  Overval. <span className="text-[#ef4444] font-medium">${metrics.overvaluedPrice.toFixed(2)}</span>
                </span>
              </div>
            </div>
            <WeissChart data={chartData} currentPrice={metrics.currentPrice} />
          </div>

          {/* Why Now */}
          <WhyNowCard metrics={metrics} />

          {/* DRIP Compounder */}
          <div>
            <h2 className="sr-only">{company.symbol} Dividend Income Projection — DRIP Compounder</h2>
            <DRIPChart metrics={metrics} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div>
            <h2 className="sr-only">{company.symbol} Dividend Quality Score</h2>
            <QualityScoreCard metrics={metrics} />
          </div>
          <MetricsCard metrics={metrics} />

          {/* Dividend streak callout */}
          {company.yearsIncreasingDividends > 0 && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#6366f1] mb-1">
                {company.yearsIncreasingDividends}
              </div>
              <div className="text-sm text-[#71717a]">consecutive years of dividend growth</div>
            </div>
          )}

          {/* Analysis article link */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-xs text-[#71717a] mb-2">In-depth analysis</p>
            <Link
              href={`/analysis/${company.symbol.toLowerCase()}`}
              className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
            >
              → {company.symbol} Dividend Analysis Article
            </Link>
          </div>

          {/* Related blog articles */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-xs text-[#71717a] mb-3 font-medium uppercase tracking-wide">Related Reading</p>
            <div className="flex flex-col gap-2">
              {getRelatedArticles(company.symbol, company.isDividendKing, company.isDividendAristocrat).map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                >
                  → {article.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Related collections */}
          {relatedCollections.length > 0 && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
              <p className="text-xs text-[#71717a] mb-3 font-medium uppercase tracking-wide">Collections</p>
              <div className="flex flex-col gap-2">
                {relatedCollections.map(({ slug, title }) => (
                  <Link
                    key={slug}
                    href={`/collections/${slug}`}
                    className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                  >
                    → {title}
                  </Link>
                ))}
                <Link
                  href="/watchlist"
                  className="text-sm text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                >
                  → Full Watchlist
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
