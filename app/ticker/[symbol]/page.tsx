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
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { WatchlistButton } from '@/components/ui/WatchlistButton'
import { BrokerCTA } from '@/components/cards/BrokerCTA'

const TICKERS = [
  'KO', 'PEP', 'JNJ', 'PG', 'MMM', 'MCD', 'WMT', 'HD', 'LOW',
  'ABT', 'MDT', 'ABBV', 'XOM', 'CVX', 'T', 'VZ', 'SO', 'DUK',
  'NEE', 'O', 'FRT', 'GPC', 'CLX', 'SYY', 'TGT', 'MO', 'PM',
  'MAIN', 'BEN', 'VFC',
  'KMB', 'CL', 'HRL', 'MKC', 'HSY', 'CPB',
  'BMY', 'PFE', 'AMGN', 'BDX', 'SYK',
  'EMR', 'ITW', 'CTAS', 'GD', 'CAT', 'PH',
  'USB', 'AFL', 'TROW', 'CB', 'AMP',
  'NNN', 'AMT', 'ADC',
  'AWK', 'WEC', 'AEP', 'D',
  'TXN', 'MSFT', 'ECL', 'ATO',
  'AWR', 'DOV', 'CINF', 'NDSN', 'LANC', 'GWW', 'PPG', 'RPM', 'MSA', 'NUE', 'CBSH',
  'SHW', 'ED', 'ADP', 'SPGI', 'CHD', 'ROP', 'AOS', 'EXPD', 'PAYX', 'BRO',
  'GIS', 'SJM', 'DEO', 'TJX', 'SBUX', 'FAST',
  'UNH', 'CVS', 'DGX', 'MCK',
  'BLK', 'ICE', 'CME', 'MMC', 'PNC', 'JPM', 'MTB', 'FITB', 'ALL', 'TRV', 'HBAN',
  'HON', 'ETN', 'LMT', 'NOC', 'UPS', 'UNP', 'NSC', 'CSX', 'ROK', 'AME',
  'CSCO', 'QCOM', 'AVGO', 'IBM', 'AAPL', 'ACN', 'AMAT',
  'V', 'MA', 'AXP', 'SCHW', 'MCO',
  'COST', 'NKE', 'DE',
  'MRK',
  'OKE', 'PSX', 'VLO', 'EPD',
  'ETR', 'CMS', 'XEL', 'LNT', 'SRE', 'PNW', 'OGE',
  'PSA', 'DLR', 'PLD', 'STAG', 'EXR', 'MAA', 'OHI', 'IRM', 'ESS',
  'WM', 'RSG',
]

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

export async function generateStaticParams() {
  return TICKERS.map((symbol) => ({ symbol: symbol.toLowerCase() }))
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
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: `${company.symbol} Dividend Analysis | DividendVisual`,
      description,
      url: `https://dividendvisual.com/analysis/${company.symbol.toLowerCase()}`,
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
    url: `https://dividendvisual.com/analysis/${company.symbol.toLowerCase()}`,
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

type ChecklistTone = 'positive' | 'watch' | 'risk'

function formatPercent(value: number, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`
}

function formatOptionalPercent(value: number | null, decimals = 0) {
  return value == null ? 'N/A' : formatPercent(value, decimals)
}

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(updatedAt))
}

function buildEntryRead(metrics: ComputedMetrics) {
  const targetYield = metrics.annualDividend / metrics.undervaluedPrice
  const priceGap = (metrics.currentPrice - metrics.undervaluedPrice) / metrics.currentPrice
  const yieldGap = targetYield - metrics.currentYield

  if (metrics.weissSignal === 'undervalued') {
    const discount = (metrics.undervaluedPrice - metrics.currentPrice) / metrics.undervaluedPrice

    return {
      eyebrow: 'In undervalued territory',
      title: `Price sits ${formatPercent(Math.max(discount, 0))} below the Weiss buy zone ceiling`,
      body: `The current yield already clears the historical undervaluation threshold. The next question is whether the dividend quality and payout profile deserve that higher yield.`,
      priceLabel: 'Zone ceiling',
      priceValue: `$${metrics.undervaluedPrice.toFixed(2)}`,
      yieldLabel: 'Current yield',
      yieldValue: formatPercent(metrics.currentYield, 2),
    }
  }

  return {
    eyebrow: metrics.weissSignal === 'overvalued' ? 'Entry price is stretched' : 'Waiting for a better entry',
    title: `${metrics.weissSignal === 'overvalued' ? 'Needs' : 'Needs about'} ${formatPercent(Math.max(priceGap, 0))} downside to reach the Weiss buy zone`,
    body: `Undervaluation starts near $${metrics.undervaluedPrice.toFixed(2)}, where the annual dividend would imply roughly ${formatPercent(targetYield, 2)} yield. That is ${formatPercent(Math.max(yieldGap, 0), 2)} above today's yield.`,
    priceLabel: 'Buy-zone price',
    priceValue: `$${metrics.undervaluedPrice.toFixed(2)}`,
    yieldLabel: 'Target yield',
    yieldValue: formatPercent(targetYield, 2),
  }
}

