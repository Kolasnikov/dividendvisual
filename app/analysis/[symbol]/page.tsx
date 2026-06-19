import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { TickerResponse, Company, ComputedMetrics } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import { ResearchDisclosure } from '@/components/seo/ResearchDisclosure'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'
import { getSectorLandingHref } from '@/lib/sector-mapping'

const CURRENT_YEAR = new Date().getFullYear()

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

type PeerRow = { symbol: string; name: string; currentYield: number; weissSignal: string; qualityScore: number }

type PriorityAnalysisGuide = {
  eyebrow: string
  title: string
  paragraphs: string[]
  questions: string[]
  links: { href: string; label: string }[]
  titleOverride?: string
  descriptionOverride?: (yieldPct: string) => string
}

const PRIORITY_ANALYSIS_GUIDES: Record<string, PriorityAnalysisGuide> = {
  ABBV: {
    titleOverride: 'ABBV Dividend Analysis 2026: Yield, Safety & Value',
    descriptionOverride: (yieldPct) =>
      `Analyze ABBV's ${yieldPct}% yield, 10-year dividend history, payout ratio, FCF coverage, and Weiss value signal to judge AbbVie income safety today.`,
    eyebrow: 'Healthcare dividend deep dive',
    title: 'How to read the ABBV dividend setup',
    paragraphs: [
      'AbbVie attracts dividend investors for a different reason than the longest-streak healthcare names. The yield is usually more generous, but the research burden is higher because payout confidence depends on the post-Humira earnings mix, pipeline replacement, and balance-sheet progress.',
      'That makes the Weiss signal useful as a starting point rather than a conclusion. A historically elevated ABBV yield deserves attention when cash-flow coverage and dividend growth remain intact; it deserves skepticism when the market is repricing a real drug or pipeline risk.',
    ],
    questions: [
      'Is ABBV offering a high yield because valuation is attractive or because business risk has risen?',
      'Does payout coverage still support the dividend after the Humira transition?',
      'Would JNJ provide a steadier healthcare dividend profile at the current entry price?',
    ],
    links: [
      { href: '/compare/jnj-vs-abbv', label: 'Compare JNJ vs ABBV' },
      { href: '/best-healthcare-dividend-stocks', label: 'Best healthcare dividend stocks' },
      { href: '/blog/jnj-vs-abbv-dividend-comparison', label: 'Read the healthcare comparison guide' },
    ],
  },
  O: {
    eyebrow: 'REIT dividend deep dive',
    title: 'How to read the O dividend setup',
    paragraphs: [
      'Realty Income is searched like a dividend utility: investors want the current yield, the dividend history, and a quick answer on whether the monthly income stream is priced attractively. The quality of that answer depends on separating rate pressure from property-level deterioration.',
      'For O, a high yield can emerge when REIT valuations compress as rates rise. The Weiss band helps spot that historical pressure point, but the next checks are still REIT-specific: payout coverage, debt refinancing risk, tenant durability, and the spread versus other net lease income options.',
    ],
    questions: [
      'Is O near the high end of its own yield history?',
      'Does the monthly dividend still look supported by the REIT cash-flow profile?',
      'How does O compare with NNN or other REIT dividend candidates today?',
    ],
    links: [
      { href: '/compare/o-vs-nnn', label: 'Compare O vs NNN' },
      { href: '/best-reit-dividend-stocks', label: 'Best REIT dividend stocks' },
      { href: '/blog/best-reit-dividend-stocks-2026', label: 'Read the REIT dividend guide' },
    ],
  },
  BDX: {
    eyebrow: 'Healthcare dividend deep dive',
    title: 'How to read the BDX dividend setup',
    paragraphs: [
      'Becton Dickinson is not a yield-chasing healthcare story. The dividend case rests on recurring medical demand, a long growth record, and whether the current yield is unusually attractive for a device and diagnostics business that investors often value for durability.',
      'That is where a dividend-history lens helps. BDX can look less exciting than a high-yield pharma stock on current income alone, so the research question is whether valuation, payout coverage, and dividend growth make the lower starting yield worth the quality trade-off.',
    ],
    questions: [
      'Is BDX cheap relative to its own dividend yield history?',
      'Does payout safety compensate for a lower starting yield?',
      'How does BDX compare with healthcare dividend peers on quality and growth?',
    ],
    links: [
      { href: '/best-healthcare-dividend-stocks', label: 'Best healthcare dividend stocks' },
      { href: '/blog/best-healthcare-dividend-stocks-2026', label: 'Read the healthcare dividend guide' },
      { href: '/dividend-screener', label: 'Compare BDX with the screener' },
    ],
  },
}

