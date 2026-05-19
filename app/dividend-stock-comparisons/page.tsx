import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPARE_PAIRS, COMPARE_PAIR_META } from '@/app/compare/[pair]/page'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'

const PAGE_URL = 'https://dividendvisual.com/dividend-stock-comparisons'
const YEAR = 2026

export const metadata: Metadata = {
  title: `Dividend Stock Comparisons ${YEAR} - Compare Yield, Safety & Valuation`,
  description:
    'Compare dividend stocks side by side by dividend yield, payout safety, quality score, dividend growth, and Geraldine Weiss valuation signal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Dividend Stock Comparisons ${YEAR} | DividendVisual`,
    description:
      'Side-by-side dividend stock comparisons for income investors: yield, payout ratio, quality score, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Dividend Stock Comparisons ${YEAR} | DividendVisual`,
    description: 'Compare dividend stocks by yield, safety, dividend growth, and Weiss valuation signal.',
  },
}

function pairLabel(pair: string) {
  return pair.split('-vs-').map((part) => part.toUpperCase()).join(' vs ')
}

function groupedPairs() {
  return COMPARE_PAIRS.reduce<Record<string, string[]>>((groups, pair) => {
    const category = COMPARE_PAIR_META[pair]?.category ?? 'Dividend stocks'
    groups[category] = groups[category] ?? []
    groups[category].push(pair)
    return groups
  }, {})
}

function buildArticleJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Dividend Stock Comparisons ${YEAR}`,
    description:
      'Side-by-side dividend stock comparisons ranked by yield, payout safety, quality score, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
  }
}

function buildItemListJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Dividend Stock Comparisons ${YEAR}`,
    url: PAGE_URL,
    numberOfItems: COMPARE_PAIRS.length,
    itemListElement: COMPARE_PAIRS.map((pair, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://dividendvisual.com/compare/${pair}`,
      name: `${pairLabel(pair)} Dividend Stock Comparison`,
      description: COMPARE_PAIR_META[pair]?.angle
        ? `Compare ${pairLabel(pair)} across ${COMPARE_PAIR_META[pair].angle}.`
        : `Compare ${pairLabel(pair)} by yield, quality, growth, and valuation.`,
    })),
  }
}

export default function DividendStockComparisonsPage() {
  const groups = groupedPairs()
  const featured = COMPARE_PAIRS.slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd()) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Stock Comparisons' },
      ]} />

      <section className="mb-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3 py-1 text-xs font-medium text-[#818cf8] mb-4">
          Side-by-side dividend stock decisions
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          Dividend Stock Comparisons {YEAR}
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          Compare popular dividend stocks by yield, payout safety, dividend growth, quality score, and Geraldine Weiss
          valuation signal. Built for income investors deciding which stock deserves new capital today.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/compare"
            className="rounded-md bg-[#6366f1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818cf8] transition-colors"
          >
            Compare any two stocks
          </Link>
          <Link
            href="/dividend-screener"
            className="rounded-md border border-[#2e2e3e] bg-[#111118] px-4 py-2 text-sm font-medium text-[#f4f4f5] hover:border-[#6366f1]/50 transition-colors"
          >
            Open dividend screener
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-4">Popular dividend stock comparisons</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((pair) => (
            <Link
              key={pair}
              href={`/compare/${pair}`}
              className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 hover:border-[#6366f1]/40 transition-colors"
            >
              <p className="font-semibold text-[#f4f4f5]">{pairLabel(pair)}</p>
              <p className="mt-2 text-sm text-[#71717a] leading-relaxed">
                {COMPARE_PAIR_META[pair]?.angle ?? 'Dividend yield, safety, growth, and valuation.'}
              </p>
              <p className="mt-4 text-xs text-[#6366f1]">View comparison -&gt;</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <DividendAlertsCTA
          source="dividend-stock-comparisons"
          title="Get alerts when comparison candidates become undervalued"
          description="A weekly digest of quality dividend stocks entering historically attractive Weiss yield territory."
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {Object.entries(groups).map(([category, pairs]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-[#f4f4f5] mb-3">{category}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pairs.map((pair) => (
                  <Link
                    key={pair}
                    href={`/compare/${pair}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3 hover:border-[#6366f1]/40 transition-colors"
                  >
                    <span>
                      <span className="block text-sm font-medium text-[#f4f4f5]">{pairLabel(pair)}</span>
                      <span className="mt-0.5 block text-xs text-[#71717a]">{COMPARE_PAIR_META[pair]?.angle}</span>
                    </span>
                    <span className="text-xs text-[#6366f1] shrink-0">Open</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Comparison checklist</p>
          <div className="space-y-3 text-sm text-[#71717a]">
            <p>1. Compare current yield against each stock&apos;s own history.</p>
            <p>2. Check payout ratio before trusting a higher yield.</p>
            <p>3. Prefer stronger quality scores when valuation is similar.</p>
            <p>4. Look for dividend growth that still beats inflation.</p>
            <p>5. Use the Weiss signal as the entry-price filter.</p>
          </div>
        </aside>
      </section>
    </div>
  )
}
