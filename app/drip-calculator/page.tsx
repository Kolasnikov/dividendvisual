import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DRIPCalculatorClient } from '@/components/calculators/DRIPCalculatorClient'
import { getEtoroLink } from '@/lib/etoro'
import { serializeJsonLd } from '@/lib/json-ld'

export const metadata: Metadata = {
  title: 'DRIP Calculator 2026: Project Dividend Income Growth',
  description: 'Use our DRIP calculator to project dividend income for 20 years. Enter yield, growth rate, and investment amount, or pre-fill 150+ dividend stocks.',
  alternates: { canonical: 'https://dividendvisual.com/drip-calculator' },
  openGraph: {
    title: 'Dividend Reinvestment Calculator (DRIP) | DividendVisual',
    description: 'Project your dividend income with DRIP reinvestment. Enter yield, CAGR, and investment to see 20-year income compounding and yield on cost.',
    url: 'https://dividendvisual.com/drip-calculator',
    type: 'website',
  },
}

const WEB_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'DRIP Dividend Reinvestment Calculator',
  description: 'Calculate how dividend reinvestment compounding grows your income over time. Enter yield, growth rate, and investment amount.',
  url: 'https://dividendvisual.com/drip-calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const DRIP_FAQ = [
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
  {
    q: 'Is DRIP investing worth it?',
    a: 'For long-term investors in quality dividend-growth stocks, DRIP is one of the most effective ways to compound wealth passively. The reinvestment removes the temptation to spend dividends and eliminates timing decisions. The compounding benefit is largest with stocks that grow their dividend consistently over decades.',
  },
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: DRIP_FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
}

export default async function DRIPCalculatorPage() {
  const etoroHref = getEtoroLink((await headers()).get('x-vercel-ip-country'))
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(WEB_APP_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(FAQ_SCHEMA) }} />

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
              href={`/ticker/${sym}`}
              className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-xs font-mono text-[#71717a] hover:text-[#f4f4f5] transition-colors"
            >
              {sym}
            </Link>
          ))}
          <Link href="/dividend-screener" className="px-3 py-1.5 rounded-md bg-[#6366f1]/10 text-xs text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors">
            All stocks →
          </Link>
        </div>
      </div>

      <a
        href={etoroHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-[#6366f1]/25 bg-[#111118] px-5 py-4 hover:border-[#6366f1]/50 transition-colors group"
      >
        <div>
          <p className="text-sm font-semibold text-[#f4f4f5] group-hover:text-white transition-colors">
            Ready to start compounding? Invest commission-free on eToro
          </p>
          <p className="text-xs text-[#52525b] mt-0.5">€50 minimum · Fractional shares · Capital at risk</p>
        </div>
        <span className="text-[#6366f1] group-hover:text-[#818cf8] transition-colors text-lg shrink-0">→</span>
      </a>

      <article className="prose-dv mt-14">
        <h2>What is DRIP investing?</h2>
        <p>
          DRIP investing means reinvesting cash dividends back into the same stock or fund instead of
          taking the dividend as spendable income. DRIP stands for Dividend Reinvestment Plan. When a
          company pays a dividend, your broker uses that cash to buy additional shares, often including
          fractional shares, so every dividend payment increases the number of shares you own.
        </p>
        <p>
          The compounding effect has two engines. First, reinvested dividends buy more shares, and those
          new shares generate their own future dividends. Second, quality dividend-growth companies can
          raise the dividend per share over time, so each share may produce more income in future years.
          When both forces work together, the income curve starts slowly and then accelerates in the later
          years of a 10-, 15-, or 20-year projection.
        </p>
        <p>
          DRIP investing is most useful for long-term investors who do not need the income today. It can
          be especially powerful in retirement accounts, where reinvestment is not interrupted by annual
          dividend taxes. It is not automatic magic, though. A DRIP still depends on the quality of the
          underlying business, the sustainability of the dividend, valuation at purchase, and whether the
          dividend keeps growing. Reinvesting dividends into a weak company can compound mistakes just as
          efficiently as reinvesting into a strong one compounds income.
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
          <Link href="/dividend-screener" className="text-[#6366f1] hover:text-[#818cf8]">DividendVisual page</Link>{' '}
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

        <h2>How to use this DRIP calculator</h2>
        <ol>
          <li>
            <strong>Enter your initial investment amount.</strong> This is the dollar amount you plan to invest today. The calculator works with any size — from $1,000 to $1,000,000.
          </li>
          <li>
            <strong>Set the current dividend yield of your target stock.</strong> Use the stock&apos;s current yield — available on its{' '}
            <Link href="/dividend-screener" className="text-[#6366f1] hover:text-[#818cf8]">DividendVisual page</Link>
            . Avoid using the highest historical yield as your starting point; it overstates the actual income you would receive today.
          </li>
          <li>
            <strong>Enter the dividend growth CAGR.</strong> Open the stock&apos;s DividendVisual analysis page to find its 5-year or 10-year dividend CAGR. Use the 5-year figure as a baseline. If the company has slowed its growth in recent years, shade it down by 1–2 percentage points.
          </li>
          <li>
            <strong>Choose your time horizon and read the results.</strong> Compare Year 1 income against final-year income to see the full compounding arc. Pay attention to yield on cost in the final year — it shows what your original investment is effectively yielding after dividend growth compounds over your chosen period.
          </li>
        </ol>

        <h2>DRIP calculator examples</h2>
        <p>
          The examples below use a $10,000 starting investment, full dividend reinvestment, a constant
          share price assumption, and no taxes. They are not forecasts; they show how different starting
          yields and dividend growth rates change the income path.
        </p>
        <table>
          <thead>
            <tr>
              <th>Case</th>
              <th>Starting Yield</th>
              <th>Dividend Growth</th>
              <th>Year 1 Income</th>
              <th>Year 20 Income</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><Link href="/analysis/o" className="text-[#6366f1] hover:text-[#818cf8]">High-yield REIT example</Link></td>
              <td>5.5%</td>
              <td>3%</td>
              <td>~$550</td>
              <td>~$1,350</td>
            </tr>
            <tr>
              <td><Link href="/analysis/jnj" className="text-[#6366f1] hover:text-[#818cf8]">Balanced dividend-growth example</Link></td>
              <td>3.2%</td>
              <td>5%</td>
              <td>~$320</td>
              <td>~$1,150</td>
            </tr>
            <tr>
              <td><Link href="/analysis/hd" className="text-[#6366f1] hover:text-[#818cf8]">Low-yield compounder example</Link></td>
              <td>2.5%</td>
              <td>11%</td>
              <td>~$250</td>
              <td>~$2,900</td>
            </tr>
          </tbody>
        </table>
        <p>
          The high-yield REIT case starts with the most income, but the lower-yield compounder can pass
          it over long horizons if dividend growth remains high. The balanced case sits in the middle:
          less starting income than the REIT, but more growth than a slow-growing high-yield stock. This
          is why the DRIP calculator is useful: it makes the trade-off between starting yield and dividend
          growth visible in dollars.
        </p>
      </article>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {DRIP_FAQ.map(({ q, a }) => (
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
