import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'How It Works — The Weiss Dividend Yield Method',
  description: 'How DividendVisual uses the Geraldine Weiss dividend yield method to identify undervalued and overvalued dividend stocks. Full methodology: band calculation, quality score formula, DRIP assumptions.',
  alternates: {
    canonical: 'https://dividendvisual.com/methodology',
  },
  openGraph: {
    title: 'Methodology — The Weiss Dividend Yield Method | DividendVisual',
    description: 'How DividendVisual uses the Geraldine Weiss dividend yield method to identify undervalued and overvalued dividend stocks.',
    url: 'https://dividendvisual.com/methodology',
    type: 'article',
  },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How DividendVisual Uses the Geraldine Weiss Method',
  description: 'Full methodology reference: Weiss band calculation, quality score formula, DRIP calculator assumptions, and stock eligibility criteria.',
  url: 'https://dividendvisual.com/methodology',
  dateModified: '2026-05-18',
  author: { '@type': 'Organization', name: 'DividendVisual Research', url: 'https://dividendvisual.com/about' },
  publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
  isAccessibleForFree: true,
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Geraldine Weiss dividend yield method?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Geraldine Weiss method values stocks using their dividend yield history rather than earnings multiples. For any established dividend payer, Weiss identified that the yield oscillates within a characteristic range over time. When the yield approaches its historical high, the stock is undervalued (price is low relative to income). When yield approaches its historical low, the stock is overvalued. Weiss ran the Investment Quality Trends newsletter for nearly 40 years using this method.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does DividendVisual calculate undervalued and overvalued bands?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DividendVisual uses 10 years of weekly price and dividend data to compute each stock\'s yield history. The undervalued band is the 90th percentile of that yield history — meaning the stock has only been cheaper 10% of the time over the past decade. The overvalued band is the 10th percentile. These percentile thresholds were chosen to identify historically extreme valuations, not routine fluctuations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the DividendVisual quality score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The quality score (0–100) measures dividend safety and growth. It combines five factors: payout ratio (up to 25 points), dividend growth streak in years (up to 25 points), 5-year dividend CAGR (up to 20 points), current yield relative to the 10-year maximum (up to 15 points), and FCF payout coverage (up to 15 points). Scores of 80+ are Excellent, 60–79 Good, 40–59 Average, below 40 Risky.',
      },
    },
    {
      '@type': 'Question',
      name: 'How often is the data updated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Price and dividend data is refreshed daily via a Python pipeline using public market data. The Weiss bands, quality scores, and valuation signals are recalculated each day. Pages are cached for up to one hour, so the data you see reflects at most the previous day\'s close.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which stocks does the Weiss method work for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The method works best for established dividend payers with 15+ years of uninterrupted payment history, stable free cash flow (consumer staples, utilities, healthcare, financials), and a payout ratio below 75%. It does not work for growth stocks with no or minimal dividends, companies with recent dividend cuts, or cyclical businesses where dividends fluctuate with earnings. All 150+ stocks on DividendVisual were selected to meet these criteria.',
      },
    },
  ],
}

