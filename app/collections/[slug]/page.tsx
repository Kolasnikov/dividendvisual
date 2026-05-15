import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'

type CollectionRow = Company & ComputedMetrics

const COLLECTION_META: Record<string, { title: string; description: string; metaDescription: string }> = {
  'dividend-kings': {
    title: 'Dividend Kings',
    description: '50+ consecutive years of dividend growth — the most reliable income stocks in the market.',
    metaDescription: 'Dividend Kings stocks list with Weiss valuation analysis. Companies with 50+ consecutive years of dividend growth, yield history, and quality scores.',
  },
  'dividend-aristocrats': {
    title: 'Dividend Aristocrats',
    description: 'S&P 500 companies with 25+ consecutive years of dividend growth and proven income track records.',
    metaDescription: 'Dividend Aristocrats list 2026 with yield analysis and Weiss valuation bands. S&P 500 stocks with 25+ years of consecutive dividend growth.',
  },
  'buffett-style': {
    title: 'Buffett-Style Compounders',
    description: 'Wide-moat dividend payers with durable competitive advantages and consistent income growth.',
    metaDescription: 'Buffett-style dividend stocks with wide economic moats. Weiss valuation analysis, quality scores, and dividend yield history for value investors.',
  },
  'utilities': {
    title: 'Utility Dividend Stocks',
    description: 'Regulated utility companies offering stable, predictable dividend income in any market environment.',
    metaDescription: 'Best utility dividend stocks ranked by yield, quality score, and Weiss valuation signal. Stable income from regulated electric and gas utilities.',
  },
  'reits': {
    title: 'REIT Dividend Stocks',
    description: 'Real estate investment trusts with high dividend yields and legally mandated income distributions.',
    metaDescription: 'Top REIT dividend stocks with historical yield analysis and Weiss valuation bands. High-income real estate investment trusts screened by quality score.',
  },
  'high-yield': {
    title: 'High Yield Dividend Stocks',
    description: 'Above-average dividend yields backed by established payout track records and FCF coverage.',
    metaDescription: 'High yield dividend stocks screened for sustainability. Weiss valuation signals, payout ratios, and FCF coverage for income investors.',
  },
  'low-payout-compounders': {
    title: 'Low Payout Compounders',
    description: 'Conservative payout ratios with maximum room for future dividend growth — compounding at its best.',
    metaDescription: 'Low payout ratio dividend stocks with the most room to grow. Dividend CAGR, quality scores, and Weiss valuation analysis for long-term compounders.',
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-1">{meta.title}</h1>
        <p className="text-[#71717a] max-w-2xl">{meta.description}</p>
        <p className="text-xs text-[#71717a] mt-2">{rows.length} stocks · Weiss valuation updated daily</p>
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
