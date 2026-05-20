import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DRIPCalculatorClient } from '@/components/calculators/DRIPCalculatorClient'

export const metadata: Metadata = {
  title: 'Dividend Reinvestment Calculator (DRIP) — Project Your Income Growth',
  description: 'Free DRIP calculator: enter any dividend yield, growth rate, and investment to project income over 20+ years. See yield on cost, total compounded income, and year-by-year growth.',
  alternates: { canonical: 'https://dividendvisual.com/drip-calculator' },
  openGraph: {
    title: 'Dividend Reinvestment Calculator (DRIP) | DividendVisual',
    description: 'Project your dividend income with DRIP reinvestment. Enter yield, CAGR, and investment to see 20-year income compounding and yield on cost.',
    url: 'https://dividendvisual.com/drip-calculator',
    type: 'website',
  },
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is DRIP (Dividend Reinvestment Plan)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A DRIP (Dividend Reinvestment Plan) automatically reinvests your dividend payments to purchase additional shares of the same stock instead of paying out cash. Over time, this compounds your share count and income — each quarter you own more shares, which earn more dividends, which buy more shares. Most major brokerages offer DRIP enrollment at no cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is yield on cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yield on cost (YOC) is your annual dividend income divided by your original purchase price. As companies raise their dividends over time, your YOC grows even if the stock price stays flat. A stock bought at $100 with a 3% yield that grows its dividend 8% annually will have a YOC of about 6.5% after 10 years — more than double the starting yield.",
      },
    },
    {
      '@type': 'Question',
      name: 'What dividend CAGR should I use in the calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Use each stock's historical 5-year dividend CAGR as a starting point. Dividend Kings and Aristocrats typically range from 3% to 10% annual growth. Conservative income stocks (utilities, consumer staples) tend to grow 3–5%. Higher-quality compounders like Home Depot, Texas Instruments, and Microsoft have grown 8–15% historically. You can look up each stock's dividend CAGR on its DividendVisual analysis page.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does this calculator account for taxes on dividends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. This is a pre-tax projection. In a tax-advantaged account (IRA, 401k), DRIP compounding is fully tax-deferred. In a taxable account, qualified dividends are taxed at preferential capital gains rates each year — reducing the effective reinvestment amount. Consult a tax advisor for your specific situation.',
      },
    },
  ],
}

const FAQ_VISIBLE = [
  {
    q: 'What is DRIP (Dividend Reinvestment Plan)?',
    a: 'A DRIP automatically reinvests your dividend payments to purchase additional shares of the same stock instead of paying out cash. Over time, this compounds your share count and income. Most major brokerages offer DRIP enrollment at no cost.',
  },
  {
    q: 'What is yield on cost?',
    a: 'Yield on cost (YOC) is your annual dividend income divided by your original purchase price. As companies raise their dividends, your YOC grows even if the stock price stays flat. A 3% yield growing at 8% annually reaches 6.5% YOC after 10 years.',
  },
  {
    q: 'What dividend CAGR should I use?',
    a: "Use each stock's historical 5-year dividend CAGR as a starting point. Dividend Kings and Aristocrats typically range from 3% to 10% annual growth. Conservative stocks (utilities, telecoms) tend to grow 3–5%. Higher-quality compounders like HD or TXN have grown 8–15% historically.",
  },
  {
    q: 'Does this calculator account for taxes?',
    a: 'No. This is a pre-tax projection. In a tax-advantaged account (IRA, 401k), DRIP compounding is fully tax-deferred. In a taxable account, qualified dividends are taxed each year, reducing the effective reinvestment amount.',
  },
]