const qualityFactors = [
  { factor: 'Payout Ratio', max: 25, tiers: '<40% (25 pts) · <55% (20) · <70% (12) · <85% (5) · ≥85% (0)' },
  { factor: 'Dividend Streak', max: 25, tiers: '≥25 yrs (25 pts) · ≥10 yrs (20) · ≥5 yrs (12) · ≥2 yrs (5) · <2 yrs (0)' },
  { factor: '5-Year Dividend CAGR', max: 20, tiers: '≥8% (20 pts) · ≥5% (15) · ≥2% (8) · >0% (3) · ≤0% (0)' },
  { factor: 'Yield vs. 10Y Max', max: 15, tiers: '≥85% of max (15 pts) · ≥70% (10) · ≥50% (5) · <50% (0)' },
  { factor: 'FCF Payout Coverage', max: 15, tiers: '<50% (15 pts) · <70% (10) · <85% (5) · ≥85% (0)' },
]

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Methodology' },
      ]} />

      <header className="mb-10">
        <p className="text-xs text-[#6366f1] font-semibold uppercase tracking-widest mb-3">How It Works</p>
        <h1 className="text-3xl font-bold text-[#f4f4f5] leading-tight mb-4">
          The Geraldine Weiss Dividend Yield Method
        </h1>
        <p className="text-[#71717a] text-base leading-relaxed">
          DividendVisual applies a formalized version of the Weiss method to 150+ blue-chip dividend stocks.
          This page explains exactly what we calculate, how we calculate it, and what the signals mean.
        </p>
        <div className="mt-5 rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
          <p className="text-xs leading-relaxed text-[#71717a]">
            Maintained by DividendVisual Research. Last methodology review: May 18, 2026. This framework is
            designed for educational dividend research and does not provide investment, tax, or financial advice.
          </p>
        </div>
      </header>

      <article className="prose-dv">

        {/* ── 1. The Core Idea ─────────────────────────────────────────────── */}
        <h2>The Core Idea</h2>
        <p>
          Conventional valuation metrics — P/E ratios, DCF models, price-to-book — are built on numbers
          that management can influence. Earnings can be smoothed, restated, or accelerated through
          accounting choices. The dividend is different: it is cash leaving the company, and for an
          established blue-chip that has raised its payout for decades, cutting it is not a financial
          decision — it is a public admission of distress.
        </p>
        <p>
          Geraldine Weiss recognized that for stable dividend payers, <strong>yield fluctuations are
          driven primarily by price, not by dividend changes.</strong> Each company develops a
          characteristic yield range over time. When yield approaches the historical high, the stock
          is cheap — not because something broke, but because the market is temporarily pessimistic.
          When yield approaches the historical low, investors are paying a premium for the same income.
        </p>
        <p>
          For a deeper look at the history and philosophy behind the method, read{' '}
          <Link href="/blog/geraldine-weiss-dividend-valuation-method" className="text-[#6366f1] hover:text-[#818cf8]">
            The Geraldine Weiss Method Explained
          </Link>.
        </p>

        {/* ── 2. Band Calculation ──────────────────────────────────────────── */}
        <h2>How the Valuation Bands Are Calculated</h2>
        <p>
          For each stock, DividendVisual collects <strong>10 years of weekly price and dividend data</strong> and
          computes the implied dividend yield at each point. This produces ~520 weekly yield observations
          per ticker. From this distribution, we derive two thresholds:
        </p>

        <div className="not-prose my-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-[#111118] border border-[#22c55e]/30 rounded-xl p-5">
            <p className="text-xs text-[#22c55e] font-semibold uppercase tracking-wide mb-2">Undervalued Band</p>
            <p className="text-sm text-[#f4f4f5] font-medium mb-1">90th percentile of 10-year yield</p>
            <p className="text-sm text-[#71717a]">
              The stock has only been cheaper 10% of the time over the past decade.
              When the current yield exceeds this threshold, the signal is <strong className="text-[#22c55e]">Undervalued</strong>.
            </p>
          </div>
          <div className="bg-[#111118] border border-[#ef4444]/30 rounded-xl p-5">
            <p className="text-xs text-[#ef4444] font-semibold uppercase tracking-wide mb-2">Overvalued Band</p>
            <p className="text-sm text-[#f4f4f5] font-medium mb-1">10th percentile of 10-year yield</p>
            <p className="text-sm text-[#71717a]">
              The stock has been more expensive 90% of the time. When the current yield falls below this
              threshold, the signal is <strong className="text-[#ef4444]">Overvalued</strong>.
            </p>
          </div>
        </div>

        <p>
          Between the two bands, the signal is <strong>Fair Value</strong> — not a compelling entry or
          an urgent reason to exit. The median yield (50th percentile) over the 10-year window serves
          as the best proxy for fair value price.
        </p>

        <h3>Why the Chart Looks Like Steps, Not Curves</h3>
        <p>
          The valuation bands shift each time the company raises its dividend. A quarterly raise — say,
          from $0.44 to $0.46 per share — shifts both thresholds upward instantly. The band then holds
          steady until the next raise, creating the characteristic staircase pattern visible in every
          Weiss chart. This staircase is the fingerprint of a genuine dividend-growth business.
        </p>

        {/* ── 3. Quality Score ─────────────────────────────────────────────── */}
        <h2>The Quality Score (0–100)</h2>
        <p>
          A Weiss undervalue signal alone is not sufficient. A stock can have a high historical yield
          because the dividend was nearly cut — which would invalidate the entire historical range.
          The quality score filters for dividend safety and consistency before the valuation signal
          becomes actionable.
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left py-3 pr-4 text-xs text-[#71717a] uppercase tracking-wide font-medium">Factor</th>
                <th className="text-center py-3 px-4 text-xs text-[#71717a] uppercase tracking-wide font-medium">Max pts</th>
                <th className="text-left py-3 pl-4 text-xs text-[#71717a] uppercase tracking-wide font-medium">Scoring tiers</th>
              </tr>
            </thead>
            <tbody>
              {qualityFactors.map(({ factor, max, tiers }) => (
                <tr key={factor} className="border-b border-[#1e1e2e]/60">
                  <td className="py-3 pr-4 text-[#f4f4f5] font-medium">{factor}</td>
                  <td className="py-3 px-4 text-center text-[#6366f1] font-semibold">{max}</td>
                  <td className="py-3 pl-4 text-[#71717a]">{tiers}</td>
                </tr>
              ))}
              <tr className="bg-[#1e1e2e]/30">
                <td className="py-3 pr-4 text-[#f4f4f5] font-semibold">Total</td>
                <td className="py-3 px-4 text-center text-[#6366f1] font-bold">100</td>
                <td className="py-3 pl-4 text-[#71717a]">Excellent ≥80 · Good 60–79 · Average 40–59 · Risky &lt;40</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Stocks scoring 65+ with an Undervalued Weiss signal represent the strongest combination:
          historically cheap price <em>and</em> a well-supported, growing dividend. The{' '}
          <Link href="/undervalued-dividend-stocks" className="text-[#6366f1] hover:text-[#818cf8]">
            Opportunities page
          </Link>{' '}
          surfaces exactly this set.
        </p>

        {/* ── 4. DRIP Calculator ───────────────────────────────────────────── */}
        <h2>The DRIP Calculator — Assumptions</h2>
        <p>
          The Dividend Reinvestment (DRIP) calculator on each ticker page projects the compounding
          effect of reinvesting dividends over time. Key assumptions:
        </p>
        <ul>
          <li><strong>Share price is held constant</strong> at the current price. The model isolates dividend compounding, not capital appreciation.</li>
          <li><strong>Dividends are reinvested annually</strong> at the same fixed share price.</li>
          <li><strong>Dividend CAGR is the user-adjustable input</strong>, defaulting to the stock&apos;s actual 5-year CAGR.</li>
          <li>No taxes, fees, or fractional share restrictions are modeled.</li>
        </ul>
        <p>
          The output — yield on cost and annual income at year N — is a <em>demonstration</em> of
          compounding mechanics, not a return forecast. In practice, share price changes affect both
          total return and reinvestment efficiency.
        </p>

        {/* ── 5. Stock Eligibility ─────────────────────────────────────────── */}
        <h2>Which Stocks Qualify</h2>
        <p>
          Not every dividend payer is a valid Weiss candidate. DividendVisual selects stocks that meet
          the following criteria:
        </p>
        <ul>
          <li><strong>15+ years of uninterrupted dividend payments</strong> — enough history to build a reliable yield range.</li>
          <li><strong>Stable, predictable free cash flow</strong> — consumer staples, utilities, healthcare, financials, and industrials dominate the universe for this reason.</li>
          <li><strong>Payout ratio generally below 75%</strong> — leaves a buffer for earnings volatility without forcing a cut.</li>
          <li><strong>No recent dividend cuts or freezes</strong> — a cut resets the historical range and makes prior signals meaningless.</li>
        </ul>
        <p>
          The current universe covers <strong>150+ stocks</strong> including all{' '}
          <Link href="/dividend-kings" className="text-[#6366f1] hover:text-[#818cf8]">Dividend Kings</Link>,
          most{' '}
          <Link href="/dividend-aristocrats" className="text-[#6366f1] hover:text-[#818cf8]">Dividend Aristocrats</Link>,
          and selected{' '}
          <Link href="/best-reit-dividend-stocks" className="text-[#6366f1] hover:text-[#818cf8]">REITs</Link>{' '}
          and{' '}
          <Link href="/best-utility-dividend-stocks" className="text-[#6366f1] hover:text-[#818cf8]">utilities</Link>{' '}
          that meet the eligibility bar.
        </p>

        {/* ── 6. Data and editorial policy ─────────────────────────────────── */}
        <h2>Data Sources and Update Policy</h2>
        <p>
          DividendVisual uses publicly available market and fundamental data to calculate price, dividend,
          payout, cash-flow coverage, dividend CAGR, and yield-history metrics. The ingestion pipeline refreshes
          the stock universe regularly, then recalculates Weiss signals and quality scores from the latest
          available data.
        </p>
        <p>
          Pages are cached for performance, so a freshly reported dividend change, split, restatement, or market
          close may not appear instantly. When a data point appears inconsistent with company filings or exchange
          data, treat the company filing as authoritative and use DividendVisual as a screening layer rather than
          a source of record.
        </p>

        <h2>Editorial Standards</h2>
        <p>
          DividendVisual separates signal from recommendation. A stock marked Undervalued means its current yield
          is historically high relative to its own past. It does not mean the stock should be bought immediately,
          that the dividend is guaranteed, or that future returns will be positive.
        </p>
        <p>
          Every analysis page links back to this methodology, displays its latest data timestamp when available,
          and includes a research disclaimer. The goal is to make the calculation transparent enough that an
          investor can challenge the signal instead of accepting it blindly.
        </p>

        {/* ── 7. Limitations ───────────────────────────────────────────────── */}
        <h2>What the Method Cannot Do</h2>
        <p>
          The Weiss method is not a short-term timing tool. A stock can sit in undervalued territory
          for months while the market ignores it. The signal reflects a probabilistic edge over a
          full cycle, not a near-term price catalyst.
        </p>
        <p>
          The method also breaks down when the dividend itself is at risk. A stock yielding 7% that
          then cuts to 3.5% has not provided a Weiss entry opportunity — it has provided a loss. The
          quality score is designed to filter these cases, but no quantitative screen is perfect.
          Always verify dividend coverage before acting on a valuation signal.
        </p>
        <p>
          Read more:{' '}
          <Link href="/blog/dividend-yield-trap" className="text-[#6366f1] hover:text-[#818cf8]">
            The Dividend Yield Trap — Why a High Yield Is Sometimes a Warning
          </Link>.
        </p>

      </article>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        <Link
          href="/undervalued-dividend-stocks"
          className="flex flex-col p-5 bg-[#111118] border border-[#6366f1]/30 rounded-xl hover:border-[#6366f1]/60 transition-colors group"
        >
          <span className="text-xs text-[#6366f1] font-semibold uppercase tracking-wide mb-2">See it in action</span>
          <span className="text-sm font-medium text-[#f4f4f5] group-hover:text-white">
            Current Undervalued Opportunities →
          </span>
          <span className="text-xs text-[#71717a] mt-1">
            Stocks in historically cheap territory right now, ranked by quality score.
          </span>
        </Link>
        <Link
          href="/dividend-screener"
          className="flex flex-col p-5 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-[#6366f1]/30 transition-colors group"
        >
          <span className="text-xs text-[#71717a] font-semibold uppercase tracking-wide mb-2">Full universe</span>
          <span className="text-sm font-medium text-[#f4f4f5] group-hover:text-white">
            Browse All 150+ Stocks →
          </span>
          <span className="text-xs text-[#71717a] mt-1">
            Filter by signal, sector, badge, and quality score.
          </span>
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-[#1e1e2e] text-xs text-[#52525b]">
        Data updated daily. This page is for informational purposes only and does not constitute
        financial advice. Always conduct your own due diligence before making investment decisions.
      </div>
    </div>
  )
}
