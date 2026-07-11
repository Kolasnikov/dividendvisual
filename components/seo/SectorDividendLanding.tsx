import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { serializeJsonLd } from '@/lib/json-ld'
import { getWatchlistStocks } from '@/lib/stock-data'
import { DataUnavailableNotice } from '@/components/seo/DataUnavailableNotice'

type SectorLandingRow = Company & ComputedMetrics

type FaqItem = {
  question: string
  answer: string
}

interface SectorDividendLandingProps {
  pageUrl: string
  eventName: string
  source: string
  dbSector: string
  eyebrow: string
  title: string
  description: string
  statLabel: string
  ctaTitle: string
  ctaDescription: string
  tableTitle?: string
  tableDescription?: string
  payoutLabel?: string
  payoutCaveat?: string
  decisionGuide?: { label: string; title: string; description: string }[]
  hideTopComparison?: boolean
  featuredAnalyses?: { href: string; symbol: string; title: string; note: string }[]
  relatedLinks: { href: string; label: string }[]
  sections: { heading: string; paragraphs: string[] }[]
  checklist: string[]
  faq?: FaqItem[]
}

async function getSectorStocks(dbSector: string): Promise<SectorLandingRow[]> {
  return getWatchlistStocks(dbSector)
}

function pct(value: number | null, decimals = 2) {
  if (value == null) return 'n/a'
  return `${(value * 100).toFixed(decimals)}%`
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function buildArticleJsonLd(props: SectorDividendLandingProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: props.title,
    description: props.description,
    url: props.pageUrl,
    author: { '@type': 'Organization', name: 'DividendVisual' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    isAccessibleForFree: true,
  }
}

function buildItemListJsonLd(props: SectorDividendLandingProps, rows: SectorLandingRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: props.title,
    description: props.description,
    url: props.pageUrl,
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

function buildFaqJsonLd(faq: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export async function SectorDividendLanding(props: SectorDividendLandingProps) {
  const rows = await getSectorStocks(props.dbSector)
  const topRows = rows.slice(0, 10)
  const undervalued = rows.filter((row) => row.weissSignal === 'undervalued').length
  const avgYield = average(rows.map((row) => row.currentYield).filter((value) => value > 0))
  const avgQuality = Math.round(average(rows.map((row) => row.qualityScore).filter((value) => value > 0)))
  const highestQuality = rows[0] ?? null
  const highestYield = [...rows].sort((a, b) => b.currentYield - a.currentYield)[0] ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildArticleJsonLd(props)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildItemListJsonLd(props, topRows)) }} />
      {props.faq?.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(props.faq)) }} />
      ) : null}
      <TrackPageView event={props.eventName} properties={{
        count: rows.length,
        undervalued,
        average_yield_pct: Number((avgYield * 100).toFixed(2)),
        average_quality: avgQuality,
      }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Dividend Screener', href: '/dividend-screener' },
        { label: props.title },
      ]} />

      <section className="mb-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3 py-1 text-xs font-medium text-[#818cf8] mb-4">
          {props.eyebrow}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f4f5] leading-tight mb-4">
          {props.title}
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-3xl">
          {props.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-4xl">
          {[
            { label: props.statLabel, value: rows.length.toString() },
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

      {rows.length === 0 ? (
        <section className="mb-10"><DataUnavailableNotice label={`${props.dbSector} screen`} /></section>
      ) : null}

      {!props.hideTopComparison ? <section className="mb-10">
        <div className="mb-5 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">Top 10 comparison</p>
          <h2 className="mt-2 text-xl font-semibold text-[#f4f4f5]">Top 10 {props.title.replace(/^Best /, '').replace(/ 2026$/, '')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#71717a]">
            A focused view of the highest-quality stocks in this screen, ranked by DividendVisual quality score.
            Use it to compare yield, dividend growth, and payout coverage before opening the full analysis.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#1e1e2e] bg-[#111118]">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                <th className="py-3 pl-4 pr-4 font-medium">Ticker</th>
                <th className="py-3 pr-4 font-medium">Yield</th>
                <th className="py-3 pr-4 font-medium">Dividend Growth</th>
                <th className="py-3 pr-4 font-medium">Payout Ratio</th>
                <th className="py-3 pr-4 text-right font-medium">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {topRows.map((row) => (
                <tr key={row.symbol} className="border-b border-[#1e1e2e]/70 last:border-0">
                  <td className="py-3 pl-4 pr-4">
                    <Link
                      href={`/analysis/${row.symbol.toLowerCase()}`}
                      className="font-mono font-semibold text-[#f4f4f5] transition-colors hover:text-[#6366f1]"
                    >
                      {row.symbol}
                    </Link>
                    <div className="mt-0.5 max-w-[240px] truncate text-xs text-[#71717a]">{row.name}</div>
                  </td>
                  <td className="py-3 pr-4 font-medium text-[#f4f4f5]">{pct(row.currentYield)}</td>
                  <td className="py-3 pr-4 text-[#a1a1aa]">{pct(row.dividendCagr5y, 1)}</td>
                  <td className="py-3 pr-4 text-[#a1a1aa]">
                    {row.payoutRatio != null && row.payoutRatio <= 2 ? pct(row.payoutRatio, 0) : 'n/a'}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Link
                      href={`/analysis/${row.symbol.toLowerCase()}`}
                      className="text-xs text-[#6366f1] transition-colors hover:text-[#818cf8]"
                    >
                      Read
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section> : null}

      {props.decisionGuide?.length ? (
        <section className="mb-10">
          <div className="mb-5 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">Decision framework</p>
            <h2 className="mt-2 text-xl font-semibold text-[#f4f4f5]">How to read this screen before comparing yields</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {props.decisionGuide.map((item) => (
              <div key={item.label} className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#818cf8]">{item.label}</p>
                <h3 className="mt-2 text-sm font-semibold text-[#f4f4f5]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-10">
        <div className="mb-5 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">Live comparison</p>
          <h2 className="mt-2 text-xl font-semibold text-[#f4f4f5]">{props.tableTitle ?? props.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#71717a]">
            {props.tableDescription ?? 'Ranked by DividendVisual quality score. Open any stock for its complete yield history, payout context, and Weiss valuation bands.'}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div>
        <div className="overflow-x-auto rounded-lg border border-[#1e1e2e] bg-[#111118]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                <th className="py-3 pl-4 pr-4 font-medium">Stock</th>
                <th className="py-3 pr-4 font-medium">Yield</th>
                <th className="py-3 pr-4 font-medium">{props.payoutLabel ?? 'Payout'}</th>
                <th className="py-3 pr-4 font-medium">Quality</th>
                <th className="py-3 pr-4 font-medium">Signal</th>
                <th className="py-3 pr-4 font-medium">5Y CAGR</th>
                <th className="py-3 pr-4 text-right font-medium">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.symbol} className="border-b border-[#1e1e2e]/70 last:border-0">
                  <td className="py-3 pl-4 pr-4">
                    <Link
                      href={`/analysis/${row.symbol.toLowerCase()}`}
                      className="font-mono font-semibold text-[#f4f4f5] hover:text-[#6366f1] transition-colors"
                    >
                      {row.symbol}
                    </Link>
                    <div className="mt-0.5 max-w-[220px] truncate text-xs text-[#71717a]">{row.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.isDividendKing ? <DividendBadge type="king" /> : null}
                      {row.isDividendAristocrat && !row.isDividendKing ? <DividendBadge type="aristocrat" /> : null}
                    </div>
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
        {props.payoutCaveat ? (
          <p className="mt-3 text-xs leading-relaxed text-[#52525b]">{props.payoutCaveat}</p>
        ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-2">Highest quality score</p>
            {highestQuality ? (
              <>
                <Link
                  href={`/analysis/${highestQuality.symbol.toLowerCase()}`}
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
              <p className="text-sm text-[#71717a]">Sector data is loading.</p>
            )}
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <p className="text-sm font-semibold text-[#f4f4f5] mb-2">Highest yield</p>
            {highestYield ? (
              <>
                <Link
                  href={`/analysis/${highestYield.symbol.toLowerCase()}`}
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
              {props.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-[#6366f1] hover:text-[#818cf8]">
                  {link.label} -&gt;
                </Link>
              ))}
            </div>
          </div>
        </aside>
        </div>
      </section>

      {props.featuredAnalyses && props.featuredAnalyses.length > 0 && (
        <section className="mb-12 border-y border-[#1e1e2e] py-8">
          <div className="mb-5 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">
              Priority analysis
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#f4f4f5]">
              Dividend analyses to read next
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {props.featuredAnalyses.map((analysis) => (
              <Link
                key={analysis.href}
                href={analysis.href}
                className="group rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 transition-colors hover:border-[#6366f1]/40"
              >
                <p className="font-mono text-xs font-semibold text-[#818cf8]">{analysis.symbol}</p>
                <h3 className="mt-2 text-sm font-semibold text-[#f4f4f5] transition-colors group-hover:text-[#818cf8]">
                  {analysis.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{analysis.note}</p>
                <p className="mt-4 text-sm text-[#6366f1]">Read analysis -&gt;</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-12">
        <DividendAlertsCTA
          source={props.source}
          title={props.ctaTitle}
          description={props.ctaDescription}
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="prose-dv max-w-3xl">
          <h2>How we selected these stocks</h2>
          <p>
            This list starts with companies classified in the {props.dbSector} sector inside DividendVisual&apos;s
            dividend universe, then ranks them by quality score. The quality score weighs dividend durability,
            payout coverage, dividend growth, streak length, and whether the current yield is attractive versus
            the stock&apos;s own history.
          </p>
          <p>
            Yield alone is not enough. A high yield can mean a better entry price, but it can also mean the market
            expects slower growth or a future dividend cut. That is why this page shows dividend growth and payout
            ratio beside yield, and links every ticker to a full analysis page with Weiss valuation context.
          </p>
          <p>
            For the broader methodology, read the{' '}
            <Link href="/methodology" className="text-[#6366f1] hover:text-[#818cf8]">DividendVisual methodology</Link>
            {' '}or compare the full universe in the{' '}
            <Link href="/dividend-screener" className="text-[#6366f1] hover:text-[#818cf8]">dividend stock screener</Link>.
          </p>

          {props.sections.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          ))}

          {props.faq?.length ? (
            <div>
              <h2>Frequently asked questions</h2>
              {props.faq.map((item) => (
                <div key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <aside className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 h-fit">
          <p className="text-sm font-semibold text-[#f4f4f5] mb-3">What to check before buying</p>
          <div className="space-y-3 text-sm text-[#71717a]">
            {props.checklist.map((item, index) => (
              <p key={item}>{index + 1}. {item}</p>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}
