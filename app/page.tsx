import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, BarChart3 } from 'lucide-react'
import { TickerSearch } from '@/components/ui/TickerSearch'
import { CollectionCard } from '@/components/cards/CollectionCard'
import { EmailCapture } from '@/components/ui/EmailCapture'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'

export const metadata: Metadata = {
  title: 'DividendVisual — Find Undervalued Dividend Stocks | Geraldine Weiss Method',
  description: 'Geraldine Weiss dividend yield valuation for 60+ stocks. See if KO, JNJ, PG and other dividend kings are historically cheap or expensive. Free dividend analysis tool for income investors.',
  openGraph: {
    title: 'DividendVisual — Find Undervalued Dividend Stocks',
    description: 'Geraldine Weiss dividend yield valuation for 60+ stocks. See if dividend kings and aristocrats are historically cheap or expensive based on 10 years of yield data.',
    url: 'https://dividendvisual.com',
  },
}

const FAQ = [
  {
    q: 'What is the Geraldine Weiss dividend valuation method?',
    a: 'Geraldine Weiss was a pioneering investment analyst who argued that a stock\'s intrinsic value is best measured by its dividend yield history. When a stock\'s yield reaches its historical high (stock price is low), the stock is undervalued. When yield is at a historical low (price is high), the stock is overvalued. DividendVisual visualizes these bands for each stock using 10 years of data.',
  },
  {
    q: 'What does "undervalued" mean for a dividend stock?',
    a: 'A stock is flagged as undervalued when its current dividend yield is near the top of its 10-year historical range — meaning the stock price is historically low relative to the dividend it pays. This is a buy signal in the Weiss method, not a guarantee of returns.',
  },
  {
    q: 'What are Dividend Kings and Dividend Aristocrats?',
    a: 'Dividend Kings are companies that have increased their annual dividend for 50 or more consecutive years — the gold standard of income investing. Dividend Aristocrats are S&P 500 companies with 25+ consecutive years of dividend growth. Both groups are screened for the highest dividend reliability.',
  },
  {
    q: 'How is the quality score calculated?',
    a: 'The quality score (0–100) is a composite of five factors: dividend streak (years of uninterrupted payments), payout ratio (how much of earnings is paid as dividend), free cash flow coverage, 5-year dividend CAGR, and Weiss signal strength. Higher scores indicate more reliable and sustainable dividend stocks.',
  },
  {
    q: 'How often is the data updated?',
    a: 'Price and dividend data is refreshed daily. Valuation bands, quality scores, and metrics are recalculated after each data update. Individual pages cache data for up to 1 hour.',
  },
  {
    q: 'Is DividendVisual financial advice?',
    a: 'No. DividendVisual is an informational tool for educational and research purposes only. Nothing on this site constitutes financial, investment, or tax advice. Always consult a qualified financial advisor before making investment decisions.',
  },
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

type WatchlistRow = Company & ComputedMetrics

async function getTopPicks(): Promise<WatchlistRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/watchlist?sort=quality&order=desc`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const all: WatchlistRow[] = await res.json()
    return all.filter((r) => r.weissSignal === 'undervalued').slice(0, 4)
  } catch {
    return []
  }
}

const COLLECTIONS = [
  {
    slug: 'dividend-kings',
    title: 'Dividend Kings',
    description: '50+ consecutive years of dividend growth — the most reliable income stocks.',
    count: 15,
    accent: '#f59e0b',
  },
  {
    slug: 'dividend-aristocrats',
    title: 'Dividend Aristocrats',
    description: 'S&P 500 companies with 25+ years of consecutive dividend growth.',
    count: 27,
    accent: '#6366f1',
  },
  {
    slug: 'buffett-style',
    title: 'Buffett-Style',
    description: 'Wide-moat compounders with durable competitive advantages.',
    count: 7,
    accent: '#22c55e',
  },
  {
    slug: 'high-yield',
    title: 'High Yield',
    description: 'Above-average yields with established dividend track records.',
    count: 6,
    accent: '#ef4444',
  },
  {
    slug: 'utilities',
    title: 'Utilities',
    description: 'Regulated utility companies providing stable, predictable income.',
    count: 7,
    accent: '#06b6d4',
  },
  {
    slug: 'low-payout-compounders',
    title: 'Low Payout Compounders',
    description: 'Conservative payout ratios with maximum room for future growth.',
    count: 7,
    accent: '#8b5cf6',
  },
]

const FEATURES = [
  {
    Icon: TrendingUp,
    title: 'Weiss Valuation Bands',
    description:
      'See whether a stock is historically cheap or expensive based on its own dividend yield history.',
  },
  {
    Icon: Shield,
    title: 'Dividend Quality Score',
    description:
      'A composite 0–100 score built from payout ratio, streak, growth rate, and FCF coverage.',
  },
  {
    Icon: BarChart3,
    title: 'Income Compounder',
    description:
      'Project your future dividend income with DRIP reinvestment over any time horizon.',
  },
]

function pct(v: number | null): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(2)}%`
}

