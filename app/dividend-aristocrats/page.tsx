import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { TrackPageView } from '@/components/analytics/TrackPageView'

type AristocratRow = Company & ComputedMetrics

const PAGE_URL = 'https://dividendvisual.com/dividend-aristocrats'
const YEAR = 2026

export const metadata: Metadata = {
  title: `Dividend Aristocrats List ${YEAR} - Ranked by Yield, Safety & Weiss Signal`,
  description:
    'Dividend Aristocrats list for 2026 ranked by dividend yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Dividend Aristocrats List ${YEAR} | DividendVisual`,
    description:
      'Compare Dividend Aristocrats by yield, payout ratio, dividend safety, dividend growth, quality score, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Dividend Aristocrats List ${YEAR} | DividendVisual`,
    description: 'Dividend Aristocrats ranked by yield, safety, growth, and Weiss valuation signal.',
  },
}

async function getAristocrats(): Promise<AristocratRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/collections/dividend-aristocrats`, {
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
    q: 'What is a Dividend Aristocrat?',
    a: 'A Dividend Aristocrat is an S&P 500 company that has increased its dividend for at least 25 consecutive years. The S&P 500 requirement adds a large-cap and liquidity filter to the dividend growth streak.',
  },
  {
    q: 'Are Dividend Aristocrats safe investments?',
    a: 'Dividend Aristocrats have strong dividend histories, but they are not automatically safe at any price. Payout ratio, free cash flow coverage, debt, dividend growth, and valuation still matter.',
  },
  {
    q: 'How are Dividend Aristocrats ranked here?',
    a: 'DividendVisual ranks Aristocrats by quality score, dividend yield, dividend growth, payout coverage, and Geraldine Weiss valuation signal. The goal is to identify durable dividends trading at reasonable or attractive yield levels.',
  },
  {
    q: 'What is the difference between Dividend Aristocrats and Dividend Kings?',
    a: 'Dividend Aristocrats have 25 or more consecutive years of dividend growth and must be in the S&P 500. Dividend Kings have 50 or more consecutive years of dividend growth, regardless of S&P 500 membership.',
  },
]

function buildArticleJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Dividend Aristocrats List ${YEAR}`,
    description:
      'Dividend Aristocrats ranked by yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal.',
    url: PAGE_URL,
    author: { '@type': 'Organization', name: 'DividendVisual' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    isAccessibleForFree: true,
  }
}

function buildItemListJsonLd(rows: AristocratRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Dividend Aristocrats List ${YEAR}`,
    description: 'Dividend Aristocrats ranked by quality score, dividend yield, dividend growth, and Weiss valuation signal.',
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

export default async function DividendAristocratsPage() {
  const rows = await getAristocrats()
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
      <TrackPageView event="dividend_aristocrats_viewed" properties={{ count: rows.length }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener', href: '/dividend-screener' },
        { label: 'Dividend Aristocrats' },
      ]} />

      <section className="mb-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3 py-1 text-xs font-medium text-[#818cf8] mb-4">
          S&P 500 dividend growth stocks
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          Dividend Aristocrats List {YEAR}
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          Compare Dividend Aristocrats by dividend yield, payout safety, dividend growth, quality score, and
          Geraldine Weiss valuation signal. These are S&P 500 companies with at least 25 consecutive years of
          dividend increases.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-4xl">
          {[
            { label: 'Aristocrats tracked', value: rows.length.toString() },
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
                      {row.isDividendKing ? <DividendBadge type="king" /> : <DividendBadge type="aristocrat" />}
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
              <p className="text-sm text-[#71717a]">Aristocrat data is loading.</p>
            )}
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Related dividend screens</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/best-dividend-stocks', label: 'Best dividend stocks' },
                { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
                { href: '/dividend-kings', label: 'Dividend Kings' },
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
          source="dividend-aristocrats"
          title="Get alerts when Dividend Aristocrats become undervalued"
          description="A weekly digest of high-quality dividend growers entering attractive Weiss yield territory."
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="prose-dv max-w-3xl">
          <h2>What qualifies a Dividend Aristocrat?</h2>
          <p>
            A Dividend Aristocrat must be a member of the S&P 500 and must have increased its dividend for at least
            25 consecutive years. That means every company on this list has survived multiple recessions while still
            raising shareholder income.
          </p>
          <p>
            The S&P 500 requirement matters because it filters for scale, liquidity, and institutional relevance.
            Dividend Aristocrats are not just long-streak dividend payers; they are large public companies with enough
            operating durability to remain in the index.
          </p>

          <h2>How to use the Weiss signal with Aristocrats</h2>
          <p>
            The Geraldine Weiss method compares today&apos;s dividend yield with a stock&apos;s own historical yield
            range. When an Aristocrat&apos;s current yield is near the high end of that range, the stock may be
            historically cheap relative to the income it pays.
          </p>
          <p>
            The strongest setups combine an Undervalued Weiss signal with a strong quality score, manageable payout
            ratio, positive dividend growth, and a business model that can keep funding increases through a full market
            cycle.
          </p>

          <h2>Dividend Aristocrats vs Dividend Kings</h2>
          <p>
            Dividend Kings require 50 or more years of dividend growth. Dividend Aristocrats require 25 or more years
            and S&P 500 membership. Kings usually offer the longest track records, while non-King Aristocrats can
            include younger dividend compounders with stronger growth.
          </p>
        </article>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Aristocrat checklist</p>
          <div className="space-y-3 text-sm text-[#71717a]">
            <p>1. 25+ consecutive years of dividend growth.</p>
            <p>2. Current S&P 500 membership.</p>
            <p>3. Payout ratio leaves room for future raises.</p>
            <p>4. Yield is fair or attractive vs history.</p>
            <p>5. Dividend growth still beats inflation.</p>
          </div>
        </aside>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-4">Dividend Aristocrats FAQ</h2>
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
