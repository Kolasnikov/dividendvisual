import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

type CollectionRow = Company & ComputedMetrics

const COLLECTION_META: Record<string, { title: string; description: string; metaDescription: string; editorial: string[] }> = {
  'dividend-kings': {
    title: 'Dividend Kings',
    description: '50+ consecutive years of dividend growth — the most reliable income stocks in the market.',
    metaDescription: 'Dividend Kings stocks list with Weiss valuation analysis. Companies with 50+ consecutive years of dividend growth, yield history, and quality scores.',
    editorial: [
      'Of the roughly 4,000 publicly traded US companies, fewer than 60 have raised their dividend every single year for half a century. These are businesses that paid and grew through stagflation, the dot-com bust, the 2008 financial crisis, and COVID without ever missing a raise. The 50-year threshold filters brutally — it eliminates every company that had a bad enough decade to interrupt the streak.',
      'What the streak proves is specific: these businesses generate more cash than they need, in almost any economic environment, and management has the discipline to return it reliably. The dividend is not maintained out of pride. It keeps growing because the cash keeps coming — from brand moats, regulated positions, or essential products that customers buy regardless of what the economy is doing.',
      'For the Weiss yield method, Dividend Kings are ideal candidates. Decades of uninterrupted dividend history produce a tight, reliable yield range shaped by real market cycles. When a King\'s yield approaches its 10-year high, the signal carries more weight than it would for a company with only a few years of data to anchor it.',
    ],
  },
  'dividend-aristocrats': {
    title: 'Dividend Aristocrats',
    description: 'S&P 500 companies with 25+ consecutive years of dividend growth and proven income track records.',
    metaDescription: 'Dividend Aristocrats list 2026 with yield analysis and Weiss valuation bands. S&P 500 stocks with 25+ years of consecutive dividend growth.',
    editorial: [
      'To qualify as a Dividend Aristocrat, a company must be in the S&P 500 and have raised its annual dividend for at least 25 consecutive years. The S&P 500 requirement adds a market cap and liquidity filter the Kings group lacks — every Aristocrat is a large, institutionally-held business with deep trading volume.',
      'A 25-year streak spans at minimum two major recessions. Companies that kept raising dividends through 2001 and 2009 demonstrated that their business models generate surplus cash even when the economy contracts sharply. That\'s a higher bar than it sounds — most companies manage dividends reactively; Aristocrats maintain them structurally.',
      'Sector representation is broader here than in the Kings group. Healthcare, industrials, financials, and technology-adjacent names appear — making the Aristocrats a better starting universe for investors who want dividend reliability alongside genuine sector diversification.',
    ],
  },
  'buffett-style': {
    title: 'Buffett-Style Compounders',
    description: 'Wide-moat dividend payers with durable competitive advantages and consistent income growth.',
    metaDescription: 'Buffett-style dividend stocks with wide economic moats. Weiss valuation analysis, quality scores, and dividend yield history for value investors.',
    editorial: [
      'Warren Buffett\'s investment philosophy and Geraldine Weiss\'s dividend yield method share a foundational premise: the best investments are businesses with durable competitive advantages bought at attractive prices. Where they differ is in the valuation tool — Buffett emphasizes qualitative moat assessment, Weiss uses 10-year yield history as a quantitative anchor.',
      'The stocks in this collection are businesses with structural advantages that are difficult to replicate: global brand recognition, proprietary distribution networks, pricing power that has held up across decades of competition. These are not just good businesses — they\'re businesses whose advantages appear to compound over time rather than erode.',
      'Combining both frameworks is more powerful than either alone. The Weiss signal tells you when the price is historically attractive; the moat assessment tells you whether the business deserves to be held through a full cycle. Both questions need a yes before a position makes sense.',
    ],
  },
  'utilities': {
    title: 'Utility Dividend Stocks',
    description: 'Regulated utility companies offering stable, predictable dividend income in any market environment.',
    metaDescription: 'Best utility dividend stocks ranked by yield, quality score, and Weiss valuation signal. Stable income from regulated electric and gas utilities.',
    editorial: [
      'Regulated electric and gas utilities are among the most predictable dividend payers in the equity market — by design. Their rates, capital plans, and allowed returns are set by state public utility commissions through a formal rate-case process. The result is a business that earns a contracted margin on a known asset base, with limited ability to greatly overearn or dramatically underperform.',
      'That predictability makes utilities excellent Weiss candidates. Dividends grow steadily (typically 3–6% annually), the yield range is stable, and the undervalue/overvalue thresholds are relatively tight. When a utility\'s yield approaches its 10-year high, it\'s almost always because interest rates have risen and pulled prices down — creating a genuine entry opportunity, not a business problem.',
      'The key risk to understand: utilities are interest-rate sensitive. Rising rates increase their cost of capital and make dividend yields less attractive relative to bonds, pushing prices down mechanically. This creates Weiss undervalue signals that are often driven by macro rate pressure rather than company-specific issues — which is precisely when they tend to be the best opportunities.',
    ],
  },
  'reits': {
    title: 'REIT Dividend Stocks',
    description: 'Real estate investment trusts with high dividend yields and legally mandated income distributions.',
    metaDescription: 'Top REIT dividend stocks with historical yield analysis and Weiss valuation bands. High-income real estate investment trusts screened by quality score.',
    editorial: [
      'Real estate investment trusts are legally required to distribute at least 90% of their taxable income to shareholders. This structure produces some of the highest dividend yields in the equity market — and also means that standard payout ratio calculations are not meaningful for REITs. The correct measure is FFO payout (funds from operations), which adds back depreciation and adjusts for property gains and losses.',
      'Within the REIT universe, business quality varies sharply. Net lease REITs collect contractually fixed rents from credit-rated tenants under long-term leases — making cash flows unusually predictable. Cell tower REITs benefit from the essential infrastructure nature of wireless connectivity. Monthly dividend payers like Realty Income have built a track record specifically around income reliability. These are meaningfully different from retail or office REITs exposed to foot traffic and remote work trends.',
      'Weiss valuation applies to REITs with long, consistent dividend histories, but yield ranges tend to be structurally higher than non-REIT sectors. Use each REIT\'s own historical yield range as the benchmark — not a cross-sector comparison.',
    ],
  },
  'high-yield': {
    title: 'High Yield Dividend Stocks',
    description: 'Above-average dividend yields backed by established payout track records and FCF coverage.',
    metaDescription: 'High yield dividend stocks screened for sustainability. Weiss valuation signals, payout ratios, and FCF coverage for income investors.',
    editorial: [
      'A high dividend yield in a market where the average blue chip pays 2–3% is either a genuine opportunity or a warning that the payout is at risk. The difference matters: if the company cuts, you lose the income you were counting on and typically a significant portion of principal at the same time. High yield requires more scrutiny, not less.',
      'The stocks in this collection yield above average and have established payout histories — each has maintained its dividend through at least one major market downturn. That history provides real (if incomplete) evidence of sustainability. Past performance is not sufficient due diligence: always check the current FCF payout ratio and debt load before sizing a position.',
      'The Weiss signal is especially valuable in the high-yield universe. A stock whose yield is near its 10-year maximum is in one of two situations: the price has been pushed down by market fear that exceeds the actual business risk (a buying opportunity), or the market is correctly pricing in a future cut (a trap). The quality score and payout data on each stock\'s page help you distinguish between the two.',
    ],
  },
  'low-payout-compounders': {
    title: 'Low Payout Compounders',
    description: 'Conservative payout ratios with maximum room for future dividend growth — compounding at its best.',
    metaDescription: 'Low payout ratio dividend stocks with the most room to grow. Dividend CAGR, quality scores, and Weiss valuation analysis for long-term compounders.',
    editorial: [
      'A 1.5% yield growing at 12% annually generates more income per dollar invested than a static 5% yield — after about a decade. The math of compounding rewards patience: a $1,000 investment at 1.5% growing 12% annually generates $82/year after 15 years. The static 5% generates $50 forever. The compounder wins decisively over a long enough horizon.',
      'Low payout ratio companies have a structural advantage: they can raise dividends faster than earnings grow without straining the balance sheet. A business paying 20% of earnings has room to grow the dividend at 2–3x the rate of earnings growth. A business already at 80% payout has almost no such flexibility — every raise requires a proportional earnings increase first.',
      'Home Depot, Lowe\'s, and Texas Instruments started with modest yields and have built long enough track records to produce reliable Weiss signals. These are not traditional income stocks — they\'re growth businesses with dividend discipline. For investors with a 15–20 year horizon, they often deliver the best long-term income outcomes of any category in the dividend universe.',
    ],
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCollection(slug: string): Promise<CollectionRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/collections/${slug}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = COLLECTION_META[slug]
  if (!meta) return { title: slug }
  return {
    title: meta.title,
    description: meta.metaDescription,
    openGraph: {
      title: `${meta.title} | DividendVisual`,
      description: meta.metaDescription,
      url: `https://dividendvisual.com/collections/${slug}`,
    },
  }
}

function pct(v: number | null, decimals = 2): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(decimals)}%`
}

function CollectionCard({ row }: { row: CollectionRow }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#6366f1]/40 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/ticker/${row.symbol}`}
            className="font-mono font-semibold text-[#f4f4f5] hover:text-[#6366f1] transition-colors"
          >
            {row.symbol}
          </Link>
          <div className="text-xs text-[#71717a] mt-0.5 line-clamp-1">{row.name}</div>
        </div>
        <SignalBadge signal={row.weissSignal} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
        <div>
          <div className="text-[#71717a]">Price</div>
          <div className="text-[#f4f4f5] font-medium">${row.currentPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[#71717a]">Yield</div>
          <div className="text-[#f4f4f5] font-medium">{pct(row.currentYield)}</div>
        </div>
        <div>
          <div className="text-[#71717a]">Quality</div>
          <div className={`font-semibold ${
            row.qualityScore >= 80 ? 'text-[#22c55e]' :
            row.qualityScore >= 60 ? 'text-[#6366f1]' :
            row.qualityScore >= 40 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
          }`}>
            {row.qualityScore}/100
          </div>
        </div>
        <div>
          <div className="text-[#71717a]">CAGR 5Y</div>
          <div className="text-[#f4f4f5] font-medium">{pct(row.dividendCagr5y, 1)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {row.isDividendKing && <DividendBadge type="king" />}
          {row.isDividendAristocrat && !row.isDividendKing && <DividendBadge type="aristocrat" />}
        </div>
        <Link
          href={`/analysis/${row.symbol.toLowerCase()}`}
          className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Analysis →
        </Link>
      </div>
    </div>
  )
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params
  const rows = await getCollection(slug)
  const meta = COLLECTION_META[slug] ?? { title: slug, description: '' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Collections', href: '/watchlist' },
        { label: meta.title },
      ]} />
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-2">{meta.title}</h1>
        <p className="text-xs text-[#52525b] mb-6">{rows.length} stocks · Weiss valuation updated daily</p>
        {meta.editorial.length > 0 && (
          <div className="max-w-3xl space-y-3 border-l-2 border-[#6366f1]/20 pl-5">
            {meta.editorial.map((para, i) => (
              <p key={i} className="text-sm text-[#71717a] leading-relaxed">{para}</p>
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-[#71717a]">
          No data available yet. Run the ingestion scripts first.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rows.map((row) => (
            <CollectionCard key={row.symbol} row={row} />
          ))}
        </div>
      )}
    </div>
  )
}
