import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { TrackPageView } from '@/components/analytics/TrackPageView'

type MonthlyDividendRow = Company & ComputedMetrics

const PAGE_URL = 'https://dividendvisual.com/best-monthly-dividend-stocks'
const YEAR = 2026

export const metadata: Metadata = {
  title: `Best Monthly Dividend Stocks ${YEAR} - Ranked by Yield, Safety & Weiss Signal`,
  description:
    'Monthly dividend stocks ranked by dividend yield, quality score, payout safety, dividend growth, and Geraldine Weiss valuation signal. Compare O, MAIN, STAG, ADC, and other monthly payers.',
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: `Best Monthly Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare monthly dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Monthly Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Monthly dividend payers ranked by yield, safety, dividend growth, and Weiss valuation signal.',
  },
}

async function getMonthlyDividendStocks(): Promise<MonthlyDividendRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/collections/monthly-dividend-payers`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

function pct(value: number | null, decimals = 2) {
  if (value == null) return 'n/a'
  return `${(value * 100).toFixed(decimals)}%`
}

function money(value: number | null) {
  if (value == null) return 'n/a'
  return `$${value.toFixed(2)}`
}

const FAQ = [
  {
    q: 'What are monthly dividend stocks?',
    a: 'Monthly dividend stocks are companies or funds that pay shareholders every month instead of every quarter. They are popular with income investors because the cash flow schedule is closer to a paycheck.',
  },
  {
    q: 'Are monthly dividend stocks safe?',
    a: 'Some monthly dividend stocks are durable income holdings, but the payment schedule does not make a dividend safe by itself. Payout ratio, free cash flow coverage, debt, dividend history, and business quality matter more than payment frequency.',
  },
  {
    q: 'Which monthly dividend stock is best?',
    a: 'The best monthly dividend stock depends on the investor objective. Realty Income is often used as a conservative REIT benchmark, Main Street Capital offers BDC exposure, and STAG Industrial gives industrial real estate exposure. DividendVisual ranks them by quality score and Weiss valuation signal.',
  },
  {
    q: 'Do monthly dividends compound faster?',
    a: 'Monthly dividends can compound slightly faster than quarterly dividends when reinvested, because cash is put back to work sooner. The difference is usually modest; dividend safety and growth rate are more important over long holding periods.',
  },
  {
    q: 'Are monthly dividend stocks better than quarterly dividend stocks?',
    a: 'Not automatically. Monthly payers can be useful for income timing, but many of the highest-quality dividend growth companies pay quarterly. Investors should compare yield, growth, payout safety, and valuation rather than choosing only by payment frequency.',
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

function buildItemListJsonLd(rows: MonthlyDividendRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Monthly Dividend Stocks ${YEAR}`,
    description:
      'Monthly dividend stocks ranked by dividend yield, quality score, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
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
    headline: `Best Monthly Dividend Stocks ${YEAR}`,
    description:
      'Monthly dividend stocks ranked by dividend yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    author: { '@type': 'Organization', name: 'DividendVisual' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    isAccessibleForFree: true,
  }
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default async function MonthlyDividendStocksPage() {
  const rows = await getMonthlyDividendStocks()
  const avgYield = average(rows.map((row) => row.currentYield).filter((value) => value > 0))
  const highestYield = rows.reduce<MonthlyDividendRow | null>(
    (winner, row) => (!winner || row.currentYield > winner.currentYield ? row : winner),
    null
  )
  const undervalued = rows.filter((row) => row.weissSignal === 'undervalued').length
  const avgQuality = Math.round(average(rows.map((row) => row.qualityScore).filter((value) => value > 0)))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(rows)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }} />
      <TrackPageView event="monthly_dividend_stocks_viewed" properties={{ count: rows.length }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener', href: '/dividend-screener' },
        { label: 'Monthly Dividend Stocks' },
      ]} />

      <section className="mb-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#22c55e] mb-4">
          Monthly income stocks
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          Monthly Dividend Stocks {YEAR}
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          Compare monthly dividend stocks by current yield, payout safety, dividend growth, quality score, and
          Geraldine Weiss valuation signal. Built for long-term income investors who want monthly cash flow without
          blindly chasing high yield.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-4xl">
          {[
            { label: 'Monthly payers', value: rows.length.toString() },
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
        <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
          <h2 className="text-lg font-semibold text-[#f4f4f5] mb-3">
            Best monthly dividend stocks by quality and valuation
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                  <th className="py-3 pr-4 font-medium">Stock</th>
                  <th className="py-3 pr-4 font-medium">Yield</th>
                  <th className="py-3 pr-4 font-medium">Quality</th>
                  <th className="py-3 pr-4 font-medium">Signal</th>
                  <th className="py-3 pr-4 font-medium">5Y CAGR</th>
                  <th className="py-3 text-right font-medium">Analysis</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.symbol} className="border-b border-[#1e1e2e]/70 last:border-0">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/ticker/${row.symbol}`}
                        className="font-mono font-semibold text-[#f4f4f5] hover:text-[#6366f1] transition-colors"
                      >
                        {row.symbol}
                      </Link>
                      <div className="mt-0.5 max-w-[220px] truncate text-xs text-[#71717a]">{row.name}</div>
                    </td>
                    <td className="py-3 pr-4 font-medium text-[#f4f4f5]">{pct(row.currentYield)}</td>
                    <td className="py-3 pr-4">
                      <span className={row.qualityScore >= 70 ? 'text-[#22c55e]' : 'text-[#f59e0b]'}>
                        {row.qualityScore}/100
                      </span>
                    </td>
                    <td className="py-3 pr-4"><SignalBadge signal={row.weissSignal} size="sm" /></td>
                    <td className="py-3 pr-4 text-[#a1a1aa]">{pct(row.dividendCagr5y, 1)}</td>
                    <td className="py-3 text-right">
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
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-2">Current standout</p>
            {highestYield ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/ticker/${highestYield.symbol}`}
                      className="font-mono text-xl font-semibold text-[#f4f4f5] hover:text-[#6366f1]"
                    >
                      {highestYield.symbol}
                    </Link>
                    <p className="mt-1 text-xs text-[#71717a]">{highestYield.name}</p>
                  </div>
                  <SignalBadge signal={highestYield.weissSignal} size="sm" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[#71717a]">Yield</p>
                    <p className="text-base font-semibold text-[#f4f4f5]">{pct(highestYield.currentYield)}</p>
                  </div>
                  <div>
                    <p className="text-[#71717a]">Price</p>
                    <p className="text-base font-semibold text-[#f4f4f5]">{money(highestYield.currentPrice)}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#71717a]">Monthly dividend data is loading.</p>
            )}
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-3">Related screens</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/dividend-screener', label: 'Dividend stock screener' },
                { href: '/best-reit-dividend-stocks', label: 'REIT dividend stocks' },
                { href: '/best-dividend-stocks', label: 'Best dividend stocks' },
                { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
                { href: '/drip-calculator', label: 'Dividend DRIP calculator' },
                { href: '/methodology', label: 'Weiss valuation methodology' },
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
          source="monthly-dividend-stocks"
          title="Get alerts when monthly dividend stocks become undervalued"
          description="A weekly dividend research email with monthly payers and other quality income stocks entering historically attractive yield territory."
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="prose-dv max-w-3xl">
          <h2>How to evaluate monthly dividend stocks</h2>
          <p>
            Monthly dividend stocks are attractive because the income schedule is predictable, but payment frequency
            should never be the first filter. Start with dividend safety: payout ratio, free cash flow coverage, balance
            sheet strength, and the length of the dividend record.
          </p>
          <p>
            The second filter is valuation. DividendVisual uses the Geraldine Weiss yield method, comparing today&apos;s
            dividend yield with each stock&apos;s own historical yield range. If the current yield is near the high end
            of history and the dividend remains well covered, the stock may be trading at an unusually attractive entry
            point.
          </p>

          <h2>Monthly dividends vs quarterly dividends</h2>
          <p>
            Monthly dividends can make portfolio cash flow smoother and can slightly improve dividend reinvestment
            timing. The advantage is real but modest. Over a 10 or 20 year holding period, dividend growth and dividend
            safety usually matter more than whether the payment arrives monthly or quarterly.
          </p>
          <p>
            This is why many strong dividend portfolios combine monthly payers like Realty Income with quarterly
            dividend growers such as Dividend Aristocrats and Dividend Kings. The monthly payers help with income
            rhythm; the broader dividend growth universe helps with quality and diversification.
          </p>

          <h2>Common risks in monthly dividend stocks</h2>
          <p>
            Many monthly payers are REITs, BDCs, or other high-income structures. These businesses can be useful, but
            they often carry higher sensitivity to interest rates, credit spreads, and leverage. A high monthly yield
            can be an opportunity, but it can also be a warning that the market expects slower growth or a future
            dividend cut.
          </p>
          <p>
            Before buying a monthly dividend stock, compare the current yield with its own history, review payout
            coverage, and check whether dividend growth is still positive. A monthly payment is only valuable if the
            dividend itself is durable.
          </p>
        </article>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <p className="text-sm font-semibold text-[#f4f4f5] mb-3">What to check before buying</p>
          <div className="space-y-3 text-sm text-[#71717a]">
            <p>1. Is the dividend covered by cash flow?</p>
            <p>2. Is the current yield high relative to the stock&apos;s own history?</p>
            <p>3. Has the dividend grown over the past five years?</p>
            <p>4. Is the business exposed to rate or credit stress?</p>
            <p>5. Does the position improve portfolio diversification?</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {rows.slice(0, 4).map((row) => (
              <Link
                key={row.symbol}
                href={`/ticker/${row.symbol}`}
                className="rounded-md border border-[#2e2e3e] bg-[#1e1e2e] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-[#6366f1]/40 hover:text-[#f4f4f5]"
              >
                {row.symbol}
              </Link>
            ))}
            <DividendBadge type="bluechip" />
          </div>
        </aside>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-4">Monthly dividend stocks FAQ</h2>
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
