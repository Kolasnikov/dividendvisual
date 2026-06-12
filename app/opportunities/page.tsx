import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { WatchlistItem } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { getEtoroLink } from '@/lib/etoro'

export const metadata: Metadata = {
  title: 'Undervalued Dividend Stocks Today - Weiss Signal Opportunities',
  description: 'Undervalued dividend stocks trading near 10-year high dividend yields, ranked by quality score, payout safety, and Geraldine Weiss valuation signal. Updated daily.',
  alternates: {
    canonical: 'https://dividendvisual.com/undervalued-dividend-stocks',
  },
  openGraph: {
    title: 'Undervalued Dividend Stocks Today | DividendVisual',
    description: 'Dividend stocks in historically undervalued territory right now, ranked by quality score and dividend safety.',
    url: 'https://dividendvisual.com/undervalued-dividend-stocks',
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

type ChangeTone = 'positive' | 'negative' | 'neutral'

interface RecentChange {
  symbol: string
  name: string
  sector: string | null
  currentPrice: number
  currentYield: number
  weissSignal: WatchlistItem['weissSignal']
  qualityScore: number
  previousDate: string
  currentDate: string
  priceDeltaPct: number | null
  yieldDelta: number | null
  qualityDelta: number | null
  previousSignal: WatchlistItem['weissSignal'] | null
  previousYield: number | null
  previousPrice: number | null
}

interface RecentChanges {
  latestDate: string | null
  previousDate: string | null
  newlyUndervalued: RecentChange[]
  yieldIncreases: RecentChange[]
  priceDrops: RecentChange[]
  qualityMoves: RecentChange[]
  leftUndervalued: RecentChange[]
}

const emptyRecentChanges: RecentChanges = {
  latestDate: null,
  previousDate: null,
  newlyUndervalued: [],
  yieldIncreases: [],
  priceDrops: [],
  qualityMoves: [],
  leftUndervalued: [],
}

async function getRecentChanges(): Promise<RecentChanges> {
  try {
    const result = await db.execute({
      sql: `WITH latest AS (
              SELECT MAX(snapshot_date) AS latest_date
              FROM ticker_metric_snapshots
            ),
            current_rows AS (
              SELECT s.*
              FROM ticker_metric_snapshots s
              JOIN latest l ON s.snapshot_date = l.latest_date
            ),
            historical_rows AS (
              SELECT
                snapshot_date, symbol, current_price, current_yield,
                weiss_signal, quality_score
              FROM ticker_metric_snapshots
              UNION ALL
              SELECT
                snapshot_date, symbol, current_price, current_yield,
                weiss_signal, quality_score
              FROM newsletter_signal_snapshots
            ),
            previous_rows AS (
              SELECT p.*
              FROM historical_rows p
              JOIN current_rows c ON c.symbol = p.symbol
              WHERE p.snapshot_date = (
                SELECT MAX(p2.snapshot_date)
                FROM historical_rows p2
                WHERE p2.symbol = c.symbol
                  AND p2.snapshot_date < c.snapshot_date
              )
            )
            SELECT
              c.symbol,
              co.name,
              co.sector,
              c.snapshot_date AS current_date,
              p.snapshot_date AS previous_date,
              c.current_price,
              p.current_price AS previous_price,
              c.current_yield,
              p.current_yield AS previous_yield,
              c.weiss_signal,
              p.weiss_signal AS previous_signal,
              c.quality_score,
              p.quality_score AS previous_quality_score
            FROM current_rows c
            JOIN previous_rows p ON p.symbol = c.symbol
            JOIN companies co ON co.symbol = c.symbol
            WHERE c.current_price IS NOT NULL
              AND p.current_price IS NOT NULL
              AND c.current_yield IS NOT NULL
              AND p.current_yield IS NOT NULL`,
    })

    const rows: RecentChange[] = result.rows.map((row) => {
      const currentPrice = (row.current_price as number) ?? 0
      const previousPrice = row.previous_price as number | null
      const currentYield = (row.current_yield as number) ?? 0
      const previousYield = row.previous_yield as number | null
      const qualityScore = (row.quality_score as number) ?? 0
      const previousQualityScore = row.previous_quality_score as number | null

      return {
        symbol: row.symbol as string,
        name: row.name as string,
        sector: row.sector as string | null,
        currentDate: row.current_date as string,
        previousDate: row.previous_date as string,
        currentPrice,
        previousPrice,
        currentYield,
        previousYield,
        weissSignal: ((row.weiss_signal as string) ?? 'fair') as WatchlistItem['weissSignal'],
        previousSignal: (row.previous_signal as WatchlistItem['weissSignal'] | null) ?? null,
        qualityScore,
        priceDeltaPct: previousPrice && previousPrice > 0 ? (currentPrice - previousPrice) / previousPrice : null,
        yieldDelta: previousYield != null ? currentYield - previousYield : null,
        qualityDelta: previousQualityScore != null ? qualityScore - previousQualityScore : null,
      }
    })

    if (rows.length === 0) return emptyRecentChanges

    const byYieldIncrease = [...rows]
      .filter((row) => (row.yieldDelta ?? 0) >= 0.001)
      .sort((a, b) => (b.yieldDelta ?? 0) - (a.yieldDelta ?? 0))
      .slice(0, 4)

    const byPriceDrop = [...rows]
      .filter((row) => (row.priceDeltaPct ?? 0) <= -0.01)
      .sort((a, b) => (a.priceDeltaPct ?? 0) - (b.priceDeltaPct ?? 0))
      .slice(0, 4)

    const byQualityMove = [...rows]
      .filter((row) => Math.abs(row.qualityDelta ?? 0) >= 3)
      .sort((a, b) => Math.abs(b.qualityDelta ?? 0) - Math.abs(a.qualityDelta ?? 0))
      .slice(0, 4)

    return {
      latestDate: rows[0].currentDate,
      previousDate: rows[0].previousDate,
      newlyUndervalued: rows
        .filter((row) => row.weissSignal === 'undervalued' && row.previousSignal !== 'undervalued')
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, 4),
      yieldIncreases: byYieldIncrease,
      priceDrops: byPriceDrop,
      qualityMoves: byQualityMove,
      leftUndervalued: rows
        .filter((row) => row.previousSignal === 'undervalued' && row.weissSignal !== 'undervalued')
        .sort((a, b) => (b.previousYield ?? 0) - (a.previousYield ?? 0))
        .slice(0, 4),
    }
  } catch {
    return emptyRecentChanges
  }
}

function pct(v: number | null, d = 2) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(d)}%`
}

function signedPct(v: number, d = 1) {
  const sign = v > 0 ? '+' : ''
  return `${sign}${(v * 100).toFixed(d)}%`
}

function signedPp(v: number, d = 2) {
  const sign = v > 0 ? '+' : ''
  return `${sign}${(v * 100).toFixed(d)} pp`
}

function signedNumber(v: number) {
  const sign = v > 0 ? '+' : ''
  return `${sign}${v}`
}

function yieldProximity(item: WatchlistItem): number {
  if (!item.historicalMaxYield || !item.historicalMinYield) return 0
  const range = item.historicalMaxYield - item.historicalMinYield
  if (range <= 0) return 0
  return Math.min(100, Math.round(((item.currentYield - item.historicalMinYield) / range) * 100))
}

function OpportunityCard({ item }: { item: WatchlistItem }) {
  const proximity = yieldProximity(item)
  const scoreColor = item.qualityScore >= 80 ? '#22c55e'
    : item.qualityScore >= 65 ? '#6366f1'
    : item.qualityScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <Link
      href={`/ticker/${item.symbol}`}
      className="block bg-[#111118] border border-[#22c55e]/25 rounded-xl p-5 hover:border-[#22c55e]/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-lg text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
              {item.symbol}
            </span>
            <SignalBadge signal={item.weissSignal} size="sm" />
          </div>
          <p className="text-xs text-[#71717a] line-clamp-1 max-w-[200px]">{item.name}</p>
          {item.sector && <p className="text-[10px] text-[#52525b] mt-0.5">{item.sector}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-[#f4f4f5]">${item.currentPrice.toFixed(2)}</p>
          <p className="text-sm font-semibold text-[#22c55e]">{pct(item.currentYield)} yield</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-[#52525b] mb-1.5">
          <span>Min {pct(item.historicalMinYield)}</span>
          <span className="text-[#22c55e] font-medium">{proximity}% of range</span>
          <span>Max {pct(item.historicalMaxYield)}</span>
        </div>
        <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#6366f1] to-[#22c55e] transition-all"
            style={{ width: `${proximity}%` }}
          />
        </div>
        <p className="text-[10px] text-[#52525b] mt-1">
          Undervalued below ${item.undervaluedPrice.toFixed(2)} · Overvalued above ${item.overvaluedPrice.toFixed(2)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#09090b] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#52525b] mb-0.5">Quality</p>
          <p className="text-sm font-bold" style={{ color: scoreColor }}>{item.qualityScore}</p>
        </div>
        <div className="bg-[#09090b] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#52525b] mb-0.5">CAGR 5Y</p>
          <p className="text-sm font-semibold text-[#f4f4f5]">{pct(item.dividendCagr5y, 1)}</p>
        </div>
        <div className="bg-[#09090b] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#52525b] mb-0.5">Payout</p>
          <p className="text-sm font-semibold text-[#f4f4f5]">
            {item.payoutRatio != null && item.payoutRatio <= 2.0 ? pct(item.payoutRatio, 0) : '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {item.isDividendKing && <DividendBadge type="king" />}
          {item.isDividendAristocrat && !item.isDividendKing && <DividendBadge type="aristocrat" />}
        </div>
        {item.yearsIncreasingDividends > 0 && (
          <span className="text-[10px] text-[#52525b]">
            {item.yearsIncreasingDividends}yr streak
          </span>
        )}
      </div>
    </Link>
  )
}

function WatchCard({ item }: { item: WatchlistItem }) {
  const proximity = yieldProximity(item)
  return (
    <Link
      href={`/ticker/${item.symbol}`}
      className="flex items-center gap-4 bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3 hover:border-[#6366f1]/30 transition-all group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-sm text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
            {item.symbol}
          </span>
          <span className="text-xs text-[#71717a] truncate">{item.name}</span>
        </div>
        <div className="mt-1.5 h-1 bg-[#1e1e2e] rounded-full overflow-hidden w-32">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#6366f1] to-[#22c55e]"
            style={{ width: `${proximity}%` }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-[#f4f4f5]">{pct(item.currentYield)}</p>
        <p className="text-[10px] text-[#52525b]">{proximity}% of range</p>
      </div>
      <div className="text-right shrink-0 w-10">
        <p className="text-sm font-bold" style={{
          color: item.qualityScore >= 65 ? '#6366f1' : item.qualityScore >= 50 ? '#f59e0b' : '#71717a'
        }}>{item.qualityScore}</p>
        <p className="text-[10px] text-[#52525b]">score</p>
      </div>
    </Link>
  )
}

function toneClass(tone: ChangeTone) {
  if (tone === 'positive') return 'text-[#22c55e]'
  if (tone === 'negative') return 'text-[#f87171]'
  return 'text-[#a1a1aa]'
}

function RecentChangeCard({
  change,
  label,
  value,
  detail,
  tone,
}: {
  change: RecentChange
  label: string
  value: string
  detail: string
  tone: ChangeTone
}) {
  return (
    <Link
      href={`/ticker/${change.symbol}`}
      className="block bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#6366f1]/35 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-sm text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
              {change.symbol}
            </span>
            <SignalBadge signal={change.weissSignal} size="sm" />
          </div>
          <p className="mt-1 text-xs text-[#71717a] truncate">{change.name}</p>
          {change.sector && <p className="text-[10px] text-[#52525b] mt-0.5">{change.sector}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-semibold ${toneClass(tone)}`}>{value}</p>
          <p className="text-[10px] text-[#52525b]">{label}</p>
        </div>
      </div>
      <p className="text-xs text-[#a1a1aa] leading-relaxed">{detail}</p>
      <div className="mt-3 flex items-center justify-between text-[10px] text-[#52525b]">
        <span>{pct(change.currentYield)} yield</span>
        <span>Quality {change.qualityScore}/100</span>
      </div>
    </Link>
  )
}

