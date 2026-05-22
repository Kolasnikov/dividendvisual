import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { TrackPageView } from '@/components/analytics/TrackPageView'

type HighYieldRow = Company & ComputedMetrics

const PAGE_URL = 'https://dividendvisual.com/high-yield-dividend-stocks'
const YEAR = 2026

export const metadata: Metadata = {
  title: `High Yield Dividend Stocks ${YEAR} - Ranked by Safety & Weiss Signal`,
  description:
    'High yield dividend stocks screened for payout sustainability, quality score, dividend growth, and Geraldine Weiss valuation signal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `High Yield Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare high yield dividend stocks by yield, payout ratio, dividend safety, quality score, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `High Yield Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'High yield dividend stocks ranked by yield, safety, quality, and Weiss valuation signal.',
  },
}

async function getHighYieldStocks(): Promise<HighYieldRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/collections/high-yield`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

function pct(value: number | null, decimals = 2) {
  if (value == null) return 'n/a'
  return `${(value * 100).toFixed(decimals)}%`
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const FAQ = [
  {
    q: 'What is a high yield dividend stock?',
    a: 'A high yield dividend stock pays an above-average dividend yield relative to the broader market. The yield alone is not enough: payout ratio, free cash flow coverage, debt, dividend history, and business durability determine whether the income is sustainable.',
  },
  {
    q: 'Are high yield dividend stocks risky?',
    a: 'They can be. A very high yield may reflect a cheap stock or a dividend the market expects to be cut. DividendVisual combines yield with quality score, payout data, dividend growth, and Weiss valuation signal to separate potential opportunities from yield traps.',
  },
  {
    q: 'What yield is considered high?',
    a: 'For blue-chip dividend stocks, yields above roughly 4% to 5% are usually considered high. REITs, BDCs, utilities, telecoms, and energy infrastructure can sustain higher yields than faster-growing compounders.',
  },
  {
    q: 'How are high yield dividend stocks ranked here?',
    a: 'DividendVisual ranks high yield dividend stocks by quality score first, then reviews current yield, payout ratio, dividend growth, and Geraldine Weiss valuation signal. This keeps unsafe yield traps from dominating the list.',
  },
]

function buildArticleJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `High Yield Dividend Stocks ${YEAR}`,
    description:
      'High yield dividend stocks ranked by yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal.',
    url: PAGE_URL,
    author: { '@type': 'Organization', name: 'DividendVisual' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    isAccessibleForFree: true,
  }
}

function buildItemListJsonLd(rows: HighYieldRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `High Yield Dividend Stocks ${YEAR}`,
    description: 'High yield dividend stocks ranked by quality score, dividend yield, payout ratio, and Weiss valuation signal.',
    url: PAGE_URL,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://dividendvisual.com/analysis/${row.symbol.toLowerCase()}`,
      name: `${row.name} (${row.symbol})`,
      description: `${pct(row.currentYield)} yield, ${row.payoutRatio != null ? `${pct(row.payoutRatio, 0)} payout ratio, ` : ''}quality score ${row.qualityScore}/100, ${row.weissSignal} Weiss valuation signal.`,
    })),
  }
}

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export default async function HighYieldDividendStocksPage() {
  const rows = await getHighYieldStocks()
  const sortedRows = [...rows].sort((a, b) => b.qualityScore - a.qualityScore)
  const undervalued = rows.filter((row) => row.weissSignal === 'undervalued').length
  const avgYield = average(rows.map((row) => row.currentYield).filter((value) => value > 0))
  const avgQuality = Math.round(average(rows.map((row) => row.qualityScore).filter((value) => value > 0)))
  const highestQuality = sortedRows[0] ?? null
  const highestYield = [...rows].sort((a, b) => b.currentYield - a.currentYield)[0] ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(sortedRows)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }} />
      <TrackPageView event="high_yield_dividend_stocks_viewed" properties={{ count: rows.length }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener', href: '/dividend-screener' },
        { label: 'High Yield Dividend Stocks' },
      ]} />

      <section className="mb-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-3 py-1 text-xs font-medium text-[#fbbf24] mb-4">
          Income stocks screened for sustainability
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          High Yield Dividend Stocks {YEAR}
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          Compare high yield dividend stocks by current yield, payout safety, dividend growth, quality score, and
          Geraldine Weiss valuation signal. Built to find above-average income without blindly chasing yield traps.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-4xl">
          {[
            { label: 'High yield stocks', value: rows.length.toString() },
            { label: 'Average yield', value: pct(avgYield) },
            { label: 'Undervalued now', value: undervalued.toString() },
            { label: 'Avg quality score', value: avgQuality ? `${avgQuality}/100` : 'n/a' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
              <p className="text-xl font-semibold text-[#f4f4f5]">{value}</p>
              <p className="text-xs text-[#71717a]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-lg border border-[#1e1e2e] bg-[#111118]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                <th className="py-3 pl-4 pr-4 font-medium">Stock</th>
                <th className="py-3 pr-4 font-medium">Yield</th>
                <th className="py-3 pr-4 font-medium">Payout</th>
                <th className="py-3 pr-4 font-medium">Quality</th>
                <th className="py-3 pr-4 font-medium">Signal</th>
                <th className="py-3 pr-4 font-medium">5Y CAGR</th>
                <th className="py-3 pr-4 text-right font-medium">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.symbol} className="border-b border-[#1e1e2e]/70 last:border-0">
                  <td className="py-3 pl-4 pr-4">
                    <Link
                      href={`/ticker/${row.symbol}`}
                      className="font-mono font-semibold text-[#f4f4f5] hover:text-[#6366f1] transition-colors"
                    >
                      {row.symbol}
                    </Link>
                    <div className="mt-0.5 max-w-[220px] truncate text-xs text-[#71717a]">{row.name}</div>
                    <div className="mt-0.5 text-xs text-[#52525b]">{row.sector ?? 'Dividend stock'}</div>
                  </td>
                  <td className="py-3 pr-4 font-medium text-[#f4f4f5]">{pct(row.currentYield)}</td>
                  <td className="py-3 pr-4 text-[#a1a1aa]">
                    {row.payoutRatio != null && row.payoutRatio <= 2 ? pct(row.payoutRatio, 0) : 'n/a'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={row.qualityScore >= 65 ? 'text-[#22c55e]' : row.qualityScore >= 45 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}>
                      {row.qualityScore}/100
                    </span>
                  </td>
                  <td className="py-3 pr-4"><SignalBadge signal={row.weissSignal} size="sm" /></td>
                  <td className="py-3 pr-4 text-[#a1a1aa]">{pct(row.dividendCagr5y, 1)}</td>
                  <td className="py-3 pr-4 text-right">
                    <Link
                      href={`/analysis/${row.symbol.toLowerCase()}`}
                      className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors"
                    >
                      Read
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-2">Quality standout</p>
            {highestQuality ? (
              <>
                <Link
                  href={`/ticker/${highestQuality.symbol}`}
                  className="font-mono text-xl font-semibold text-[#f4f4f5] hover:text-[#6366f1]"
                >
                  {highestQuality.symbol}
                </Link>
                <p className="mt-1 text-xs text-[#71717a]">{highestQuality.name}</p>
                <p className="mt-4 text-sm text-[#a1a1aa]">
                  Quality score {highestQuality.qualityScore}/100 with a {pct(highestQuality.currentYield)} current yield.
                </p>
              </>
            ) : (
              <p className="text-sm text-[#71717a]">High yield data is loading.</p>
            )}
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-2">Highest yield</p>
            {highestYield ? (
              <>
                <Link
                  href={`/ticker/${highestYield.symbol}`}
                  className="font-mono text-xl font-semibold text-[#f4f4f5] hover:text-[#6366f1]"
                >
                  {highestYield.symbol}
                </Link>
                <p className="mt-1 text-xs text-[#71717a]">{highestYield.name}</p>
                <p className="mt-4 text-sm text-[#a1a1aa]">
                  {pct(highestYield.currentYield)} yield with a {highestYield.qualityScore}/100 quality score.
                </p>
              </>
            ) : null}
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Related screens</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
                { href: '/best-dividend-stocks', label: 'Best dividend stocks' },
                { href: '/dividend-screener', label: 'Dividend stock screener' },
                { href: '/best-reit-dividend-stocks', label: 'REIT dividend stocks' },
                { href: '/blog/dividend-yield-trap', label: 'Dividend yield trap guide' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-[#6366f1] hover:text-[#818cf8]">
                  {link.label} -&gt;
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mb-12">
        <DividendAlertsCTA
          source="high-yield-dividend-stocks"
          title="Get alerts when high yield stocks become undervalued"
          description="A weekly digest of high-income dividend stocks entering attractive Weiss yield territory, with payout safety context."
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="prose-dv max-w-3xl">
          <h2>How to evaluate high yield dividend stocks</h2>
          <p>
            A high yield is useful only if the dividend is sustainable. Start with payout ratio and free cash flow
            coverage, then check whether the company has maintained or grown the dividend through weak markets.
          </p>
          <p>
            DividendVisual adds a valuation layer with the Geraldine Weiss yield method. If a durable dividend payer is
            yielding near the high end of its own historical range, the stock may be unusually cheap. If quality is low,
            the same high yield may be a warning.
          </p>

          <h2>High yield opportunity vs yield trap</h2>
          <p>
            High yield opportunities usually come from sector-wide selling, interest-rate pressure, or temporary market
            pessimism. Yield traps usually come from deteriorating cash flow, excessive leverage, shrinking earnings, or
            a payout ratio that leaves no margin of safety.
          </p>
          <p>
            The strongest setups combine above-average yield, an Undervalued Weiss signal, a quality score above 65,
            positive dividend growth, and payout coverage that can survive a weak year.
          </p>
        </article>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <p className="text-sm font-semibold text-[#f4f4f5] mb-3">High yield checklist</p>
          <div className="space-y-3 text-sm text-[#71717a]">
            <p>1. Yield is high versus the stock&apos;s own history.</p>
            <p>2. Payout ratio is covered by earnings or cash flow.</p>
            <p>3. Dividend growth is positive or intentionally stable.</p>
            <p>4. Debt does not force a future dividend cut.</p>
            <p>5. Weiss signal confirms valuation is attractive.</p>
          </div>
        </aside>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-4">High yield dividend stocks FAQ</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-[#f4f4f5]">{q}</summary>
              <p className="mt-3 text-sm text-[#71717a] leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
