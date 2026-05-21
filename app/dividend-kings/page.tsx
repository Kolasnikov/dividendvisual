import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { TrackPageView } from '@/components/analytics/TrackPageView'

type KingRow = Company & ComputedMetrics

const PAGE_URL = 'https://dividendvisual.com/dividend-kings'
const YEAR = 2026

export const metadata: Metadata = {
  title: `Dividend Kings List ${YEAR} - 50+ Year Dividend Growth Stocks Ranked`,
  description:
    'Dividend Kings list for 2026 ranked by dividend yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Dividend Kings List ${YEAR} | DividendVisual`,
    description:
      'Compare Dividend Kings by yield, payout ratio, dividend safety, dividend growth, quality score, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Dividend Kings List ${YEAR} | DividendVisual`,
    description: 'Dividend Kings ranked by yield, safety, growth, and Weiss valuation signal.',
  },
}

async function getKings(): Promise<KingRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/collections/dividend-kings`, {
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
    q: 'What is a Dividend King?',
    a: 'A Dividend King is a company that has increased its annual dividend for at least 50 consecutive years. The streak is the defining requirement; unlike Dividend Aristocrats, Dividend Kings do not have to be members of the S&P 500.',
  },
  {
    q: 'Are Dividend Kings better than Dividend Aristocrats?',
    a: 'Dividend Kings have longer dividend growth histories, while Dividend Aristocrats combine a 25-year growth streak with S&P 500 membership. Kings are often more mature and defensive; Aristocrats can include younger dividend compounders with faster growth.',
  },
  {
    q: 'Are Dividend Kings always safe buys?',
    a: 'No. A 50-year streak is a strong quality signal, but valuation, payout ratio, free cash flow coverage, debt, and dividend growth still matter. Even excellent dividend stocks can be poor investments if bought at historically expensive yields.',
  },
  {
    q: 'How are Dividend Kings ranked here?',
    a: 'DividendVisual ranks Dividend Kings by quality score, current yield, payout coverage, dividend growth, and Geraldine Weiss valuation signal. The goal is to find durable dividend growers trading at attractive yield levels.',
  },
]

function buildArticleJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Dividend Kings List ${YEAR}`,
    description:
      'Dividend Kings ranked by yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal.',
    url: PAGE_URL,
    author: { '@type': 'Organization', name: 'DividendVisual' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    isAccessibleForFree: true,
  }
}