function RecentChangeGroup({
  title,
  description,
  changes,
  render,
}: {
  title: string
  description: string
  changes: RecentChange[]
  render: (change: RecentChange) => ReactNode
}) {
  if (changes.length === 0) return null

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[#f4f4f5]">{title}</h3>
        <p className="mt-1 text-xs text-[#71717a]">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {changes.map((change) => (
          <div key={`${title}-${change.symbol}`}>{render(change)}</div>
        ))}
      </div>
    </div>
  )
}

function RecentChangesSection({ changes }: { changes: RecentChanges }) {
  const hasChanges =
    changes.newlyUndervalued.length > 0 ||
    changes.yieldIncreases.length > 0 ||
    changes.priceDrops.length > 0 ||
    changes.qualityMoves.length > 0 ||
    changes.leftUndervalued.length > 0

  return (
    <section className="mb-12">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-sm font-semibold text-[#f4f4f5] uppercase tracking-wide">
          Recent Changes
        </h2>
        <div className="h-px flex-1 bg-[#1e1e2e]" />
        {changes.latestDate && changes.previousDate ? (
          <span className="text-xs text-[#71717a]">{changes.previousDate} → {changes.latestDate}</span>
        ) : (
          <span className="text-xs text-[#71717a]">Initializing after the next full refresh</span>
        )}
      </div>

      {!changes.previousDate ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
          <p className="text-sm font-medium text-[#f4f4f5] mb-1">Change tracking is warming up</p>
          <p className="text-sm text-[#71717a] leading-relaxed">
            The latest metrics are saved. After the next full refresh, this section will show fresh undervalued entrants,
            yield moves, price drops, quality changes, and stocks that left the undervalued zone.
          </p>
        </div>
      ) : hasChanges ? (
        <div className="space-y-7">
          <RecentChangeGroup
            title="Newly undervalued"
            description="Stocks whose Weiss signal moved into undervalued territory."
            changes={changes.newlyUndervalued}
            render={(change) => (
              <RecentChangeCard
                change={change}
                label="signal"
                value="New"
                tone="positive"
                detail={`Signal moved from ${change.previousSignal ?? 'fair'} to undervalued. Current yield is ${pct(change.currentYield)}.`}
              />
            )}
          />
          <RecentChangeGroup
            title="Biggest yield increases"
            description="Yield moved higher versus the previous update."
            changes={changes.yieldIncreases}
            render={(change) => (
              <RecentChangeCard
                change={change}
                label="yield move"
                value={signedPp(change.yieldDelta ?? 0)}
                tone="positive"
                detail={`Yield moved from ${pct(change.previousYield)} to ${pct(change.currentYield)}.`}
              />
            )}
          />
          <RecentChangeGroup
            title="Biggest price drops"
            description="Price weakness that may be worth reviewing."
            changes={changes.priceDrops}
            render={(change) => (
              <RecentChangeCard
                change={change}
                label="price move"
                value={signedPct(change.priceDeltaPct ?? 0)}
                tone="positive"
                detail={`Price moved from $${(change.previousPrice ?? 0).toFixed(2)} to $${change.currentPrice.toFixed(2)}.`}
              />
            )}
          />
          <RecentChangeGroup
            title="Quality score changes"
            description="Dividend quality moved enough to review."
            changes={changes.qualityMoves}
            render={(change) => {
              const delta = change.qualityDelta ?? 0
              return (
                <RecentChangeCard
                  change={change}
                  label="score move"
                  value={signedNumber(delta)}
                  tone={delta > 0 ? 'positive' : 'negative'}
                  detail={`Quality score is now ${change.qualityScore}/100.`}
                />
              )
            }}
          />
          <RecentChangeGroup
            title="Left undervalued zone"
            description="Stocks no longer showing an undervalued Weiss signal."
            changes={changes.leftUndervalued}
            render={(change) => (
              <RecentChangeCard
                change={change}
                label="signal"
                value="Exited"
                tone="neutral"
                detail={`Signal moved from undervalued to ${change.weissSignal}. Current yield is ${pct(change.currentYield)}.`}
              />
            )}
          />
        </div>
      ) : (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
          <p className="text-sm font-medium text-[#f4f4f5] mb-1">No major changes since the last update</p>
          <p className="text-sm text-[#71717a] leading-relaxed">
            No ticker crossed the main movement thresholds for signal, yield, price, or quality. Current opportunities are still listed below.
          </p>
        </div>
      )}
    </section>
  )
}

