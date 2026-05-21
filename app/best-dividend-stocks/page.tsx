import type { Metadata } from 'next'
import Link from 'next/link'
import type { WatchlistItem } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { TrackPageView } from '@/components/analytics/TrackPageView'

const PAGE_URL = 'https://dividendvisual.com/best-dividend-stocks'
const YEAR = 2026

export const metadata: Metadata = {
  title: `Best Dividend Stocks ${YEAR} - Ranked by Safety, Yield & Weiss Signal`,
  description:
    'Best dividend stocks for 2026 ranked by dividend safety, quality score, yield, payout ratio, dividend growth, and Geraldine Weiss valuation signal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare top dividend stocks by dividend safety, quality score, yield, payout ratio, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Dividend stocks ranked by safety, yield, growth, payout ratio, and Weiss valuation signal.',
  },
}

async function getWatchlist(): Promise<WatchlistItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/watchlist?sort=quality&order=desc`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

function pct(value: number | null, decimals = 2) {
  if (value == null) return 'n/a'
  return `${(value * 100).toFixed(decimals)}%`
}

function qualityLabel(score: number) {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Strong'
  if (score >= 50) return 'Watch'
  return 'Speculative'
}

const FAQ = [
  {
    q: 'What makes a dividend stock one of the best?',
    a: 'The best dividend stocks combine a durable business, a covered payout, a long dividend record, reasonable dividend growth, and an attractive valuation. A high yield alone is not enough.',
  },
  {
    q: 'Should I choose the highest yielding dividend stocks?',
    a: 'Usually not. Very high yields can signal dividend risk. DividendVisual ranks stocks by quality score first, then looks at yield and Weiss valuation so high-yield traps do not dominate the list.',
  },
  {
    q: 'How does DividendVisual rank dividend stocks?',
    a: 'The ranking uses quality score, dividend growth streak, payout ratio, free cash flow coverage, dividend CAGR, current yield, and the Geraldine Weiss signal based on each stock own historical yield range.',
  },
  {
    q: 'Are Dividend Kings and Aristocrats always the best dividend stocks?',
    a: 'They are often strong starting points because their dividend records are long, but valuation still matters. A high-quality dividend stock can be unattractive if its yield is near a historical low.',
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

function buildItemListJsonLd(rows: WatchlistItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Dividend Stocks ${YEAR}`,
    description: 'Dividend stocks ranked by quality score, yield, dividend growth, payout safety, and Weiss valuation signal.',
    url: PAGE_URL,
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 25).map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://dividendvisual.com/analysis/${row.symbol.toLowerCase()}`,
      name: `${row.name} (${row.symbol})`,
      description: `${pct(row.currentYield)} yield, quality score ${row.qualityScore}/100, ${row.weissSignal} Weiss signal.`,
    })),
  }
}

function buildArticleJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Best Dividend Stocks ${YEAR}`,
    description: 'Best dividend stocks ranked by dividend safety, yield, growth, payout ratio, and Geraldine Weiss valuation signal.',
    url: PAGE_URL,
    author: { '@type': 'Organization', name: 'DividendVisual' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    isAccessibleForFree: true,
  }
}

function RankedTable({ rows }: { rows: WatchlistItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#1e1e2e] bg-[#111118]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
            <th className="py-3 pl-4 pr-4 font-medium">Rank</th>
            <th className="py-3 pr-4 font-medium">Stock</th>
            <th className="py-3 pr-4 font-medium">Yield</th>
            <th className="py-3 pr-4 font-medium">Quality</th>
            <th className="py-3 pr-4 font-medium">Signal</th>
            <th className="py-3 pr-4 font-medium">5Y CAGR</th>
            <th className="py-3 pr-4 font-medium">Payout</th>
            <th className="py-3 pr-4 text-right font-medium">Analysis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.symbol} className="border-b border-[#1e1e2e]/70 last:border-0">
              <td className="py-3 pl-4 pr-4 text-[#71717a]">{index + 1}</td>
              <td className="py-3 pr-4">
                <Link
                  href={`/ticker/${row.symbol}`}
                  className="font-mono font-semibold text-[#f4f4f5] hover:text-[#6366f1] transition-colors"
                >
                  {row.symbol}
                </Link>
                <div className="mt-0.5 max-w-[220px] truncate text-xs text-[#71717a]">{row.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {row.isDividendKing && <DividendBadge type="king" />}
                  {row.isDividendAristocrat && !row.isDividendKing && <DividendBadge type="aristocrat" />}
                </div>
              </td>
              <td className="py-3 pr-4 font-medium text-[#f4f4f5]">{pct(row.currentYield)}</td>
              <td className="py-3 pr-4">
                <span className={row.qualityScore >= 65 ? 'text-[#22c55e]' : 'text-[#f59e0b]'}>
                  {row.qualityScore}/100
                </span>
                <div className="text-[10px] text-[#71717a]">{qualityLabel(row.qualityScore)}</div>
              </td>
              <td className="py-3 pr-4"><SignalBadge signal={row.weissSignal} size="sm" /></td>
              <td className="py-3 pr-4 text-[#a1a1aa]">{pct(row.dividendCagr5y, 1)}</td>
              <td className="py-3 pr-4 text-[#a1a1aa]">
                {row.payoutRatio != null && row.payoutRatio <= 2 ? pct(row.payoutRatio, 0) : 'n/a'}
              </td>
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
  )
}

export default async function BestDividendStocksPage() {
  const all = await getWatchlist()
  const best = all
    .filter((row) => row.currentYield > 0 && row.qualityScore > 0)
    .sort((a, b) => {
      const aBonus = a.weissSignal === 'undervalued' ? 12 : a.weissSignal === 'fair' ? 4 : 0
      const bBonus = b.weissSignal === 'undervalued' ? 12 : b.weissSignal === 'fair' ? 4 : 0
      return (b.qualityScore + bBonus) - (a.qualityScore + aBonus)
    })
    .slice(0, 25)

  const kings = best.filter((row) => row.isDividendKing).length
  const aristocrats = best.filter((row) => row.isDividendAristocrat).length
  const undervalued = best.filter((row) => row.weissSignal === 'undervalued').length
  const avgYield = best.length ? best.reduce((sum, row) => sum + row.currentYield, 0) / best.length : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(best)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }} />
      <TrackPageView event="best_dividend_stocks_viewed" properties={{ count: best.length }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener', href: '/dividend-screener' },
        { label: 'Best Dividend Stocks' },
      ]} />

      <section className="mb-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3 py-1 text-xs font-medium text-[#818cf8] mb-4">
          Ranked dividend stock list
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          Best Dividend Stocks {YEAR}
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          A practical ranking of dividend stocks by quality score, dividend safety, yield, dividend growth, payout
          ratio, and Geraldine Weiss valuation signal. Built for investors who want durable income, not just the
          highest headline yield.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-4xl">
          {[
            { label: 'Ranked stocks', value: best.length.toString() },
            { label: 'Average yield', value: pct(avgYield) },
            { label: 'Undervalued now', value: undervalued.toString() },
            { label: 'Kings / Aristocrats', value: `${kings}/${aristocrats}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
              <p className="text-xl font-semibold text-[#f4f4f5]">{value}</p>
              <p className="text-xs text-[#71717a]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <RankedTable rows={best} />
      </section>

      <section className="mb-12">
        <DividendAlertsCTA
          source="best-dividend-stocks"
          title="Get weekly updates on the best dividend stock setups"
          description="A short weekly email with quality dividend stocks entering attractive yield territory, plus screens worth reviewing."
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="prose-dv max-w-3xl">
          <h2>How this best dividend stocks list is ranked</h2>
          <p>
            This list prioritizes dividend quality before yield. A stock with a 6% yield and weak payout coverage can
            be less attractive than a 3% yielder with a 30-year dividend growth record, low payout ratio, and consistent
            free cash flow coverage.
          </p>
          <p>
            DividendVisual starts with quality score, then considers the Weiss valuation signal. A high-quality stock
            trading near the high end of its own 10-year yield range is usually more interesting than a high-quality
            stock trading near a historically low yield.
          </p>

          <h2>Best dividend stocks vs highest yield stocks</h2>
          <p>
            High yield searches are tempting, but they are often where dividend investors find yield traps. The better
            screen is sustainable yield: current income backed by cash flow, dividend growth, and a business that can
            keep paying through a full market cycle.
          </p>
          <p>
            Use this page as a shortlist, then open the individual analysis pages to review yield history, payout
            ratio, quality score, and the specific Weiss valuation band for each stock.
          </p>

          <h2>Where to go next</h2>
          <p>
            If you want the most attractive current entries, use the undervalued dividend stocks page. If you want to
            filter by sector, Dividend King status, Aristocrat status, yield, and payout ratio, use the dividend
            screener.
          </p>
        </article>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Related dividend screens</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
                { href: '/dividend-screener', label: 'Dividend stock screener' },
                { href: '/dividend-kings', label: 'Dividend Kings' },
                { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
                { href: '/best-monthly-dividend-stocks', label: 'Monthly dividend stocks' },
                { href: '/drip-calculator', label: 'DRIP calculator' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-[#6366f1] hover:text-[#818cf8]">
                  {link.label} -&gt;
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Ranking checklist</p>
            <div className="space-y-3 text-sm text-[#71717a]">
              <p>1. Dividend is covered by earnings or cash flow.</p>
              <p>2. Dividend growth is positive and repeatable.</p>
              <p>3. Yield is attractive relative to the stock own history.</p>
              <p>4. Payout ratio leaves room for recessions.</p>
              <p>5. The business has a long-term reason to keep compounding.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-4">Best dividend stocks FAQ</h2>
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