async function getSectorPeers(sector: string | null, excludeSymbol: string): Promise<PeerRow[]> {
  if (!sector) return []
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(
      `${baseUrl}/api/watchlist?sort=quality&order=desc&sector=${encodeURIComponent(sector)}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const rows: PeerRow[] = await res.json()
    return rows.filter((r) => r.symbol !== excludeSymbol).slice(0, 5)
  } catch {
    return []
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
  const isPriorityDividendHistoryPage = company.symbol in PRIORITY_ANALYSIS_GUIDES
  const guide = isPriorityDividendHistoryPage ? PRIORITY_ANALYSIS_GUIDES[company.symbol] : null
  const title = guide?.titleOverride
    ?? (isPriorityDividendHistoryPage
      ? `${company.symbol} Dividend History, Yield & Weiss Analysis — ${company.name}`
      : `${company.symbol} Dividend Analysis — Is ${company.name} Undervalued?`)
  const description = guide?.descriptionOverride?.(yieldPct)
    ?? (isPriorityDividendHistoryPage
      ? `${company.name} (${company.symbol}) dividend history and yield analysis. Current yield ${yieldPct}%, historically ${signalLabel}. Review payout safety, dividend growth, quality score, and Weiss valuation bands.`
      : `${company.name} (${company.symbol}) dividend deep-dive. Current yield ${yieldPct}%, historically ${signalLabel}. Quality score ${metrics.qualityScore}/100. 10-year yield history, payout ratio, dividend CAGR, and Weiss valuation breakdown.`)
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

function valuationVerdict(metrics: ComputedMetrics, company: Company) {
  const yieldPct = pct(metrics.currentYield)!
  const median = pct(metrics.medianYield)!
  const quality = `${metrics.qualityScore}/100`

  if (metrics.weissSignal === 'undervalued' && metrics.qualityScore >= 65) {
    return {
      label: 'Research view',
      title: `${company.symbol} looks actionable for income investors`,
      body: `${company.name} is in Weiss undervalued territory with a ${yieldPct} yield and a ${quality} quality score. The setup is strongest when the elevated yield is paired with stable payout coverage, so the next step is checking whether cash flow and dividend growth still support the signal.`,
    }
  }

  if (metrics.weissSignal === 'undervalued') {
    return {
      label: 'Research view',
      title: `${company.symbol} is cheap, but needs extra dividend safety work`,
      body: `${company.name} screens as undervalued by yield history, but the ${quality} quality score keeps this from being a clean buy signal. Treat the high yield as a prompt for deeper due diligence rather than a standalone green light.`,
    }
  }

  if (metrics.weissSignal === 'overvalued') {
    return {
      label: 'Research view',
      title: `${company.symbol} is a quality check, not an entry signal`,
      body: `${company.name} currently yields ${yieldPct}, below the level income investors have historically been paid at better entry points. Unless the business quality or dividend growth is exceptional, the Weiss setup argues for patience rather than chasing the stock here.`,
    }
  }

  return {
    label: 'Research view',
    title: `${company.symbol} is balanced, but not a bargain`,
    body: `${company.name} is near fair value with a ${yieldPct} yield versus a ${median} historical median. Existing holders can focus on dividend safety and growth; new buyers may want either a better yield or stronger evidence that the dividend growth rate can compound through the next cycle.`,
  }
}

function whyNowSentence(metrics: ComputedMetrics, company: Company): string {
  if (metrics.whyNowText) return metrics.whyNowText

  if (metrics.weissSignal === 'undervalued') {
    return `${company.symbol} matters now because the market is offering a yield near the high end of its own history. That can be a long-term entry opportunity, but only if the dividend has not become impaired. The quality score and payout ratios are the guardrails.`
  }

  if (metrics.weissSignal === 'overvalued') {
    return `${company.symbol} matters now because the stock is priced at a low income return relative to its own history. The dividend may still be safe, but the current yield offers less margin of safety than usual.`
  }

  return `${company.symbol} matters now because the setup is neutral. The stock is not obviously cheap or stretched by yield history, so dividend growth, payout coverage, and peer alternatives should drive the decision.`
}

function peerContextSentence(metrics: ComputedMetrics, company: Company, peers: PeerRow[]): string | null {
  if (peers.length === 0) return null

  const higherYield = peers.filter((peer) => peer.currentYield > metrics.currentYield)
  const higherQuality = peers.filter((peer) => peer.qualityScore > metrics.qualityScore)
  const bestPeer = [...peers].sort((a, b) => b.qualityScore - a.qualityScore)[0]

  if (higherYield.length > 0 && higherQuality.length > 0) {
    return `${company.symbol} is not the only candidate in ${company.sector ?? 'its peer group'}. ${higherYield[0].symbol} offers a higher current yield, while ${higherQuality[0].symbol} screens higher on quality. That makes peer comparison important before treating ${company.symbol}'s Weiss signal as the best available setup.`
  }

  if (higherYield.length > 0) {
    return `${higherYield[0].symbol} currently offers a higher yield than ${company.symbol}, but yield alone is not the decision. Compare quality score and payout coverage to decide whether the extra income is compensation for higher risk.`
  }

  if (higherQuality.length > 0) {
    return `${bestPeer.symbol} screens stronger on quality than ${company.symbol}. If dividend safety is the priority, investors should compare the quality gap against ${company.symbol}'s valuation signal.`
  }

  return `${company.symbol} compares well against the available ${company.sector ?? 'peer'} set on the metrics shown here. The main question is whether the current valuation signal is strong enough to justify choosing it over similar dividend payers.`
}