const FAQ = [
  {
    q: 'What does "undervalued" mean on this page?',
    a: 'A stock is undervalued by the Geraldine Weiss method when its current dividend yield is near the top of its 10-year historical yield range — specifically at or above the 90th percentile of its historical yield distribution. Because yield and price move in opposite directions, a high yield means a low price relative to the income the stock generates. Historically, buying quality dividend stocks when their yield is near its 10-year high has preceded above-average total returns.',
  },
  {
    q: 'How is the 10-year yield range calculated?',
    a: "DividendVisual uses 10 years of daily price and dividend history to compute each stock's yield on every trading day. The historical minimum yield represents the most expensive the stock has been (lowest yield = highest price relative to dividend). The historical maximum yield represents the cheapest it has been. These two points define the Weiss valuation band. The undervalued threshold is set at the 90th percentile of the historical yield distribution.",
  },
  {
    q: 'What is the quality score and why does it matter here?',
    a: 'The quality score (0–100) measures dividend reliability and safety across five factors: payout ratio (25 pts), dividend growth streak (25 pts), 5-year dividend CAGR (20 pts), yield vs. history (15 pts), and FCF payout ratio (15 pts). On this page, stocks are sorted by quality score because the Weiss undervalue signal is only meaningful if the dividend is safe. An undervalued signal on a stock with a low quality score may indicate a dividend at risk — which would make the historical yield comparison misleading.',
  },
  {
    q: 'Should I buy immediately when a stock appears here?',
    a: "This page shows signals, not recommendations. The Weiss method tells you when a stock is historically cheap relative to its own income history — it doesn't tell you when prices will recover. Stocks can remain undervalued for months or years if the macro environment (rising rates, sector rotation) keeps pressure on prices. Many income investors use these signals to initiate partial positions and add on further weakness, rather than deploying all capital at once.",
  },
  {
    q: 'What is the "Worth Watching" section?',
    a: 'The Worth Watching section shows stocks currently at fair value — neither undervalued nor overvalued by the Weiss method — but with a current yield that is approaching the undervalued threshold. These are stocks to monitor: if the price declines modestly or the dividend increases, they may cross into undervalued territory. The proximity bar shows how far each stock\'s yield is through its historical range, from minimum (left) to maximum (right).',
  },
]

