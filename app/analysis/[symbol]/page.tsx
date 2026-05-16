import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { TickerResponse, Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { TrackPageView } from '@/components/analytics/TrackPageView'

const TICKERS = [
  // Original universe
  'KO', 'PEP', 'JNJ', 'PG', 'MMM', 'MCD', 'WMT', 'HD', 'LOW',
  'ABT', 'MDT', 'ABBV', 'XOM', 'CVX', 'T', 'VZ', 'SO', 'DUK',
  'NEE', 'O', 'FRT', 'GPC', 'CLX', 'SYY', 'TGT', 'MO', 'PM',
  'MAIN', 'BEN', 'VFC',
  'KMB', 'CL', 'HRL', 'MKC', 'HSY', 'CPB',
  'BMY', 'PFE', 'AMGN', 'BDX', 'SYK',
  'EMR', 'ITW', 'CTAS', 'GD', 'CAT', 'PH',
  'USB', 'AFL', 'TROW', 'CB', 'AMP',
  'NNN', 'AMT', 'ADC',
  'AWK', 'WEC', 'AEP', 'D',
  'TXN', 'MSFT', 'ECL', 'ATO',
  // Dividend Kings (new)
  'AWR', 'DOV', 'CINF', 'NDSN', 'LANC', 'GWW', 'PPG', 'RPM', 'MSA', 'NUE', 'CBSH',
  // Dividend Aristocrats (new)
  'SHW', 'ED', 'ADP', 'SPGI', 'CHD', 'ROP', 'AOS', 'EXPD', 'PAYX', 'BRO',
  // Consumer
  'GIS', 'SJM', 'DEO', 'TJX', 'SBUX', 'FAST',
  // Healthcare
  'UNH', 'CVS', 'DGX', 'MCK',
  // Financials
  'BLK', 'ICE', 'CME', 'MMC', 'PNC', 'JPM', 'MTB', 'FITB', 'ALL', 'TRV', 'HBAN',
  // Industrials
  'HON', 'ETN', 'LMT', 'NOC', 'UPS', 'UNP', 'NSC', 'CSX', 'ROK', 'AME',
  // Technology
  'CSCO', 'QCOM', 'AVGO', 'IBM', 'AAPL', 'ACN', 'AMAT',
  // Payments / Fintech
  'V', 'MA', 'AXP', 'SCHW', 'MCO',
  // Consumer Discretionary
  'COST', 'NKE', 'DE',
  // Healthcare / Pharma
  'MRK',
  // Energy
  'OKE', 'PSX', 'VLO', 'EPD',
  // Utilities (new)
  'ETR', 'CMS', 'XEL', 'LNT', 'SRE', 'PNW', 'OGE',
  // REITs (new)
  'PSA', 'DLR', 'PLD', 'STAG', 'EXR', 'MAA', 'OHI', 'IRM', 'ESS',
  // Environmental
  'WM', 'RSG',
]

interface PageProps {
  params: Promise<{ symbol: string }>
}

async function getTickerData(symbol: string): Promise<TickerResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/ticker/${symbol.toUpperCase()}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  return TICKERS.map((symbol) => ({ symbol: symbol.toLowerCase() }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params
  const data = await getTickerData(symbol)
  if (!data) return { title: symbol.toUpperCase() }
  const { company, metrics } = data
  const signalLabel = metrics.weissSignal === 'undervalued' ? 'undervalued'
    : metrics.weissSignal === 'overvalued' ? 'overvalued' : 'fairly valued'
  const yieldPct = (metrics.currentYield * 100).toFixed(2)
  const title = `${company.symbol} Dividend Analysis — Is ${company.name} Undervalued?`
  const description = `${company.name} (${company.symbol}) dividend deep-dive. Current yield ${yieldPct}%, historically ${signalLabel}. Quality score ${metrics.qualityScore}/100. 10-year yield history, payout ratio, dividend CAGR, and Weiss valuation breakdown.`
  return {
    title,
    description,
    alternates: {
      canonical: `https://dividendvisual.com/analysis/${symbol.toLowerCase()}`,
    },
    openGraph: {
      title: `${title} | DividendVisual`,
      description,
      url: `https://dividendvisual.com/analysis/${symbol.toLowerCase()}`,
      type: 'article',
    },
  }
}

// ─── Content generation helpers ──────────────────────────────────────────────

function pct(v: number | null, d = 2) {
  if (v == null) return null
  return `${(v * 100).toFixed(d)}%`
}

function signalSentence(metrics: ComputedMetrics, company: Company): string {
  const yield_ = pct(metrics.currentYield)!
  const max = pct(metrics.historicalMaxYield)!
  const min = pct(metrics.historicalMinYield)!
  const median = pct(metrics.medianYield)!

  if (metrics.weissSignal === 'undervalued') {
    const proximity = metrics.historicalMaxYield
      ? Math.round((metrics.currentYield / metrics.historicalMaxYield) * 100)
      : null
    return `At ${yield_}, ${company.symbol}'s current yield is near the top of its 10-year historical range (${min}–${max}), reaching ${proximity ?? '~'}% of its historical maximum. This places the stock firmly in historically undervalued territory by the Weiss method — the kind of entry point that has preceded strong long-term returns for income investors.`
  }

  if (metrics.weissSignal === 'overvalued') {
    return `At ${yield_}, ${company.symbol}'s current yield is near the bottom of its 10-year historical range (${min}–${max}). By the Weiss method this indicates that the market is pricing the stock for optimism — investors are paying a premium relative to the income the stock generates. The historical median yield is ${median}, suggesting the stock is trading well above fair value.`
  }

  return `At ${yield_}, ${company.symbol}'s current yield sits near the midpoint of its 10-year historical range (${min}–${max}), with a historical median of ${median}. The Weiss model rates this as fair value — neither a compelling entry nor a reason to sell an existing position.`
}

function qualitySentence(metrics: ComputedMetrics, company: Company): string {
  const score = metrics.qualityScore
  const payout = metrics.payoutRatio != null && metrics.payoutRatio <= 2.0
    ? `a ${(metrics.payoutRatio * 100).toFixed(0)}% payout ratio`
    : null
  const fcf = metrics.fcfPayout != null && metrics.fcfPayout <= 2.0
    ? `${(metrics.fcfPayout * 100).toFixed(0)}% of free cash flow`
    : null
  const cagr = metrics.dividendCagr5y != null
    ? `growing at ${(metrics.dividendCagr5y * 100).toFixed(1)}% annually over the past 5 years`
    : null

  let base = `${company.name} scores ${score}/100 on DividendVisual's quality scale`
  if (score >= 80) base += ` — an Excellent rating, placing it among the most reliable dividend payers in our universe.`
  else if (score >= 65) base += ` — a Good rating, indicating a well-covered, growing dividend with manageable risk.`
  else if (score >= 50) base += ` — an Average rating. The dividend is likely safe but warrants closer scrutiny on payout coverage.`
  else base += ` — a Below Average rating. Investors should carefully review dividend sustainability before acting on the Weiss signal.`

  const details = [payout, fcf && `the dividend consumes ${fcf}`, cagr].filter(Boolean)
  if (details.length > 0) base += ` Key metrics: ${details.join(', ')}.`
  return base
}

function streakSentence(company: Company, metrics: ComputedMetrics): string {
  const streak = company.yearsIncreasingDividends
  const noCut = metrics.yearsNoCut

  if (streak >= 50) return `${company.name} has raised its dividend for ${streak} consecutive years — qualifying it as a Dividend King, the most elite category of income stocks.`
  if (streak >= 25) return `With ${streak} consecutive years of dividend growth, ${company.name} qualifies as a Dividend Aristocrat — a distinction held by fewer than 2% of S&P 500 companies.`
  if (streak >= 10) return `${company.name} has grown its dividend for ${streak} consecutive years, demonstrating a decade of reliable income growth.`
  if (noCut && noCut >= 5) return `${company.name} has maintained its dividend without a cut for ${noCut} years, establishing a meaningful income track record.`
  return `${company.name} has an established dividend history, though investors should monitor the payout trend closely.`
}

function dripSentence(metrics: ComputedMetrics): string | null {
  if (!metrics.currentYield || !metrics.currentPrice) return null
  const investment = 10000
  const shares = investment / metrics.currentPrice
  const annualDiv = shares * (metrics.currentPrice * metrics.currentYield)
  const cagr = metrics.dividendCagr5y ?? 0.05
  // Simple 10-year DRIP projection
  let s = shares
  let divPerShare = metrics.currentPrice * metrics.currentYield
  for (let i = 0; i < 10; i++) {
    divPerShare *= (1 + cagr)
    const income = s * divPerShare
    s += income / metrics.currentPrice
  }
  const year10Income = Math.round(s * divPerShare)
  const yoc = ((s * divPerShare) / investment * 100).toFixed(1)
  return `A $10,000 investment at the current price and yield would generate approximately $${Math.round(annualDiv)} in year-one income. With dividends reinvested and a ${(cagr * 100).toFixed(1)}% annual growth rate maintained, that same investment would produce roughly $${year10Income.toLocaleString()} per year in income by year 10 — a yield on cost of ${yoc}%.`
}

function riskSentence(metrics: ComputedMetrics, company: Company): string {
  const risks: string[] = []

  if (metrics.payoutRatio != null && metrics.payoutRatio > 0.75 && metrics.payoutRatio <= 2.0) {
    risks.push(`an elevated payout ratio of ${(metrics.payoutRatio * 100).toFixed(0)}%, which leaves limited buffer if earnings decline`)
  }
  if (metrics.fcfPayout != null && metrics.fcfPayout > 0.85 && metrics.fcfPayout <= 2.0) {
    risks.push(`FCF payout coverage of ${(metrics.fcfPayout * 100).toFixed(0)}%, meaning the dividend consumes the majority of free cash flow`)
  }
  if (metrics.dividendCagr5y != null && metrics.dividendCagr5y < 0.03) {
    risks.push(`a slow 5-year dividend CAGR of ${(metrics.dividendCagr5y * 100).toFixed(1)}%, suggesting limited near-term income growth`)
  }
  if (metrics.qualityScore < 50) {
    risks.push(`an overall quality score below 50, warranting additional due diligence on dividend sustainability`)
  }

  if (risks.length === 0) return `${company.name}'s dividend appears well-supported by current earnings and cash flow. No material red flags are flagged by the quality model, though macro risks (rising rates, sector disruption) always apply.`

  return `Investors should be aware of the following factors: ${risks.join('; ')}. These do not necessarily signal an imminent dividend cut, but they reduce the margin of safety relative to higher-scoring peers.`
}

function buildJsonLd(company: Company, metrics: ComputedMetrics, symbol: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${company.symbol} Dividend Analysis — Is ${company.name} Undervalued?`,
    description: `In-depth dividend analysis for ${company.name} (${company.symbol}). Weiss valuation, quality score, yield history and income projection.`,
    url: `https://dividendvisual.com/analysis/${symbol.toLowerCase()}`,
    dateModified: metrics.updatedAt ?? new Date().toISOString(),
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    about: { '@type': 'Corporation', name: company.name, tickerSymbol: company.symbol },
  }
}

function buildFaqJsonLd(company: Company, metrics: ComputedMetrics) {
  const sym = company.symbol
  const name = company.name
  const yieldPct = (metrics.currentYield * 100).toFixed(2)
  const maxYield = metrics.historicalMaxYield ? (metrics.historicalMaxYield * 100).toFixed(2) : null
  const minYield = metrics.historicalMinYield ? (metrics.historicalMinYield * 100).toFixed(2) : null
  const cagr5y = metrics.dividendCagr5y ? (metrics.dividendCagr5y * 100).toFixed(1) : null
  const streak = company.yearsIncreasingDividends

  const signalAnswer =
    metrics.weissSignal === 'undervalued'
      ? `Yes. By the Geraldine Weiss method, ${name} (${sym}) is currently undervalued. Its dividend yield of ${yieldPct}% is near the top of its 10-year historical range (${minYield}%–${maxYield}%), which historically signals an attractive entry point for income investors.`
      : metrics.weissSignal === 'overvalued'
      ? `No. By the Geraldine Weiss method, ${name} (${sym}) is currently overvalued. Its dividend yield of ${yieldPct}% is near the bottom of its 10-year historical range (${minYield}%–${maxYield}%), suggesting the stock is priced for optimism relative to its income output.`
      : `${name} (${sym}) is currently trading at fair value by the Geraldine Weiss method. Its dividend yield of ${yieldPct}% sits near the midpoint of its 10-year historical range (${minYield}%–${maxYield}%).`

  const streakAnswer =
    streak >= 50
      ? `${name} has raised its dividend for ${streak} consecutive years, qualifying it as a Dividend King — a stock that has increased its payout every year for at least 50 years.`
      : streak >= 25
      ? `${name} has raised its dividend for ${streak} consecutive years, qualifying it as a Dividend Aristocrat — an S&P 500 company with at least 25 consecutive years of dividend growth.`
      : streak >= 10
      ? `${name} has raised its dividend for ${streak} consecutive years, demonstrating a strong decade-long track record of income growth.`
      : streak > 0
      ? `${name} has raised its dividend for ${streak} consecutive years.`
      : `${name} has an established dividend payment history. Investors should monitor recent payout trends before relying on future growth.`

  const kingAnswer = company.isDividendKing
    ? `Yes. ${name} (${sym}) is a Dividend King, having raised its dividend every year for ${streak} or more consecutive years. Fewer than 60 US companies hold this distinction.`
    : company.isDividendAristocrat
    ? `No. ${name} (${sym}) is a Dividend Aristocrat (${streak}+ consecutive years of growth) but not yet a Dividend King, which requires 50+ years of consecutive increases.`
    : `No. ${name} (${sym}) does not currently qualify as a Dividend King or Dividend Aristocrat.`

  const questions = [
    {
      '@type': 'Question',
      name: `Is ${name} (${sym}) undervalued right now?`,
      acceptedAnswer: { '@type': 'Answer', text: signalAnswer },
    },
    {
      '@type': 'Question',
      name: `What is ${sym}'s current dividend yield?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${name} (${sym}) currently yields ${yieldPct}%. Its 10-year historical yield has ranged from ${minYield ?? '—'}% to ${maxYield ?? '—'}%. The current yield is updated daily based on the latest price and annual dividend.`,
      },
    },
    {
      '@type': 'Question',
      name: `Is ${name} a Dividend King?`,
      acceptedAnswer: { '@type': 'Answer', text: kingAnswer },
    },
    {
      '@type': 'Question',
      name: `How long has ${name} been growing its dividend?`,
      acceptedAnswer: { '@type': 'Answer', text: streakAnswer },
    },
    ...(cagr5y
      ? [{
          '@type': 'Question',
          name: `What is ${sym}'s dividend growth rate?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${name} (${sym}) has grown its dividend at a compound annual rate of ${cagr5y}% over the past 5 years. Dividend growth rate is a key factor in DividendVisual's quality score, which currently rates ${sym} at ${metrics.qualityScore}/100.`,
          },
        }]
      : []),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AnalysisPage({ params }: PageProps) {
  const { symbol } = await params
  const data = await getTickerData(symbol)
  if (!data) notFound()

  const { company, metrics } = data
  const sym = company.symbol
  const drip = dripSentence(metrics)
  const jsonLd = buildJsonLd(company, metrics, symbol)
  const faqJsonLd = buildFaqJsonLd(company, metrics)

  const signalColor = metrics.weissSignal === 'undervalued' ? '#22c55e'
    : metrics.weissSignal === 'overvalued' ? '#ef4444' : '#f59e0b'
  const signalLabel = metrics.weissSignal === 'undervalued' ? 'Undervalued'
    : metrics.weissSignal === 'overvalued' ? 'Overvalued' : 'Fair Value'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <TrackPageView event="analysis_viewed" properties={{ symbol: sym, signal: metrics.weissSignal ?? 'unknown', qualityScore: metrics.qualityScore ?? 0 }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Screener', href: '/watchlist' },
        { label: `${sym.toUpperCase()} Dividend Analysis` },
      ]} />

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{ color: signalColor, borderColor: `${signalColor}40`, backgroundColor: `${signalColor}15` }}
          >
            {signalLabel}
          </span>
          <span className="text-xs text-[#71717a]">Updated {new Date(metrics.updatedAt ?? Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <h1 className="text-3xl font-bold text-[#f4f4f5] leading-tight mb-4">
          {sym} Dividend Analysis — Is {company.name} Undervalued?
        </h1>

        {/* Key stats bar */}
        <div className="grid grid-cols-4 gap-3 mt-6 mb-6">
          {[
            { label: 'Current Yield', value: pct(metrics.currentYield) ?? '—' },
            { label: 'Quality Score', value: `${metrics.qualityScore}/100` },
            { label: 'Price', value: `$${metrics.currentPrice.toFixed(2)}` },
            { label: '5Y Div. CAGR', value: pct(metrics.dividendCagr5y, 1) ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 text-center">
              <p className="text-[10px] text-[#71717a] mb-1 uppercase tracking-wide">{label}</p>
              <p className="text-base font-semibold text-[#f4f4f5]">{value}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Article body */}
      <article className="prose-dv">

        <h2>Weiss Valuation: Where Does {sym} Stand Today?</h2>
        <p>{signalSentence(metrics, company)}</p>
        <p>
          The undervalued price threshold — the level at which {sym} historically becomes an attractive buy — currently sits at{' '}
          <strong>${metrics.undervaluedPrice.toFixed(2)}</strong>. The overvalued threshold, above which the stock is historically expensive, is{' '}
          <strong>${metrics.overvaluedPrice.toFixed(2)}</strong>. The current price of ${metrics.currentPrice.toFixed(2)} places the stock{' '}
          {metrics.weissSignal === 'undervalued'
            ? 'below the undervalued band — a historically rare buying opportunity.'
            : metrics.weissSignal === 'overvalued'
            ? 'above the overvalued band — a signal to review position sizing.'
            : 'between the two bands, in the fair value zone.'}
        </p>

        <h2>Dividend Quality Assessment</h2>
        <p>{qualitySentence(metrics, company)}</p>
        <p>{streakSentence(company, metrics)}</p>

        {metrics.payoutRatio != null && metrics.payoutRatio <= 2.0 && (
          <p>
            The current payout ratio is <strong>{(metrics.payoutRatio * 100).toFixed(0)}%</strong>
            {metrics.payoutRatio < 0.6
              ? ' — a conservative level that leaves significant room for future increases and protects the dividend in a downturn.'
              : metrics.payoutRatio < 0.75
              ? ' — a moderate level. The dividend is well-covered but investors should monitor any trend toward higher payout.'
              : ' — elevated. This limits the buffer available if earnings decline and deserves attention.'}
          </p>
        )}

        <h2>10-Year Yield History</h2>
        <p>
          Over the past decade, {company.name}&apos;s dividend yield has ranged from a low of <strong>{pct(metrics.historicalMinYield)}</strong> (when
          the stock was most expensive relative to its dividend) to a high of <strong>{pct(metrics.historicalMaxYield)}</strong> (when
          it was most attractively priced). The historical median yield — a reasonable proxy for fair value — is <strong>{pct(metrics.medianYield)}</strong>.
        </p>
        <p>
          Investors who consistently bought {sym} near its historical yield maximum and held for 3–5 years have, historically, earned
          both above-average income and above-average capital appreciation as the yield mean-reverted toward the median. This is the
          core logic of yield-based valuation: price and yield are inversely related, so buying high yield means buying low price.
        </p>

        {drip && (
          <>
            <h2>Income Projection: What {sym} Could Generate</h2>
            <p>{drip}</p>
            <p>
              These projections assume no share price appreciation — only the compounding effect of reinvested dividends at a constant
              price. In practice, share price changes will affect the total return. The projection is intended to illustrate the
              power of dividend reinvestment over time, not to predict a specific outcome.
            </p>
          </>
        )}

        <h2>Key Risks to Consider</h2>
        <p>{riskSentence(metrics, company)}</p>
        <p>
          Beyond company-specific factors, all dividend stocks carry interest rate risk: when rates rise, income investors have
          alternatives, and dividend stock valuations tend to compress. {company.name}&apos;s{' '}
          {company.sector ? `position in the ${company.sector} sector` : 'business profile'} should be evaluated in the
          context of your portfolio&apos;s overall rate sensitivity.
        </p>

        <h2>Bottom Line</h2>
        <p>
          {metrics.weissSignal === 'undervalued' && metrics.qualityScore >= 65
            ? `${company.name} currently offers a historically attractive entry point for income investors. The combination of an above-median yield, a quality score of ${metrics.qualityScore}/100, and ${company.yearsIncreasingDividends > 0 ? `${company.yearsIncreasingDividends} years of dividend growth` : 'an established dividend track record'} makes a compelling case for consideration at current levels. As always, position sizing and portfolio context matter — but the Weiss signal here is meaningful.`
            : metrics.weissSignal === 'overvalued'
            ? `At current prices, ${company.name} is trading at historically elevated valuations relative to its dividend yield. Income investors may find better entry points elsewhere in the dividend universe. Existing holders have no urgent reason to sell — the dividend remains intact — but initiating a new position here means accepting below-median long-term income returns relative to cost.`
            : `${company.name} is trading at fair value by the Weiss method — neither a bargain nor overpriced. Income investors already holding the stock can continue to do so comfortably. Those looking to initiate a position might consider waiting for a dip toward the undervalued band, or beginning a partial position now and adding on weakness.`
          }
        </p>

      </article>

      {/* CTA */}
      <div className="mt-10 p-5 bg-[#111118] border border-[#1e1e2e] rounded-xl">
        <p className="text-sm font-medium text-[#f4f4f5] mb-1">See the interactive Weiss chart for {sym}</p>
        <p className="text-xs text-[#71717a] mb-4">10-year price history with valuation bands, DRIP calculator, and full metrics breakdown.</p>
        <Link
          href={`/ticker/${sym}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#818cf8] transition-colors"
        >
          Open {sym} Chart →
        </Link>
      </div>

      {/* Related */}
      <div className="mt-8 pt-8 border-t border-[#1e1e2e]">
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-[#71717a] uppercase tracking-wide mb-4">More stock analysis</p>
            <div className="flex flex-wrap gap-2">
              {['KO', 'JNJ', 'PG', 'MO', 'O', 'XOM', 'HD', 'LOW'].filter((s) => s !== sym).slice(0, 6).map((s) => (
                <Link
                  key={s}
                  href={`/analysis/${s.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-sm font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                >
                  {s}
                </Link>
              ))}
              <Link href="/watchlist" className="px-3 py-1.5 rounded-md bg-[#6366f1]/10 text-sm text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors">
                All stocks →
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#71717a] uppercase tracking-wide mb-4">Related reading</p>
            <div className="flex flex-col gap-2">
              <Link href="/blog/geraldine-weiss-dividend-valuation-method" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
                → The Geraldine Weiss Method Explained
              </Link>
              <Link href="/blog/how-to-find-undervalued-dividend-stocks" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
                → How to Find Undervalued Dividend Stocks
              </Link>
              <Link href="/blog/dividend-yield-trap" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
                → The Dividend Yield Trap Explained
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