function sectorRiskSentence(company: Company): string {
  const sector = company.sector ?? ''
  const industry = company.industry ?? ''
  const text = `${sector} ${industry}`.toLowerCase()

  if (text.includes('real estate') || text.includes('reit')) {
    return 'For REITs, the dividend story depends on interest rates, debt maturities, occupancy, and funds-from-operations coverage. A high yield can be attractive, but it can also reflect balance-sheet stress or refinancing risk.'
  }
  if (text.includes('utilities')) {
    return 'For utilities, the key variables are regulation, allowed returns, capital spending, and leverage. Dividend stability is often high, but rate-case outcomes and debt costs can limit growth.'
  }
  if (text.includes('health') || text.includes('pharma') || text.includes('biotech')) {
    return 'For healthcare dividend stocks, patent cycles, reimbursement pressure, product pipelines, and litigation can matter as much as current payout ratios. A safe-looking dividend still needs durable earnings power behind it.'
  }
  if (text.includes('energy') || text.includes('oil') || text.includes('gas')) {
    return 'For energy stocks, commodity prices and capital discipline drive dividend durability. The strongest setups combine a high current yield with conservative balance-sheet policy through the cycle.'
  }
  if (text.includes('financial') || text.includes('bank') || text.includes('insurance')) {
    return 'For financials, dividend safety depends on credit quality, capital ratios, interest-rate sensitivity, and underwriting discipline. Historical yield signals should be checked against balance-sheet risk.'
  }
  if (text.includes('consumer staples')) {
    return 'For consumer staples, pricing power and volume resilience are the core dividend supports. The main risk is paying too much for stability when growth is slow.'
  }
  if (text.includes('technology') || text.includes('semiconductor')) {
    return 'For technology dividend payers, dividend growth can be strong but more cyclical than classic staples or utilities. Watch free cash flow durability, buyback priorities, and capital spending needs.'
  }
  if (text.includes('telecom') || ['T', 'VZ'].includes(company.symbol)) {
    return 'For telecom stocks, debt, spectrum spending, capital intensity, and slow revenue growth are the main dividend constraints. High yield needs especially careful coverage analysis.'
  }

  return 'The sector backdrop matters because dividend yield signals can mean different things in different industries. Always compare the Weiss signal with balance-sheet strength, cash-flow coverage, and sector-specific business risk.'
}