export default async function OpportunitiesPage() {
  const [all, recentChanges, hdrs] = await Promise.all([
    getWatchlist(),
    getRecentChanges(),
    headers(),
  ])
  const etoroHref = getEtoroLink(hdrs.get('x-vercel-ip-country'))

  const strong = all.filter((s) => s.weissSignal === 'undervalued')
  const watching = all
    .filter((s) => s.weissSignal === 'fair' && s.qualityScore >= 55)
    .map((s) => ({ ...s, proximity: yieldProximity(s) }))
    .filter((s) => s.proximity >= 60)
    .sort((a, b) => b.proximity - a.proximity)
    .slice(0, 8)

  const itemListLd = strong.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Undervalued Dividend Stocks — Weiss Signal',
    description: 'Dividend stocks currently trading in historically undervalued territory by the Geraldine Weiss yield method.',
    url: 'https://dividendvisual.com/undervalued-dividend-stocks',
    numberOfItems: strong.length,
    itemListElement: strong.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://dividendvisual.com/analysis/${s.symbol.toLowerCase()}`,
      name: `${s.name} (${s.symbol}) — ${(s.currentYield * 100).toFixed(2)}% yield`,
    })),
  } : null

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {itemListLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <TrackPageView event="opportunities_viewed" properties={{ undervaluedCount: strong.length }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Undervalued Dividend Stocks' },
      ]} />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold text-[#f4f4f5]">Undervalued Dividend Stocks Today</h1>
          {strong.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/25 text-xs font-semibold text-[#22c55e]">
              {strong.length} undervalued
            </span>
          )}
        </div>
        <p className="text-[#71717a] max-w-2xl text-sm leading-relaxed">
          Dividend stocks with yields near their 10-year historical highs — the Geraldine Weiss undervalue signal.
          Sorted by quality score: higher scores mean safer, more reliable dividends. Updated daily.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
        <DividendAlertsCTA
          source="opportunities"
          title="Get notified when new dividend opportunities appear"
          description="We track the Weiss signal daily and send a short weekly digest when quality dividend stocks enter undervalued territory."
        />
        <a
          href={etoroHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#22c55e]/25 bg-[#0b1a10] px-6 py-4 text-center hover:border-[#22c55e]/50 transition-colors group lg:min-w-[200px]"
        >
          <span className="text-[10px] font-semibold text-[#22c55e] uppercase tracking-wide">Commission-free</span>
          <span className="text-sm font-semibold text-[#f4f4f5] group-hover:text-white transition-colors leading-snug">Buy these stocks<br />on eToro</span>
          <span className="text-[10px] text-[#52525b]">€50 minimum · Capital at risk</span>
        </a>
      </div>

      {/* Strong opportunities */}
      {strong.length > 0 ? (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-[#f4f4f5] uppercase tracking-wide">
              Undervalued Now
            </h2>
            <div className="h-px flex-1 bg-[#1e1e2e]" />
            <span className="text-xs text-[#71717a]">Yield near 10-year high · Weiss signal: Undervalued</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {strong.map((item) => (
              <OpportunityCard key={item.symbol} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="mb-12 bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 text-center">
          <p className="text-[#f4f4f5] font-medium mb-1">No undervalued stocks right now</p>
          <p className="text-sm text-[#71717a]">The market is currently pricing most dividend stocks at or above fair value. Check back when conditions change.</p>
        </div>
      )}

      {/* Worth watching */}
      {watching.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-[#f4f4f5] uppercase tracking-wide">
              Worth Watching
            </h2>
            <div className="h-px flex-1 bg-[#1e1e2e]" />
            <span className="text-xs text-[#71717a]">Fair value · Yield approaching undervalued zone</span>
          </div>
          <div className="space-y-2">
            {watching.map((item) => (
              <WatchCard key={item.symbol} item={item} />
            ))}
          </div>
        </section>
      )}

      <RecentChangesSection changes={recentChanges} />

      {/* Pillar content */}
      <div className="border-t border-[#1e1e2e] pt-12 max-w-3xl">
        <article className="prose-dv">

          <h2>How to Read a Weiss Undervalue Signal</h2>
          <p>
            The Geraldine Weiss method does not use earnings multiples, analyst price targets, or discounted cash flow
            models. It asks a simpler question: is this stock&apos;s dividend yield near the high end of its own
            historical range? If yes — if the stock is paying more income relative to its price than it has for most
            of the past decade — it is, by the Weiss definition, undervalued.
          </p>
          <p>
            The logic is grounded in mean reversion. Dividend yields do not stay at their historical extremes
            indefinitely. When a quality stock&apos;s yield reaches a 10-year high, it typically means the price
            has been pushed down by macro forces — rising interest rates, sector rotation, market panic — rather than
            company-specific deterioration. When those forces ease, the price tends to recover toward its historical
            median, the yield compresses back toward its historical midpoint, and the investor who bought at the
            historical high yield earns both above-average income and capital appreciation.
          </p>
          <p>
            This is why the quality score matters so much on this page. An undervalued signal on a Dividend King
            with a quality score of 85 — strong FCF coverage, 50+ year growth streak, low payout ratio — is a
            fundamentally different setup from an undervalued signal on a stock with a 38 quality score. Both
            yields may be near their historical highs, but only one has the dividend safety to make the historical
            comparison meaningful.
          </p>

          <h2>How Often Do Undervalue Signals Appear?</h2>
          <p>
            In a bull market where prices are rising broadly, undervalue signals are rare. When most stocks are
            trending higher, their yields trend lower — toward or below the historical median. The Weiss screener
            produces the most signals during three types of market conditions: interest rate hike cycles (which
            mechanically compress dividend stock prices, especially utilities and REITs), broad market corrections
            (which push all dividend stocks cheaper indiscriminately), and sector-specific rotations (when capital
            leaves a specific sector — consumer staples, healthcare, financials — in favor of growth or momentum names).
          </p>
          <p>
            Historically, the periods that have generated the most DividendVisual undervalue signals are also the
            periods that have preceded the best subsequent returns. The 2022–2023 rate-hike cycle, which pushed
            utility and REIT yields to multi-decade highs, produced concentrated undervalue signals in exactly the
            sectors that have historically been the most reliable — and which recovered as rates stabilized.
            The COVID crash of March 2020 produced undervalue signals across nearly the entire universe simultaneously.
            Both periods rewarded investors who acted on quality names with strong Weiss signals.
          </p>

          <h2>Acting on the Signal: Position Sizing and Patience</h2>
          <p>
            The Weiss method identifies entry points — it does not predict timing. A stock can remain undervalued
            by yield history for months or years if the macro environment that drove it there persists. Utilities
            stayed undervalued throughout 2022 and most of 2023 as rates kept rising. Income investors who bought
            at the first undervalue signal in early 2022 sat through further price declines before recovering.
            Those who added through the weakness ended up with better average cost bases.
          </p>
          <p>
            The practical implication: most experienced dividend investors treat Weiss undervalue signals as an
            invitation to initiate or add to positions — not a signal to deploy all available capital at once.
            A partial position when a stock first crosses into undervalue territory, followed by additions if the
            price continues lower, produces a better average yield-on-cost than a single all-in entry. Meanwhile,
            the dividend keeps arriving — quarterly or monthly — providing income regardless of what the price does.
          </p>
          <p>
            The right response to a list of undervalued stocks is not urgency but discipline: identify the names
            with the highest quality scores and most compelling yield histories, size positions according to your
            portfolio context, and hold for the mean reversion that the Weiss method has historically delivered.
          </p>

        </article>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-[#f4f4f5] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-[#f4f4f5] list-none select-none hover:text-[#6366f1] transition-colors">
                  {q}
                  <span className="ml-4 text-[#71717a] group-open:rotate-180 transition-transform text-base leading-none flex-shrink-0">↓</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-[#71717a] leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Related links */}
        <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
          <p className="text-xs text-[#71717a] uppercase tracking-wide mb-4">Related</p>
          <div className="flex flex-col gap-2">
            <Link href="/methodology" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
              → How DividendVisual calculates Weiss signals
            </Link>
            <Link href="/dividend-screener" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
              → Full screener — filter by sector, signal, and badge
            </Link>
            <Link href="/blog/geraldine-weiss-dividend-valuation-method" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
              → The Geraldine Weiss Method — Full Explanation
            </Link>
            <Link href="/blog/how-to-find-undervalued-dividend-stocks" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
              → How to Find Undervalued Dividend Stocks
            </Link>
            <Link href="/glossary#weiss-method" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
              → Glossary: Weiss Method definition
            </Link>
            <a
              href="https://www.awin1.com/cread.php?awinmid=81639&awinaffid=2899577"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
            >
              → Cross-check moat ratings &amp; fair value on Morningstar ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