export default function DRIPCalculatorPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'DRIP Calculator' },
      ]} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#f4f4f5] leading-tight mb-3">
          Dividend Reinvestment Calculator (DRIP)
        </h1>
        <p className="text-[#71717a] leading-relaxed">
          Enter any dividend yield, annual growth rate, and investment to project your income over time.
          See how DRIP compounding turns a modest starting yield into meaningful long-term income.
        </p>
      </header>

      <DRIPCalculatorClient />

      <div className="mt-6 p-4 bg-[#111118] border border-[#1e1e2e] rounded-xl">
        <p className="text-xs text-[#71717a] mb-3">Use real data — open a stock to pre-fill the calculator:</p>
        <div className="flex flex-wrap gap-2">
          {['KO', 'JNJ', 'PG', 'O', 'MO', 'XOM', 'HD', 'TXN'].map(sym => (
            <Link
              key={sym}
              href={`/analysis/${sym.toLowerCase()}`}
              className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-xs font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
            >
              {sym}
            </Link>
          ))}
          <Link href="/watchlist" className="px-3 py-1.5 rounded-md bg-[#6366f1]/10 text-xs text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors">
            All stocks →
          </Link>
        </div>
      </div>

      <article className="prose-dv mt-14">
        <h2>How DRIP Compounding Works</h2>
        <p>
          The Dividend Reinvestment Plan (DRIP) turns dividend income into new shares automatically.
          Instead of receiving a quarterly cash payment, each dividend goes toward purchasing fractional
          shares of the same stock at the payment date price.
        </p>
        <p>
          The compounding effect has two simultaneous components. First, you accumulate more shares each
          period — so the next dividend payment applies to a larger share count. Second, as most
          dividend-growth companies raise their payout every year, each share generates more income over
          time. Both effects multiply each other, which is why the income curve accelerates sharply in
          the later years of any long projection.
        </p>

        <h2>Yield on Cost: The Number That Actually Matters</h2>
        <p>
          Yield on cost (YOC) is your annual dividend income divided by your <em>original</em> cost
          basis — not the current stock price. It grows every year that the dividend increases, regardless
          of what happens to the share price.
        </p>
        <p>
          A $10,000 investment at a 3% starting yield returns $300 in year one. If the company grows
          its dividend at 8% annually and you reinvest, by year 15 you might earn $900–$1,200 per year
          on that same $10,000 cost basis — a 9–12% yield on cost. The stock&apos;s current yield
          becomes irrelevant to an investor who bought 15 years ago.
        </p>
        <p>
          This is why long-term dividend investors care more about dividend growth rate than starting
          yield. A 2% yielder growing at 12% annually surpasses a static 5% yield in annual income
          around year 11–12, and compounds past it permanently.
        </p>

        <h2>What Dividend CAGR to Use</h2>
        <p>
          The dividend CAGR is the most consequential input in the projection over horizons longer than
          10 years. Each stock&apos;s{' '}
          <Link href="/watchlist" className="text-[#6366f1] hover:text-[#818cf8]">DividendVisual page</Link>{' '}
          shows its historical 5-year and 10-year dividend CAGR. Use the 5-year figure as your
          baseline, and shade it downward by 1–2 percentage points for conservatism.
        </p>
        <p>
          Conservative income stocks — utilities, consumer staples, telecoms — typically grow
          dividends 3–5% annually.{' '}
          <Link href="/dividend-kings" className="text-[#6366f1] hover:text-[#818cf8]">Dividend Kings</Link>{' '}
          as a group average 6–8%. High-quality compounders like Home Depot, Texas Instruments,
          and Microsoft have historically grown 8–15%, though sustaining that rate indefinitely is
          not guaranteed.
        </p>

        <h2>Limitations of This Calculator</h2>
        <p>
          This calculator assumes a constant stock price for reinvestment — a simplification that makes
          the math clean but ignores price appreciation and volatility. In practice, DRIP purchases
          happen at fluctuating prices, which can work in your favor (buying more shares during dips)
          or against you.
        </p>
        <p>
          The model also assumes a constant dividend CAGR throughout the projection horizon. No company
          guarantees this. Dividend cuts — while rare among{' '}
          <Link href="/dividend-aristocrats" className="text-[#6366f1] hover:text-[#818cf8]">Dividend Aristocrats</Link>{' '}
          — do happen during severe recessions. Use the quality score on each stock&apos;s page to
          assess dividend sustainability before projecting long-term growth.
        </p>
      </article>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ_VISIBLE.map(({ q, a }) => (
            <details key={q} className="group bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-[#f4f4f5] list-none select-none hover:text-[#6366f1] transition-colors">
                {q}
                <span className="ml-4 text-[#71717a] group-open:rotate-180 transition-transform text-base leading-none">↓</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-[#71717a] leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