function buildResearchChecklist(company: Company, metrics: ComputedMetrics) {
  const payoutTone: ChecklistTone =
    metrics.payoutRatio == null ? 'watch'
    : metrics.payoutRatio <= 0.75 ? 'positive'
    : metrics.payoutRatio <= 1 ? 'watch'
    : 'risk'

  const fcfTone: ChecklistTone =
    metrics.fcfPayout == null ? 'watch'
    : metrics.fcfPayout <= 0.85 ? 'positive'
    : metrics.fcfPayout <= 1 ? 'watch'
    : 'risk'

  const growthTone: ChecklistTone =
    metrics.dividendCagr5y == null ? 'watch'
    : metrics.dividendCagr5y >= 0.03 ? 'positive'
    : metrics.dividendCagr5y >= 0 ? 'watch'
    : 'risk'

  const streakYears = Math.max(company.yearsIncreasingDividends, metrics.yearsNoCut)
  const streakTone: ChecklistTone = streakYears >= 10 ? 'positive' : streakYears > 0 ? 'watch' : 'risk'

  return [
    {
      label: 'Dividend durability',
      value: streakYears > 0 ? `${streakYears}Y` : 'Check',
      tone: streakTone,
      detail: streakYears >= 10
        ? 'Long dividend history supports a deeper look.'
        : 'Verify the dividend record before treating yield as durable.',
    },
    {
      label: 'Earnings payout',
      value: formatOptionalPercent(metrics.payoutRatio),
      tone: payoutTone,
      detail: payoutTone === 'positive'
        ? 'Earnings coverage leaves room for noise.'
        : 'Coverage deserves a closer look in filings.',
    },
    {
      label: 'Cash payout',
      value: formatOptionalPercent(metrics.fcfPayout),
      tone: fcfTone,
      detail: fcfTone === 'positive'
        ? 'Free cash flow coverage supports the payment.'
        : 'Confirm cash conversion and one-off effects.',
    },
    {
      label: 'Dividend growth',
      value: formatOptionalPercent(metrics.dividendCagr5y, 1),
      tone: growthTone,
      detail: growthTone === 'positive'
        ? 'Recent growth adds income compounding potential.'
        : 'Lower growth changes the return trade-off.',
    },
  ]
}

function buildNowRead(company: Company, metrics: ComputedMetrics) {
  const signalRead =
    metrics.weissSignal === 'undervalued'
      ? 'Valuation is the invitation here: the yield is elevated versus its own history.'
      : metrics.weissSignal === 'overvalued'
        ? 'Valuation is the brake here: the yield is compressed versus its own history.'
        : 'Valuation is neutral here: quality has to do more of the work than entry price.'

  const qualityRead =
    metrics.qualityScore >= 80
      ? `The ${metrics.qualityScore}/100 quality score keeps ${company.symbol} on the serious-research list.`
      : metrics.qualityScore >= 60
        ? `The ${metrics.qualityScore}/100 quality score calls for selective follow-up, not autopilot.`
        : `The ${metrics.qualityScore}/100 quality score says the headline yield needs extra skepticism.`

  const payoutRead =
    metrics.payoutRatio != null && metrics.payoutRatio > 1
      ? 'The earnings payout ratio is above 100%, so coverage is the first risk to unpack.'
      : metrics.fcfPayout != null && metrics.fcfPayout > 1
        ? 'Free cash flow payout is above 100%, so cash coverage is the first risk to unpack.'
        : 'Start by checking whether payout coverage and business durability still support the dividend.'

  return { signalRead, qualityRead, payoutRead }
}

function changeToneClass(tone: 'positive' | 'negative' | 'neutral') {
  if (tone === 'positive') return 'text-[#22c55e]'
  if (tone === 'negative') return 'text-[#f87171]'
  return 'text-[#a1a1aa]'
}