function watchItems(metrics: ComputedMetrics, company: Company): string[] {
  const items: string[] = []
  items.push(`Yield moving toward ${pct(metrics.historicalMaxYield)} would strengthen the undervaluation signal; yield falling toward ${pct(metrics.medianYield)} would indicate mean reversion.`)

  if (metrics.payoutRatio != null && metrics.payoutRatio <= 2.0) {
    items.push(`Payout ratio staying below ${(Math.max(metrics.payoutRatio, 0.6) * 100).toFixed(0)}% would support dividend flexibility.`)
  } else {
    items.push('Payout ratio becoming available and remaining within a normal range would improve confidence in dividend sustainability.')
  }

  if (metrics.fcfPayout != null && metrics.fcfPayout <= 2.0) {
    items.push(`Free-cash-flow payout near ${(metrics.fcfPayout * 100).toFixed(0)}% should be monitored for deterioration.`)
  } else {
    items.push('Free-cash-flow coverage should be checked separately before relying on the dividend signal.')
  }

  if (metrics.dividendCagr5y != null) {
    items.push(`Dividend growth above ${(metrics.dividendCagr5y * 100).toFixed(1)}% would confirm the income-compounding case; a slowdown would reduce the appeal.`)
  }

  if (company.yearsIncreasingDividends >= 25) {
    items.push(`Any break in the ${company.yearsIncreasingDividends}-year dividend growth streak would materially change the thesis.`)
  }

  return items.slice(0, 5)
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
    author: { '@type': 'Organization', name: 'DividendVisual Research', url: 'https://dividendvisual.com/about' },
    isAccessibleForFree: true,
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
  const [sectorPeers] = await Promise.all([getSectorPeers(company.sector, company.symbol)])
  const sym = company.symbol
  const drip = dripSentence(metrics)
  const jsonLd = buildJsonLd(company, metrics, symbol)
  const faqJsonLd = buildFaqJsonLd(company, metrics)
  const verdict = valuationVerdict(metrics, company)
  const peerContext = peerContextSentence(metrics, company, sectorPeers)
  const watch = watchItems(metrics, company)
  const priorityGuide = PRIORITY_ANALYSIS_GUIDES[sym]

  const signalColor = metrics.weissSignal === 'undervalued' ? '#22c55e'
    : metrics.weissSignal === 'overvalued' ? '#ef4444' : '#f59e0b'
  const signalLabel = metrics.weissSignal === 'undervalued' ? 'Undervalued'
    : metrics.weissSignal === 'overvalued' ? 'Overvalued' : 'Fair Value'
  const updatedLabel = metrics.updatedAt
    ? new Date(metrics.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'recently'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <TrackPageView event="analysis_viewed" properties={{ symbol: sym, signal: metrics.weissSignal ?? 'unknown', qualityScore: metrics.qualityScore ?? 0 }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Screener', href: '/dividend-screener' },
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
          <span className="text-xs text-[#71717a]">Updated {updatedLabel}</span>
        </div>

        <h1 className="text-3xl font-bold text-[#f4f4f5] leading-tight mb-4">
          {sym} Dividend Analysis — Is {company.name} Undervalued in {CURRENT_YEAR}?
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

        <ResearchDisclosure updatedLabel={updatedLabel} compact />
      </header>

      <section className="mb-10 rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#71717a]">{verdict.label}</p>
        <h2 className="mt-2 text-xl font-bold leading-snug text-[#f4f4f5]">{verdict.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">{verdict.body}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Entry signal', value: signalLabel },
            { label: 'Dividend quality', value: metrics.qualityCategory },
            { label: 'Dividend record', value: company.yearsIncreasingDividends > 0 ? `${company.yearsIncreasingDividends} years` : `${metrics.yearsNoCut} no-cut years` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-[#2e2e3e] bg-[#09090b] px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-[#71717a]">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[#f4f4f5]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {priorityGuide && (
        <section className="mb-10 border-y border-[#1e1e2e] py-7">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#818cf8]">
            {priorityGuide.eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-bold leading-snug text-[#f4f4f5]">{priorityGuide.title}</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#a1a1aa]">
            {priorityGuide.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_220px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">Research questions</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#a1a1aa]">
                {priorityGuide.questions.map((question) => (
                  <li key={question} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" />
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">Go deeper</p>
              <div className="mt-3 flex flex-col gap-2">
                {priorityGuide.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-[#6366f1] transition-colors hover:text-[#818cf8]"
                  >
                    {link.label} -&gt;
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article body */}
      <article className="prose-dv">

        <h2>Why {sym} Matters Now</h2>
        <p>{whyNowSentence(metrics, company)}</p>

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

        <div className="not-prose my-8">
          <DividendAlertsCTA
            source="analysis"
            symbol={sym}
            compact
            description={`Get a short weekly email when high-quality dividend stocks like ${sym} move into historically attractive yield territory.`}
          />
        </div>

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

        {peerContext && (
          <>
            <h2>Peer Context: Is {sym} the Best Setup?</h2>
            <p>{peerContext}</p>
          </>
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
        <p>{sectorRiskSentence(company)}</p>
        <p>
          Beyond company-specific factors, all dividend stocks carry interest rate risk: when rates rise, income investors have
          alternatives, and dividend stock valuations tend to compress. {company.name}&apos;s{' '}
          {company.sector ? `position in the ${company.sector} sector` : 'business profile'} should be evaluated in the
          context of your portfolio&apos;s overall rate sensitivity.
        </p>

        <h2>What to Watch Next</h2>
        <ul>
          {watch.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

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
        <p className="text-sm font-medium text-[#f4f4f5] mb-1">Compare {sym} with other dividend stocks</p>
        <p className="text-xs text-[#71717a] mb-4">Use the screener to compare yield, quality score, Weiss signal, payout coverage, and dividend growth across the full universe.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dividend-screener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#818cf8] transition-colors"
          >
            Open Dividend Screener →
          </Link>
          <a
            href={`https://www.tradingview.com/symbols/${sym}/?aff_id=166728&aff_sub=analysis`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-[#2e2e3e] text-[#71717a] text-sm hover:text-[#f4f4f5] hover:border-[#6366f1]/40 transition-colors"
          >
            View full chart on TradingView ↗
          </a>
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 pt-8 border-t border-[#1e1e2e]">
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-[#71717a] uppercase tracking-wide mb-4">
              {sectorPeers.length > 0 ? `More ${company.sector ?? 'dividend'} stocks` : 'More stock analysis'}
            </p>
            <div className="flex flex-wrap gap-2">
              {sectorPeers.length > 0
                ? sectorPeers.map((peer) => {
                    const peerSignalColor =
                      peer.weissSignal === 'undervalued' ? '#22c55e'
                      : peer.weissSignal === 'overvalued' ? '#ef4444' : '#f59e0b'
                    return (
                      <Link
                        key={peer.symbol}
                        href={`/ticker/${peer.symbol}`}
                        title={`${peer.name} — ${(peer.currentYield * 100).toFixed(2)}% yield`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1e1e2e] text-sm font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: peerSignalColor }}
                        />
                        {peer.symbol}
                      </Link>
                    )
                  })
                : ['KO', 'JNJ', 'PG', 'MO', 'O', 'XOM'].filter((s) => s !== sym).slice(0, 5).map((s) => (
                    <Link
                      key={s}
                      href={`/ticker/${s}`}
                      className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-sm font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                    >
                      {s}
                    </Link>
                  ))
              }
              <Link href="/dividend-screener" className="px-3 py-1.5 rounded-md bg-[#6366f1]/10 text-sm text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors">
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
              {company.sector && (
                <Link
                  href={getSectorLandingHref(company.sector)}
                  className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                >
                  → Best {company.sector} Dividend Stocks
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
