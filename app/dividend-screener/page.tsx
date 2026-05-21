import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { WatchlistClient } from '@/components/watchlist/WatchlistClient'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmailCapture } from '@/components/ui/EmailCapture'

export const metadata: Metadata = {
  title: 'Free Dividend Stock Screener - Yield, Safety & Weiss Valuation',
  description:
    'Free dividend stock screener for income investors. Filter 150+ dividend stocks by yield, dividend safety, Weiss valuation signal, Dividend Kings, Aristocrats, sector, payout ratio, and dividend growth.',
  alternates: {
    canonical: 'https://dividendvisual.com/dividend-screener',
  },
  openGraph: {
    title: 'Free Dividend Stock Screener | DividendVisual',
    description:
      'Screen 150+ dividend stocks by yield, quality score, Weiss valuation signal, sector, payout ratio, and dividend growth.',
    url: 'https://dividendvisual.com/dividend-screener',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Dividend Stock Screener | DividendVisual',
    description:
      'Find undervalued dividend stocks with yield history, quality scores, and Weiss valuation signals.',
  },
}

type ScreenerRow = Company & ComputedMetrics

async function getWatchlist(): Promise<ScreenerRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/watchlist?sort=quality&order=desc`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

function pct(value: number | null, digits = 2) {
  if (value == null) return 'n/a'
  return `${(value * 100).toFixed(digits)}%`
}

function buildItemList(rows: ScreenerRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Dividend Stock Screener',
    description:
      'Dividend stocks ranked by DividendVisual quality score, dividend yield, and Weiss valuation signal.',
    url: 'https://dividendvisual.com/dividend-screener',
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 50).map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://dividendvisual.com/analysis/${row.symbol.toLowerCase()}`,
      name: `${row.name} (${row.symbol})`,
      description: `${pct(row.currentYield)} dividend yield, quality score ${row.qualityScore}/100, ${row.weissSignal} Weiss signal.`,
    })),
  }
}

const FAQ = [
  {
    q: 'What does this dividend stock screener filter for?',
    a: 'DividendVisual screens dividend stocks by current dividend yield, Weiss valuation signal, quality score, payout ratio, free cash flow coverage, dividend growth rate, sector, Dividend King status, and Dividend Aristocrat status.',
  },
  {
    q: 'How is the Weiss valuation signal calculated?',
    a: "The Weiss signal compares a stock's current dividend yield with its own 10-year historical yield range. A stock is considered undervalued when its current yield is near the high end of that range, meaning the price is historically low relative to the dividend.",
  },
  {
    q: 'Is this screener financial advice?',
    a: 'No. DividendVisual is an educational research tool. The screener surfaces dividend valuation and quality signals, but it does not make buy or sell recommendations.',
  },
]

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

export default async function DividendScreenerPage() {
  const rows = await getWatchlist()
  const undervalued = rows.filter((row) => row.weissSignal === 'undervalued').length
  const kings = rows.filter((row) => row.isDividendKing).length
  const aristocrats = rows.filter((row) => row.isDividendAristocrat).length
  const sectors = [...new Set(rows.map((row) => row.sector).filter(Boolean))].length
  const itemListJsonLd = buildItemList(rows)
  const faqJsonLd = buildFaqJsonLd()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener' },
      ]} />

      <section className="mb-8 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#22c55e] mb-4">
          Free dividend research tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          Free Dividend Stock Screener
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          Screen {rows.length} dividend stocks by yield, dividend safety, payout ratio, dividend growth, sector,
          Dividend King status, and Geraldine Weiss valuation signal. Built for long-term income investors who want
          to find high-quality dividend stocks trading near historically attractive yields.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 max-w-4xl">
          {[
            { label: 'Stocks tracked', value: rows.length.toString() },
            { label: 'Undervalued now', value: undervalued.toString() },
            { label: 'Dividend Kings', value: kings.toString() },
            { label: 'Aristocrats', value: aristocrats.toString() },
            { label: 'Sectors', value: sectors.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
              <p className="text-xl font-semibold text-[#f4f4f5]">{value}</p>
              <p className="text-xs text-[#71717a]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold text-[#f4f4f5] mb-2">Find historically cheap dividend stocks</h2>
            <p className="text-sm text-[#71717a] leading-relaxed">
              The Weiss signal compares today&apos;s yield with each stock&apos;s own 10-year yield history, helping you
              spot dividend stocks trading near unusually attractive income levels.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#f4f4f5] mb-2">Avoid obvious yield traps</h2>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Sort by quality score, payout ratio, free cash flow coverage, and dividend growth to separate sustainable
              income from high yields that may signal stress.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#f4f4f5] mb-2">Move from screen to analysis</h2>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Open any ticker for a full dividend analysis with valuation bands, yield history, DRIP projections,
              peer links, and risk notes.
            </p>
          </div>
        </div>
      </section>

      <WatchlistClient rows={rows} />

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#f4f4f5] mb-3">How to use the dividend screener</h2>
            <div className="space-y-3 text-sm text-[#71717a] leading-relaxed">
              <p>
                Start with the Weiss signal to identify stocks whose current yield is high relative to their own
                history. Then check the quality score, payout ratio, and dividend growth rate before comparing the
                stock with sector peers.
              </p>
              <p>
                For conservative income portfolios, the strongest starting point is usually a stock with an
                Undervalued signal, a quality score above 65, a manageable payout ratio, and a long dividend growth
                record. For compounders, prioritize lower yields with faster dividend CAGR and lower payout ratios.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#f4f4f5] mb-3">Popular dividend screens</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/best-dividend-stocks', label: 'Best dividend stocks' },
                { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
                { href: '/dividend-kings', label: 'Dividend Kings' },
                { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
                { href: '/best-monthly-dividend-stocks', label: 'Monthly dividend stocks' },
                { href: '/best-utility-dividend-stocks', label: 'Utility dividend stocks' },
                { href: '/best-reit-dividend-stocks', label: 'REIT dividend stocks' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md border border-[#2e2e3e] bg-[#1e1e2e] px-3 py-1.5 text-sm text-[#a1a1aa] hover:border-[#6366f1]/40 hover:text-[#f4f4f5] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#f4f4f5] mb-4">Dividend screener FAQ</h2>
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-[#f4f4f5]">{q}</summary>
                  <p className="mt-3 text-sm text-[#71717a] leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <EmailCapture source="screener" />
          <div className="mt-6 border-t border-[#1e1e2e] pt-5">
            <p className="text-xs text-[#71717a] leading-relaxed">
              Data is refreshed regularly and should be used for research only. DividendVisual does not provide
              investment, tax, or financial advice.
            </p>
            <Link href="/methodology" className="mt-3 inline-block text-sm text-[#6366f1] hover:text-[#818cf8]">
              Read the methodology -&gt;
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