const COLLECTION_LINKS: { slug: string; title: string; check: (c: Company) => boolean }[] = [
  { slug: 'dividend-kings',       title: 'Dividend Kings',       check: (c) => c.isDividendKing },
  { slug: 'dividend-aristocrats', title: 'Dividend Aristocrats', check: (c) => c.isDividendAristocrat && !c.isDividendKing },
  { slug: 'utilities',            title: 'Utilities',            check: (c) => c.sector === 'Utilities' },
  { slug: 'reits',                title: 'REITs',                check: (c) => c.sector === 'Real Estate' },
]

function collectionHref(slug: string) {
  if (slug === 'dividend-kings') return '/dividend-kings'
  if (slug === 'dividend-aristocrats') return '/dividend-aristocrats'
  if (slug === 'high-yield') return '/high-yield-dividend-stocks'
  if (slug === 'monthly-dividend-payers') return '/best-monthly-dividend-stocks'
  if (slug === 'reits') return '/best-reit-dividend-stocks'
  if (slug === 'utilities') return '/best-utility-dividend-stocks'
  return `/collections/${slug}`
}

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
  aaplVsMsft: { slug: 'aapl-vs-msft-dividend-comparison',          title: 'AAPL vs MSFT: Which Tech Giant Pays the Better Dividend?' },
  avgoVsQcom: { slug: 'avgo-vs-qcom-dividend-comparison',          title: 'AVGO vs QCOM: The Semiconductor Dividend Battle' },
  unhVsCvs:   { slug: 'unh-vs-cvs-dividend-comparison',            title: 'UNH vs CVS: Healthcare Dividends — Compounder or Value Trap?' },
  lmtVsNoc:   { slug: 'lmt-vs-noc-dividend-comparison',            title: 'LMT vs NOC: Which Defense Dividend Is Built to Last?' },
  xomVsCvx:   { slug: 'xom-vs-cvx-dividend-comparison',            title: 'XOM vs CVX: Which Energy Dividend Survives the Oil Price Cycle?' },
  koVsPep:    { slug: 'ko-vs-pep-dividend-comparison',             title: 'KO vs PEP: The Beverage Kings — Which Dividend Compounds Better?' },
  jnjVsAbbv:  { slug: 'jnj-vs-abbv-dividend-comparison',           title: 'JNJ vs ABBV: Healthcare Dividends — Stability vs High Yield' },
  oVsNnn:     { slug: 'o-vs-nnn-reit-dividend-comparison',         title: 'O vs NNN: Monthly Dividend REITs — Scale vs. Purity' },
  tVsVz:      { slug: 't-vs-vz-dividend-comparison',               title: 'T vs VZ: High-Yield Telecom — Recovery Play or Reliable Income?' },
  catVsMmm:   { slug: 'cat-vs-mmm-dividend-comparison',            title: 'CAT vs MMM: Industrial Dividend Giants — Growth vs. Recovery' },
} as const

const HIGH_YIELD_WATCH = new Set(['MO', 'T', 'VZ', 'PFE', 'BMY', 'MAIN', 'CPB', 'HRL', 'KMB', 'CLX', 'NNN', 'D'])

const COMPARISON_MAP: Record<string, keyof typeof BLOG_ARTICLES> = {
  AAPL: 'aaplVsMsft', MSFT: 'aaplVsMsft',
  AVGO: 'avgoVsQcom', QCOM: 'avgoVsQcom',
  UNH:  'unhVsCvs',   CVS:  'unhVsCvs',
  LMT:  'lmtVsNoc',   NOC:  'lmtVsNoc',
  XOM:  'xomVsCvx',   CVX:  'xomVsCvx',
  KO:   'koVsPep',    PEP:  'koVsPep',
  JNJ:  'jnjVsAbbv',  ABBV: 'jnjVsAbbv',
  O:    'oVsNnn',     NNN:  'oVsNnn',
  T:    'tVsVz',      VZ:   'tVsVz',
  CAT:  'catVsMmm',   MMM:  'catVsMmm',
}