export default async function HomePage() {
  const topPicks = await getTopPicks()

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center py-24 px-4 text-center overflow-hidden">
        {/* Subtle radial gradient */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, #6366f120 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold text-[#f4f4f5] leading-tight mb-6">
            Find undervalued dividend stocks,{' '}
            <span className="text-[#6366f1]">visually.</span>
          </h1>

          <p className="text-lg text-[#71717a] max-w-xl mx-auto mb-4">
            The <strong className="text-[#a1a1aa] font-medium">Geraldine Weiss dividend yield method</strong> — modernized.
            See if KO, JNJ, PG and 60+ dividend stocks are trading at historically cheap or expensive prices.
          </p>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 text-xs text-[#52525b] mb-10">
            <span><span className="text-[#f4f4f5] font-semibold">62</span> stocks tracked</span>
            <span className="w-px h-3 bg-[#2e2e3e]" />
            <span><span className="text-[#f4f4f5] font-semibold">10</span> years of yield data</span>
            <span className="w-px h-3 bg-[#2e2e3e]" />
            <span><span className="text-[#f4f4f5] font-semibold">Free</span> dividend analysis</span>
          </div>

          <div className="max-w-xl mx-auto mb-6">
            <TickerSearch size="lg" placeholder="Search any ticker — KO, JNJ, PG..." />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#71717a]">
            <span>Popular:</span>
            {['KO', 'JNJ', 'PG', 'O', 'MO'].map((sym) => (
              <Link
                key={sym}
                href={`/ticker/${sym}`}
                className="px-2 py-0.5 rounded-md bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5] transition-colors font-mono text-xs"
              >
                {sym}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6"
            >
              <div className="w-9 h-9 rounded-lg bg-[#6366f1]/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#6366f1]" />
              </div>
              <h3 className="font-semibold text-[#f4f4f5] mb-2">{title}</h3>
              <p className="text-sm text-[#71717a] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#f4f4f5]">Curated Collections</h2>
          <Link
            href="/watchlist"
            className="flex items-center gap-1 text-sm text-[#71717a] hover:text-[#f4f4f5] transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLLECTIONS.map((col) => (
            <CollectionCard key={col.slug} {...col} />
          ))}
        </div>
      </section>

      {/* Top Picks — only shown if data is available */}
      {topPicks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[#f4f4f5] mb-6">
            Currently Undervalued
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPicks.map((row) => (
              <Link
                key={row.symbol}
                href={`/ticker/${row.symbol}`}
                className="bg-[#111118] border border-[#22c55e]/30 rounded-xl p-4 hover:border-[#22c55e]/60 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono font-semibold text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors">
                      {row.symbol}
                    </div>
                    <div className="text-xs text-[#71717a] mt-0.5 line-clamp-1">{row.name}</div>
                  </div>
                  <SignalBadge signal="undervalued" size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[#71717a]">Yield</div>
                    <div className="text-[#22c55e] font-semibold">{pct(row.currentYield)}</div>
                  </div>
                  <div>
                    <div className="text-[#71717a]">Quality</div>
                    <div className="text-[#6366f1] font-semibold">{row.qualityScore}/100</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Email capture banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <EmailCapture />
      </div>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-[#f4f4f5] list-none select-none hover:text-[#6366f1] transition-colors">
                {q}
                <span className="ml-4 text-[#71717a] group-open:rotate-180 transition-transform text-base leading-none">↓</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-[#71717a] leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#71717a]">
            © 2026 DividendVisual.com — For informational purposes only. Not financial advice.
          </div>
          <div className="flex gap-4 text-sm text-[#71717a]">
            <Link href="/watchlist" className="hover:text-[#f4f4f5] transition-colors">
              Watchlist
            </Link>
            <Link href="/collections/dividend-kings" className="hover:text-[#f4f4f5] transition-colors">
              Collections
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
