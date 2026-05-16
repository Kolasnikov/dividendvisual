import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'About DividendVisual',
  description: 'DividendVisual applies the Geraldine Weiss dividend yield method to 150+ blue-chip stocks. Built for serious income investors who want to buy great companies at historically attractive prices.',
  alternates: { canonical: 'https://dividendvisual.com/about' },
  openGraph: {
    title: 'About DividendVisual',
    description: 'DividendVisual applies the Geraldine Weiss dividend yield method to 150+ blue-chip stocks.',
    url: 'https://dividendvisual.com/about',
  },
}

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About DividendVisual',
  description: 'DividendVisual applies the Geraldine Weiss dividend yield method to identify undervalued and overvalued dividend stocks.',
  url: 'https://dividendvisual.com/about',
  publisher: {
    '@type': 'Organization',
    name: 'DividendVisual',
    url: 'https://dividendvisual.com',
  },
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      <header className="mb-10">
        <p className="text-xs text-[#6366f1] font-semibold uppercase tracking-widest mb-3">About</p>
        <h1 className="text-3xl font-bold text-[#f4f4f5] leading-tight mb-4">
          Built for investors who buy great companies at the right price
        </h1>
        <p className="text-[#71717a] text-base leading-relaxed">
          DividendVisual applies the Geraldine Weiss dividend yield method to 150+ blue-chip dividend
          stocks — giving income investors a clear, data-driven view of when each stock is historically
          cheap, fairly valued, or expensive.
        </p>
      </header>

      <article className="prose-dv">

        <h2>The Problem We&apos;re Solving</h2>
        <p>
          Most income investors know <em>which</em> dividend stocks they want to own. The hard part is
          knowing <em>when</em> to buy. P/E ratios are distorted by accounting choices. Analyst price
          targets anchor to recent price history. And most valuation tools require assumptions about the
          future that nobody can reliably make.
        </p>
        <p>
          The Weiss method sidesteps all of that. It asks a simpler question: is this stock&apos;s current
          dividend yield near the high end or the low end of its own 10-year history? High yield relative
          to history means a low price relative to income — which is exactly what long-term income
          investors should be looking for.
        </p>
        <p>
          DividendVisual automates this analysis for 150+ established dividend payers, updated daily, and
          adds a quality layer — the 0–100 quality score — to filter out the cases where a high yield is
          a warning rather than an opportunity.
        </p>

        <h2>The Methodology</h2>
        <p>
          For each stock, we collect 10 years of weekly price and dividend data. We compute the implied
          yield at each point in time, then calculate the 90th and 10th percentile of that distribution.
          When a stock&apos;s current yield exceeds the 90th percentile, it&apos;s in{' '}
          <strong>Undervalued</strong> territory — historically cheap. When it&apos;s below the 10th
          percentile, it&apos;s <strong>Overvalued</strong> — historically expensive.
        </p>
        <p>
          The quality score (0–100) combines payout ratio, dividend streak, 5-year CAGR, yield
          vs. historical maximum, and FCF coverage into a single number that reflects dividend safety
          and growth quality. A stock with an Undervalued Weiss signal <em>and</em> a quality score
          above 65 represents the highest-conviction setup the method produces.
        </p>
        <p>
          For the complete technical reference, see the{' '}
          <Link href="/methodology" className="text-[#6366f1] hover:text-[#818cf8]">
            Methodology page
          </Link>.
        </p>

        <h2>Who This Is For</h2>
        <p>
          DividendVisual is built for patient, income-oriented investors — people building portfolios
          designed to generate growing cash flow over 10, 20, or 30 years. It is not a trading tool.
          The Weiss method is not designed to predict short-term price moves; it&apos;s designed to help
          you accumulate positions in high-quality businesses at historically favorable prices.
        </p>
        <p>
          The typical DividendVisual user:
        </p>
        <ul>
          <li>Invests in Dividend Kings, Aristocrats, REITs, and other established blue chips</li>
          <li>Cares more about yield on cost compounding over 15 years than short-term total return</li>
          <li>Wants a systematic, data-driven framework for entry decisions — not gut feel</li>
          <li>Understands that the method has limits and uses it as one input among several</li>
        </ul>

        <h2>The Stock Universe</h2>
        <p>
          We cover 150+ stocks selected for Weiss method compatibility: 15+ years of dividend history,
          stable free cash flow generation, and no recent dividend cuts or freezes. The universe
          includes all major <Link href="/collections/dividend-kings" className="text-[#6366f1] hover:text-[#818cf8]">Dividend Kings</Link>,
          the most widely-held{' '}
          <Link href="/collections/dividend-aristocrats" className="text-[#6366f1] hover:text-[#818cf8]">Dividend Aristocrats</Link>,
          and selected{' '}
          <Link href="/collections/reits" className="text-[#6366f1] hover:text-[#818cf8]">REITs</Link> and{' '}
          <Link href="/collections/utilities" className="text-[#6366f1] hover:text-[#818cf8]">utilities</Link>{' '}
          that meet the eligibility criteria. We are now covering 150+ tickers.
        </p>
        <p>
          Data is refreshed daily via a Python pipeline using public market data sources. Prices,
          dividends, Weiss signals, and quality scores reflect the most recent trading day&apos;s close.
        </p>

        <h2>About the Geraldine Weiss Method</h2>
        <p>
          Geraldine Weiss began publishing her <em>Investment Quality Trends</em> newsletter in 1966,
          submitting her application under the name &quot;G. Weiss&quot; because she knew the financial
          establishment of the time would dismiss analysis written by a woman. The strategy she had
          developed was simple and durable: value stocks by their dividend yield history, not their
          earnings multiples.
        </p>
        <p>
          Her newsletter ran for nearly 40 years and produced a long-term track record that ranked
          among the best in the business. The core idea — that for established dividend payers, yield
          fluctuations are primarily driven by price — has held up through every market regime since.
        </p>
        <p>
          Read the full history and mechanics:{' '}
          <Link href="/blog/geraldine-weiss-dividend-valuation-method" className="text-[#6366f1] hover:text-[#818cf8]">
            The Geraldine Weiss Method Explained
          </Link>
        </p>

        <h2>Disclaimer</h2>
        <p>
          DividendVisual is an independent informational tool, not a registered investment advisor.
          Nothing on this site constitutes financial advice. All Weiss signals, quality scores, and
          projections reflect historical data and should not be interpreted as predictions of future
          performance. Always conduct your own research before making investment decisions.
        </p>
        <p>
          See our full{' '}
          <Link href="/terms" className="text-[#6366f1] hover:text-[#818cf8]">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#6366f1] hover:text-[#818cf8]">Privacy Policy</Link>.
        </p>

      </article>

      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        <Link
          href="/opportunities"
          className="flex flex-col p-5 bg-[#111118] border border-[#6366f1]/30 rounded-xl hover:border-[#6366f1]/60 transition-colors group"
        >
          <span className="text-xs text-[#6366f1] font-semibold uppercase tracking-wide mb-2">Start here</span>
          <span className="text-sm font-medium text-[#f4f4f5] group-hover:text-white">
            Current Opportunities →
          </span>
          <span className="text-xs text-[#71717a] mt-1">Stocks in historically cheap territory, ranked by quality.</span>
        </Link>
        <Link
          href="/methodology"
          className="flex flex-col p-5 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-[#6366f1]/30 transition-colors group"
        >
          <span className="text-xs text-[#71717a] font-semibold uppercase tracking-wide mb-2">How it works</span>
          <span className="text-sm font-medium text-[#f4f4f5] group-hover:text-white">
            Full Methodology →
          </span>
          <span className="text-xs text-[#71717a] mt-1">Band calculation, quality score formula, DRIP assumptions.</span>
        </Link>
      </div>
    </div>
  )
}