function getRelatedArticles(symbol: string, isDividendKing: boolean, isDividendAristocrat: boolean) {
  const keys: (keyof typeof BLOG_ARTICLES)[] = []
  if (symbol === 'KO') keys.push('ko')
  if (symbol === 'JNJ') keys.push('jnj')
  if (symbol === 'PG') keys.push('pg')
  if (symbol === 'HD') keys.push('hd')
  if (COMPARISON_MAP[symbol]) keys.push(COMPARISON_MAP[symbol])
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
  const changes = data.changes ?? {
    previousDate: null,
    currentDate: metrics.updatedAt ? metrics.updatedAt.slice(0, 10) : null,
    items: [],
  }
  const relatedCollections = COLLECTION_LINKS.filter((c) => c.check(company))
  const summary = buildSummary(company, metrics)
  const jsonLd = buildJsonLd(company, metrics)
  const entryRead = buildEntryRead(metrics)
  const researchChecklist = buildResearchChecklist(company, metrics)
  const nowRead = buildNowRead(company, metrics)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackPageView event="ticker_viewed" properties={{ symbol: company.symbol, signal: metrics.weissSignal ?? 'unknown', qualityScore: metrics.qualityScore ?? 0 }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener', href: '/dividend-screener' },
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
            <div className="mt-2 flex items-center gap-2 justify-end">
              <Link
                href={`/compare?a=${company.symbol}`}
                className="px-2.5 py-1 rounded-lg text-xs text-[#71717a] hover:text-[#f4f4f5] bg-[#1e1e2e] hover:bg-[#2e2e3e] transition-colors"
              >
                Compare
              </Link>
              <WatchlistButton symbol={company.symbol} />
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
            <WeissChart data={chartData} currentPrice={metrics.currentPrice} label={`${company.symbol} dividend yield history — Weiss valuation bands (undervalued threshold $${metrics.undervaluedPrice.toFixed(2)}, overvalued threshold $${metrics.overvaluedPrice.toFixed(2)})`} />
          </div>

          {/* Decision layer */}
          <section aria-label={`${company.symbol} dividend decision context`} className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-4">
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
              <p className="text-[10px] text-[#22c55e] uppercase tracking-wide font-medium mb-3">
                Distance to undervalued
              </p>
              <p className="text-sm text-[#a1a1aa] mb-2">{entryRead.eyebrow}</p>
              <h2 className="text-xl font-semibold text-[#f4f4f5] leading-tight mb-3">
                {entryRead.title}
              </h2>
              <p className="text-sm text-[#a1a1aa] leading-relaxed mb-5">
                {entryRead.body}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#1e1e2e] bg-[#09090f] p-3">
                  <p className="text-[10px] text-[#52525b] uppercase tracking-wide mb-1">{entryRead.priceLabel}</p>
                  <p className="text-lg font-semibold text-[#f4f4f5]">{entryRead.priceValue}</p>
                </div>
                <div className="rounded-lg border border-[#1e1e2e] bg-[#09090f] p-3">
                  <p className="text-[10px] text-[#52525b] uppercase tracking-wide mb-1">{entryRead.yieldLabel}</p>
                  <p className="text-lg font-semibold text-[#f4f4f5]">{entryRead.yieldValue}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-[10px] text-[#71717a] uppercase tracking-wide font-medium mb-1">Research checklist</p>
                  <h2 className="text-base font-semibold text-[#f4f4f5]">What to clear before buying the yield</h2>
                </div>
                <p className="text-xs text-[#52525b]">Updated {formatUpdatedAt(metrics.updatedAt)}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {researchChecklist.map((item) => (
                  <div key={item.label} className="rounded-lg border border-[#1e1e2e] bg-[#09090f] p-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs text-[#a1a1aa]">{item.label}</p>
                      <span className={`text-xs font-semibold ${
                        item.tone === 'positive'
                          ? 'text-[#22c55e]'
                          : item.tone === 'risk'
                            ? 'text-[#f87171]'
                            : 'text-[#facc15]'
                      }`}>
                        {item.value}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717a] leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What changed */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <p className="text-[10px] text-[#71717a] uppercase tracking-wide font-medium mb-1">What changed</p>
                <h2 className="text-base font-semibold text-[#f4f4f5]">
                  What changed since the last update
                </h2>
              </div>
              {changes.previousDate && changes.currentDate && (
                <p className="text-xs text-[#52525b]">{changes.previousDate} → {changes.currentDate}</p>
              )}
            </div>

            {changes.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {changes.items.map((item) => (
                  <div key={`${item.kind}-${item.label}`} className="rounded-lg border border-[#1e1e2e] bg-[#09090f] p-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs text-[#a1a1aa]">{item.label}</p>
                      {item.delta && (
                        <span className={`text-xs font-semibold ${changeToneClass(item.tone)}`}>
                          {item.delta}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#f4f4f5] mb-1">
                      {item.previous} <span className="text-[#52525b]">→</span> {item.current}
                    </p>
                    <p className="text-xs text-[#71717a] leading-relaxed">{item.sentence}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a1a1aa] leading-relaxed">
                {changes.previousDate
                  ? 'No major change in signal, yield, price, quality, or payout since the last update.'
                  : 'Change tracking is warming up. After the next data refresh, this card will show whether yield, price, signal, quality, or payout moved.'}
              </p>
            )}
          </div>

          {/* Why Now */}
          <WhyNowCard metrics={metrics} />

          {/* Decision context from the current metrics */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
            <p className="text-[10px] text-[#71717a] uppercase tracking-wide font-medium mb-2">What matters now</p>
            <h2 className="text-base font-semibold text-[#f4f4f5] mb-4">
              Read the signal before the headline yield
            </h2>
            <div className="space-y-3 text-sm text-[#a1a1aa] leading-relaxed">
              <p>{nowRead.signalRead}</p>
              <p>{nowRead.qualityRead}</p>
              <p>{nowRead.payoutRead}</p>
            </div>
          </div>

          {/* DRIP Compounder */}
          <div>
            <h2 className="sr-only">{company.symbol} Dividend Income Projection — DRIP Compounder</h2>
            <DRIPChart metrics={metrics} />
          </div>

          {/* Sharesight — track actual vs. projected */}
          <a
            href="/go/sharesight?placement=ticker-page-top"
            target="_blank"
            rel="noopener sponsored"
            className="flex items-center justify-between gap-4 rounded-xl border border-[#1e1e2e] bg-[#111118] px-5 py-4 hover:border-[#6366f1]/40 transition-colors group"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#52525b] mb-1">Track actual vs. projected</p>
              <p className="text-sm font-semibold text-[#f4f4f5]">See what {company.symbol} dividends you actually received with Sharesight</p>
              <p className="text-xs text-[#71717a] mt-0.5">Dividend income log · Yield on cost · DRIP cost basis · Tax reports</p>
            </div>
            <span className="text-[#6366f1] group-hover:text-[#818cf8] transition-colors text-lg shrink-0">→</span>
          </a>

          {/* External research tools */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 flex flex-col gap-3">
            <p className="text-[10px] text-[#52525b] uppercase tracking-wide font-medium">More research</p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-[#71717a]">Full price history &amp; technical analysis</p>
              <a
                href={`/go/tradingview?url=${encodeURIComponent(`https://www.tradingview.com/symbols/${company.symbol}/?aff_id=166728&aff_sub=ticker`)}&placement=ticker-page`}
                target="_blank"
                rel="noopener"
                className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors whitespace-nowrap"
              >
                TradingView ↗
              </a>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#1e1e2e] pt-3">
              <p className="text-xs text-[#71717a]">Fundamentals, valuation &amp; analyst ratings</p>
              <a
                href={`/go/finviz?url=${encodeURIComponent(`https://finviz.com/quote.ashx?t=${company.symbol}&affilId=757578555`)}&placement=ticker-page`}
                target="_blank"
                rel="noopener"
                className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors whitespace-nowrap"
              >
                FinViz ↗
              </a>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#1e1e2e] pt-3">
              <p className="text-xs text-[#71717a]">Moat rating &amp; analyst fair value</p>
              <a
                href="/go/morningstar?placement=ticker-page"
                target="_blank"
                rel="noopener sponsored"
                className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors whitespace-nowrap"
              >
                Morningstar ↗
              </a>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#1e1e2e] pt-3">
              <p className="text-xs text-[#71717a]">Track dividends received &amp; tax reports</p>
              <a
                href="/go/sharesight?placement=ticker-page-bottom"
                target="_blank"
                rel="noopener sponsored"
                className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors whitespace-nowrap"
              >
                Sharesight ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div>
            <h2 className="sr-only">{company.symbol} Dividend Quality Score</h2>
            <QualityScoreCard metrics={metrics} />
          </div>
          <MetricsCard metrics={metrics} />
          <BrokerCTA signal={metrics.weissSignal} symbol={company.symbol} companyName={company.name} placement="ticker-page" />

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
                    href={collectionHref(slug)}
                    className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                  >
                    → {title}
                  </Link>
                ))}
                <Link
                  href="/dividend-screener"
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
