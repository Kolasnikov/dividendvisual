import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Dividend Investing Glossary — Terms and Definitions | DividendVisual',
  description:
    'Plain-English definitions for dividend investing terms: dividend yield, payout ratio, CAGR, Weiss method, Dividend King, DRIP, yield on cost, and more.',
  alternates: {
    canonical: 'https://dividendvisual.com/glossary',
  },
  openGraph: {
    title: 'Dividend Investing Glossary | DividendVisual',
    description:
      'Plain-English definitions for dividend investing terms used on DividendVisual.',
    url: 'https://dividendvisual.com/glossary',
  },
}

interface Term {
  id: string
  term: string
  definition: string
  related?: { label: string; href: string }[]
}

const TERMS: Term[] = [
  {
    id: 'dividend-yield',
    term: 'Dividend Yield',
    definition:
      'The annual dividend per share divided by the current stock price, expressed as a percentage. A stock trading at $100 that pays $4 in annual dividends has a 4% dividend yield. Yield and price move in opposite directions: when the price falls, the yield rises, and vice versa. This inverse relationship is the foundation of the Weiss yield valuation method.',
    related: [
      { label: 'Weiss Method', href: '/glossary#weiss-method' },
      { label: 'Historical Yield Range', href: '/glossary#historical-yield-range' },
    ],
  },
  {
    id: 'weiss-method',
    term: 'Weiss Yield Valuation Method',
    definition:
      'A stock valuation framework developed by investment analyst Geraldine Weiss. Instead of using earnings multiples or discounted cash flow, the Weiss method values dividend stocks by comparing their current yield to their 10-year historical yield range. When a stock\'s current yield approaches the top of its historical range, it is considered Undervalued (the price is low relative to its income history). When the yield approaches the bottom of its range, it is Overvalued. The midpoint is Fair Value. DividendVisual applies the Weiss method to 150+ dividend stocks, updated daily.',
    related: [
      { label: 'Full methodology', href: '/methodology' },
      { label: 'Blog: Weiss Method Explained', href: '/blog/geraldine-weiss-dividend-valuation-method' },
    ],
  },
  {
    id: 'historical-yield-range',
    term: 'Historical Yield Range',
    definition:
      'The range of dividend yields a stock has traded at over its history — typically 10 years. DividendVisual calculates the minimum yield (when the stock was most expensive) and maximum yield (when it was cheapest) over the past decade, as well as the median yield (a proxy for fair value). The Weiss undervalued and overvalued thresholds are derived from this range: undervalued at the 90th percentile of historical yield, overvalued at the 10th percentile.',
    related: [
      { label: 'Weiss Method', href: '/glossary#weiss-method' },
      { label: 'Median Yield', href: '/glossary#median-yield' },
    ],
  },
  {
    id: 'median-yield',
    term: 'Median Yield',
    definition:
      'The midpoint of a stock\'s historical dividend yield distribution. Over a 10-year period, the median yield represents the level at which the stock has historically offered "fair" income relative to its price. When a stock\'s current yield is above the median, it is historically cheaper than average; below the median, historically more expensive. DividendVisual displays the median yield as the central reference point on the Weiss chart.',
  },
  {
    id: 'payout-ratio',
    term: 'Payout Ratio',
    definition:
      'The percentage of earnings paid out as dividends. A company earning $4 per share and paying $2 in dividends has a 50% payout ratio. Lower payout ratios indicate more room to sustain and grow the dividend if earnings decline; higher ratios indicate less buffer. DividendVisual\'s quality score treats payout ratios below 40% as excellent, 40–55% as good, 55–70% as moderate, and above 70% as elevated. For utilities and REITs, higher payout ratios are normal because earnings are more stable and predictable.',
    related: [
      { label: 'FCF Payout Ratio', href: '/glossary#fcf-payout' },
      { label: 'Quality Score', href: '/glossary#quality-score' },
    ],
  },
  {
    id: 'fcf-payout',
    term: 'FCF Payout Ratio',
    definition:
      'The dividend expressed as a percentage of free cash flow (operating cash flow minus capital expenditures). Many investors consider the FCF payout ratio more conservative than the earnings-based payout ratio because free cash flow measures actual cash available for distribution, not accounting earnings. A company with a 60% earnings payout ratio but a 90% FCF payout ratio may be more stretched than it appears. For capital-intensive companies (utilities, industrials), high FCF payout ratios are common because heavy capex depresses free cash flow — the earnings payout ratio is typically the more relevant measure for these.',
    related: [
      { label: 'Payout Ratio', href: '/glossary#payout-ratio' },
    ],
  },
  {
    id: 'dividend-cagr',
    term: 'Dividend CAGR',
    definition:
      'Compound Annual Growth Rate of the dividend — the annualized rate at which a company has grown its dividend payment over a given period. DividendVisual shows 5-year and 10-year dividend CAGR. A 5-year CAGR of 7% means the dividend has grown at 7% per year on average over the past five years. Higher CAGR indicates more aggressive income growth, but must be evaluated alongside payout ratio and FCF coverage to assess sustainability.',
    related: [
      { label: 'Yield on Cost', href: '/glossary#yield-on-cost' },
      { label: 'DRIP', href: '/glossary#drip' },
    ],
  },
  {
    id: 'dividend-king',
    term: 'Dividend King',
    definition:
      'A US company that has increased its dividend for 50 or more consecutive years. This is the most exclusive dividend distinction — fewer than 60 companies in the US qualify. Dividend Kings have maintained uninterrupted dividend growth through recessions, market crashes, inflation spikes, and sector disruptions. Examples include Coca-Cola (KO), Johnson & Johnson (JNJ), Procter & Gamble (PG), and Abbott Laboratories (ABT).',
    related: [
      { label: 'Dividend Kings collection', href: '/collections/dividend-kings' },
      { label: 'Dividend Aristocrat', href: '/glossary#dividend-aristocrat' },
    ],
  },
  {
    id: 'dividend-aristocrat',
    term: 'Dividend Aristocrat',
    definition:
      'An S&P 500 company that has increased its dividend for 25 or more consecutive years. There are approximately 65–70 Dividend Aristocrats at any given time. The distinction requires both a long dividend growth streak and S&P 500 membership — a smaller company with a 30-year streak does not qualify unless it\'s in the index. Dividend Aristocrats are the second-most-exclusive dividend category after Dividend Kings.',
    related: [
      { label: 'Dividend Aristocrats collection', href: '/collections/dividend-aristocrats' },
      { label: 'Dividend King', href: '/glossary#dividend-king' },
    ],
  },
  {
    id: 'drip',
    term: 'DRIP — Dividend Reinvestment Plan',
    definition:
      'A program that automatically reinvests cash dividends into additional shares of the same stock, rather than paying the cash to the investor. DRIP is one of the most powerful compounding mechanisms for income investors: reinvested dividends buy more shares, which generate more dividends, which buy more shares. Over 10–20 years, DRIP can substantially increase both the number of shares owned and the annual income generated from an original investment. Many brokerages offer DRIP automatically at no additional cost.',
    related: [
      { label: 'DRIP Calculator', href: '/drip-calculator' },
      { label: 'Yield on Cost', href: '/glossary#yield-on-cost' },
    ],
  },
  {
    id: 'yield-on-cost',
    term: 'Yield on Cost (YOC)',
    definition:
      'The annual dividend income from an investment expressed as a percentage of the original cost basis — not the current market value. If you invested $10,000 in a stock yielding 3% and the company has since doubled its dividend, your yield on cost is now 6% even if the market yield is still 3% (because the stock price also rose). Yield on cost illustrates the compounding power of dividend growth investing: a 4% yield that grows at 7% annually becomes an 8% yield on cost in 10 years.',
    related: [
      { label: 'DRIP Calculator', href: '/drip-calculator' },
      { label: 'Dividend CAGR', href: '/glossary#dividend-cagr' },
    ],
  },
  {
    id: 'quality-score',
    term: 'Quality Score',
    definition:
      'DividendVisual\'s 0–100 score that measures dividend reliability and sustainability. It is built from five factors: payout ratio (25 pts), dividend growth streak (25 pts), 5-year dividend CAGR (20 pts), current yield vs. historical range (15 pts), and FCF payout ratio (15 pts). Scores of 80+ are rated Excellent, 60–79 Good, 40–59 Average, and below 40 Risky. The quality score provides context for the Weiss signal: an undervalued signal paired with a high quality score is a stronger setup than an undervalued signal with a low quality score.',
    related: [
      { label: 'Full methodology', href: '/methodology' },
      { label: 'Payout Ratio', href: '/glossary#payout-ratio' },
    ],
  },
  {
    id: 'net-lease',
    term: 'Net Lease',
    definition:
      'A commercial real estate lease structure where the tenant pays not only rent but also some or all of property taxes, insurance, and maintenance costs. Net leases (particularly "triple net" or NNN leases, where the tenant covers all three) create highly predictable income for the landlord because operating costs are passed through. Net lease REITs — like Realty Income (O) and National Retail Properties (NNN) — are popular with dividend investors because of this income predictability.',
    related: [
      { label: 'REIT dividend stocks', href: '/sector/real-estate' },
    ],
  },
  {
    id: 'ffo',
    term: 'FFO — Funds From Operations',
    definition:
      'A non-GAAP earnings measure used primarily for REITs. FFO adds depreciation back to GAAP net income because real estate depreciation — a non-cash accounting charge — significantly understates REIT earnings. Real estate assets often appreciate in value over time, but GAAP requires depreciating them, making REIT earnings appear artificially low. FFO (and its more conservative variant AFFO, which also subtracts recurring capital expenditures) is the standard measure for evaluating REIT dividend coverage and valuation.',
    related: [
      { label: 'Payout Ratio', href: '/glossary#payout-ratio' },
      { label: 'REIT dividend stocks', href: '/sector/real-estate' },
    ],
  },
  {
    id: 'undervalued-price',
    term: 'Undervalued Price',
    definition:
      'On DividendVisual, the stock price at which a company\'s dividend yield equals its 10-year historical yield maximum (top decile). When the current price is at or below the undervalued price, the stock is in historically cheap territory by the Weiss method — the current yield is near the highest it has ever been relative to the company\'s income history. This is displayed as the lower green band on the Weiss chart.',
    related: [
      { label: 'Weiss Method', href: '/glossary#weiss-method' },
      { label: 'Overvalued Price', href: '/glossary#overvalued-price' },
    ],
  },
  {
    id: 'overvalued-price',
    term: 'Overvalued Price',
    definition:
      'On DividendVisual, the stock price at which a company\'s dividend yield equals its 10-year historical yield minimum (bottom decile). When the current price is at or above the overvalued price, the stock is in historically expensive territory — the yield is near its all-time low, meaning investors are paying a high price relative to the income the stock generates. This is displayed as the upper red band on the Weiss chart.',
    related: [
      { label: 'Weiss Method', href: '/glossary#weiss-method' },
      { label: 'Undervalued Price', href: '/glossary#undervalued-price' },
    ],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'Dividend Investing Glossary',
  url: 'https://dividendvisual.com/glossary',
  description: 'Plain-English definitions for dividend investing terms used on DividendVisual.',
  hasDefinedTerm: TERMS.map((t) => ({
    '@type': 'DefinedTerm',
    name: t.term,
    description: t.definition,
    url: `https://dividendvisual.com/glossary#${t.id}`,
    inDefinedTermSet: 'https://dividendvisual.com/glossary',
  })),
}

const ALPHABET = [...new Set(TERMS.map((t) => t.term[0]))].sort()

export default function GlossaryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Glossary' },
      ]} />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-3">Dividend Investing Glossary</h1>
        <p className="text-[#71717a] text-sm leading-relaxed max-w-xl">
          Plain-English definitions for dividend investing terms used on DividendVisual — yield, payout ratio, CAGR, Weiss method, DRIP, and more.
        </p>

        {/* Jump links */}
        <div className="flex flex-wrap gap-2 mt-6">
          {ALPHABET.map((letter) => (
            <a
              key={letter}
              href={`#${TERMS.find((t) => t.term[0] === letter)!.id}`}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-[#1e1e2e] text-xs font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      </header>

      <dl className="space-y-10">
        {TERMS.map((term) => (
          <div key={term.id} id={term.id} className="scroll-mt-20">
            <dt className="text-lg font-semibold text-[#f4f4f5] mb-2 flex items-center gap-2">
              <a
                href={`#${term.id}`}
                className="text-[#71717a] hover:text-[#6366f1] text-sm font-mono select-none transition-colors"
                aria-label={`Link to ${term.term}`}
              >
                #
              </a>
              {term.term}
            </dt>
            <dd className="text-[#a1a1aa] text-sm leading-relaxed pl-5 border-l border-[#1e1e2e]">
              <p>{term.definition}</p>
              {term.related && term.related.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {term.related.map((r) => (
                    <Link
                      key={r.href}
                      href={r.href}
                      className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors"
                    >
                      → {r.label}
                    </Link>
                  ))}
                </div>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 pt-8 border-t border-[#1e1e2e]">
        <p className="text-xs text-[#71717a] uppercase tracking-wide mb-4">Keep learning</p>
        <div className="flex flex-col gap-3">
          <Link href="/methodology" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
            → How DividendVisual calculates Weiss signals and quality scores
          </Link>
          <Link href="/blog/geraldine-weiss-dividend-valuation-method" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
            → The Geraldine Weiss Method: Full Explanation
          </Link>
          <Link href="/drip-calculator" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
            → DRIP Calculator: Project Your Income Growth
          </Link>
          <Link href="/watchlist" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
            → Screener: Apply the Weiss Method to 150+ Dividend Stocks
          </Link>
        </div>
      </div>
    </div>
  )
}
