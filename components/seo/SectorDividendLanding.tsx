import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { TrackPageView } from '@/components/analytics/TrackPageView'

type SectorLandingRow = Company & ComputedMetrics

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
  relatedLinks: { href: string; label: string }[]
  sections: { heading: string; paragraphs: string[] }[]
  checklist: string[]
}

async function getSectorStocks(dbSector: string): Promise<SectorLandingRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(
    `${baseUrl}/api/watchlist?sort=quality&order=desc&sector=${encodeURIComponent(dbSector)}`,
    { next: { revalidate: 3600 } },
  )
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

export async function SectorDividendLanding(props: SectorDividendLandingProps) {
  const rows = await getSectorStocks(props.dbSector)
  const undervalued = rows.filter((row) => row.weissSignal === 'undervalued').length
  const avgYield = average(rows.map((row) => row.currentYield).filter((value) => value > 0))
  const avgQuality = Math.round(average(rows.map((row) => row.qualityScore).filter((value) => value > 0)))
  const highestQuality = rows[0] ?? null
  const highestYield = [...rows].sort((a, b) => b.currentYield - a.currentYield)[0] ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(props)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(props, rows)) }} />
      <TrackPageView event={props.eventName} properties={{ count: rows.length }} />

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
      </section>

      <section className="mb-12">
        <DividendAlertsCTA
          source={props.source}
          title={props.ctaTitle}
          description={props.ctaDescription}
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="prose-dv max-w-3xl">
          {props.sections.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          ))}
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