function buildItemListJsonLd(rows: KingRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Dividend Kings List ${YEAR}`,
    description: 'Dividend Kings ranked by quality score, dividend yield, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://dividendvisual.com/analysis/${row.symbol.toLowerCase()}`,
      name: `${row.name} (${row.symbol})`,
      description: `${pct(row.currentYield)} yield, quality score ${row.qualityScore}/100, ${row.weissSignal} Weiss valuation signal.`,
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

export default async function DividendKingsPage() {
  const rows = await getKings()
  const sortedRows = [...rows].sort((a, b) => b.qualityScore - a.qualityScore)
  const undervalued = rows.filter((row) => row.weissSignal === 'undervalued').length
  const avgYield = average(rows.map((row) => row.currentYield).filter((value) => value > 0))
  const avgQuality = Math.round(average(rows.map((row) => row.qualityScore).filter((value) => value > 0)))
  const topQuality = sortedRows[0] ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(sortedRows)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }} />
      <TrackPageView event="dividend_kings_viewed" properties={{ count: rows.length }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener', href: '/dividend-screener' },
        { label: 'Dividend Kings' },
      ]} />

      <section className="mb-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#86efac] mb-4">
          50+ year dividend growth stocks
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          Dividend Kings List {YEAR}
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          Compare Dividend Kings by dividend yield, payout safety, dividend growth, quality score, and Geraldine Weiss
          valuation signal. These are companies with at least 50 consecutive years of dividend increases.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-4xl">
          {[
            { label: 'Kings tracked', value: rows.length.toString() },
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
                    <div className="mt-1 flex flex-wrap gap-1">
                      <DividendBadge type="king" />
                      {row.isDividendAristocrat ? <DividendBadge type="aristocrat" /> : null}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium text-[#f4f4f5]">{pct(row.currentYield)}</td>
                  <td className="py-3 pr-4 text-[#a1a1aa]">
                    {row.payoutRatio != null && row.payoutRatio <= 2 ? pct(row.payoutRatio, 0) : 'n/a'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={row.qualityScore >= 65 ? 'text-[#22c55e]' : 'text-[#f59e0b]'}>
                      {row.qualityScore}/100
                    </span>
                  </td>
                  <td className="py-3 pr-4"><SignalBadge signal={row.weissSignal} size="sm" /></td>
                  <td className="py-3 pr-4 text-[#a1a1aa]">{pct(row.dividendCagr5y, 1)}</td>
                  <td className="py-3 pr-4 text-right">
                    <Link
                      href={`/ticker/${row.symbol}`}
                      className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-2">Highest quality score</p>
            {topQuality ? (
              <>
                <Link
                  href={`/ticker/${topQuality.symbol}`}
                  className="font-mono text-xl font-semibold text-[#f4f4f5] hover:text-[#6366f1]"
                >
                  {topQuality.symbol}
                </Link>
                <p className="mt-1 text-xs text-[#71717a]">{topQuality.name}</p>
                <p className="mt-4 text-sm text-[#a1a1aa]">
                  Quality score {topQuality.qualityScore}/100 with a {pct(topQuality.currentYield)} current yield.
                </p>
              </>
            ) : (
              <p className="text-sm text-[#71717a]">King data is loading.</p>
            )}
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Related dividend screens</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/best-dividend-stocks', label: 'Best dividend stocks' },
                { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
                { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
                { href: '/dividend-screener', label: 'Dividend stock screener' },
                { href: '/blog/dividend-aristocrats-vs-kings', label: 'Aristocrats vs Kings' },
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
          source="dividend-kings"
          title="Get alerts when Dividend Kings become undervalued"
          description="A weekly digest of elite dividend growers entering attractive Weiss yield territory."
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="prose-dv max-w-3xl">
          <h2>What qualifies a Dividend King?</h2>
          <p>
            A Dividend King has increased its annual dividend for at least 50 consecutive years. That half-century
            streak spans recessions, inflation cycles, rate shocks, market crashes, and major industry changes.
          </p>
          <p>
            Unlike Dividend Aristocrats, Dividend Kings do not need to be members of the S&P 500. The qualification is
            centered on dividend durability: the company must keep raising the payout year after year.
          </p>

          <h2>Why Dividend Kings work well with the Weiss method</h2>
          <p>
            The Geraldine Weiss method works best on companies with long, stable dividend histories. Dividend Kings
            are unusually good candidates because their yield ranges have been tested across multiple market regimes.
          </p>
          <p>
            The strongest setups combine an Undervalued Weiss signal with a strong quality score, moderate payout
            ratio, positive dividend growth, and a business model that can keep funding raises through weak markets.
          </p>

          <h2>Dividend Kings vs Dividend Aristocrats</h2>
          <p>
            Dividend Kings require 50 or more years of dividend growth. Dividend Aristocrats require 25 or more years
            and S&P 500 membership. Kings usually offer the longest income track records; Aristocrats can offer a
            broader large-cap universe and sometimes faster dividend growth.
          </p>
        </article>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <p className="text-sm font-semibold text-[#f4f4f5] mb-3">King checklist</p>
          <div className="space-y-3 text-sm text-[#71717a]">
            <p>1. 50+ consecutive years of dividend growth.</p>
            <p>2. Payout ratio leaves room for future raises.</p>
            <p>3. Dividend growth still beats inflation.</p>
            <p>4. Yield is fair or attractive vs history.</p>
            <p>5. Free cash flow supports the dividend.</p>
          </div>
        </aside>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-4">Dividend Kings FAQ</h2>
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
