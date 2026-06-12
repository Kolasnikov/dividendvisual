import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DRIPCalculatorClient } from '@/components/calculators/DRIPCalculatorClient'
import { getEtoroLink } from '@/lib/etoro'

export const metadata: Metadata = {
  title: 'DRIP Calculator — Project Your Dividend Income Over 20 Years | DividendVisual',
  description: 'Enter any yield, growth rate, and investment amount to see exactly how much income DRIP compounding generates year by year. Pre-fill with real stock data from 150+ dividend payers.',
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
    {
      '@type': 'Question',
      name: 'What does DRIP stand for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DRIP stands for Dividend Reinvestment Plan. Instead of receiving dividend payments as cash, a DRIP automatically uses that income to purchase additional shares of the same stock. Most major brokerages — Fidelity, Schwab, Vanguard, Interactive Brokers — offer DRIP enrollment at no cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is DRIP investing worth it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For long-term investors in quality dividend-growth stocks, DRIP investing is one of the most effective ways to compound wealth passively. The reinvestment removes the temptation to spend dividends, eliminates the need to time reinvestment decisions, and allows fractional share purchases that would be impractical manually. The compounding benefit is largest with stocks that consistently grow their dividend over decades.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a good dividend growth rate to assume in the calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A conservative but realistic range is 4–8% annually for established dividend-growth stocks. Utilities and consumer staples typically grow dividends 3–5%. High-quality compounders like Home Depot, Texas Instruments, and Microsoft have grown 8–15% historically. Use each stock\'s 5-year dividend CAGR from its DividendVisual page as your starting assumption, and reduce it by 1–2 points for a margin of safety.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is yield on cost and why does it matter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yield on cost (YOC) is your annual dividend income divided by your original purchase price — not the current stock price. It grows each year the dividend increases. A stock bought at a 3% yield that grows its dividend at 8% annually has a YOC of about 13% after 20 years. YOC matters because it shows the true income return on your original capital, which keeps improving even when the stock\'s current yield appears modest to new investors.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this calculator for ETF dividends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, with caveats. Enter the ETF\'s current dividend yield and its historical distribution growth rate as your CAGR input. ETF distributions are less predictable than individual stock dividends because they depend on the underlying holdings changing over time. For ETFs, use a conservative CAGR of 2–4% unless the ETF has a strong track record of distribution growth.',
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
  {
    q: 'What does DRIP stand for?',
    a: 'DRIP stands for Dividend Reinvestment Plan. Instead of receiving dividend payments as cash, a DRIP automatically uses that income to purchase additional shares of the same stock. Most major brokerages offer DRIP enrollment at no cost.',
  },
  {
    q: 'Is DRIP investing worth it?',
    a: 'For long-term investors in quality dividend-growth stocks, DRIP is one of the most effective ways to compound wealth passively. The reinvestment removes the temptation to spend dividends and eliminates timing decisions. The compounding benefit is largest with stocks that grow their dividend consistently over decades.',
  },
  {
    q: 'What is a good dividend growth rate to assume?',
    a: "A conservative but realistic range is 4–8% annually for established dividend-growth stocks. Utilities and consumer staples typically grow 3–5%. High-quality compounders like HD or TXN have grown 8–15%. Use each stock's 5-year CAGR from its DividendVisual page as your starting point, then shade it down 1–2 points for margin of safety.",
  },
  {
    q: 'What is yield on cost and why does it matter?',
    a: 'Yield on cost (YOC) is your annual dividend income divided by your original purchase price — not the current stock price. It grows each year the dividend increases. A 3% yield growing at 8% annually reaches roughly 13% YOC after 20 years. It matters because it shows the true income return on your original capital.',
  },
  {
    q: 'Can I use this calculator for ETF dividends?',
    a: "Yes, with caveats. Enter the ETF's current yield and historical distribution growth rate as the CAGR input. ETF distributions are less predictable than individual stock dividends, so use a conservative CAGR of 2–4% unless the ETF has a strong track record of distribution growth.",
  },
]

export default async function DRIPCalculatorPage() {
  const etoroHref = getEtoroLink((await headers()).get('x-vercel-ip-country'))
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APP_SCHEMA) }} />
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

        <h2>How to Use This DRIP Calculator (Step by Step)</h2>
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

        <h2>DRIP Calculator Examples by Stock</h2>
        <p>
          The table below shows the estimated year-20 annual income for a $10,000 investment in five dividend stocks, using their approximate current yield and 5-year dividend CAGR. All projections assume full DRIP reinvestment, constant stock price, and no taxes.
        </p>
        <table>
          <thead>
            <tr>
              <th>Stock</th>
              <th>Yield</th>
              <th>5Y CAGR</th>
              <th>Year 1 Income</th>
              <th>Year 20 Income</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><Link href="/analysis/ko" className="text-[#6366f1] hover:text-[#818cf8]">KO — Coca-Cola</Link></td>
              <td>3.1%</td>
              <td>4%</td>
              <td>~$310</td>
              <td>~$950</td>
            </tr>
            <tr>
              <td><Link href="/analysis/jnj" className="text-[#6366f1] hover:text-[#818cf8]">JNJ — Johnson &amp; Johnson</Link></td>
              <td>3.2%</td>
              <td>5%</td>
              <td>~$320</td>
              <td>~$1,150</td>
            </tr>
            <tr>
              <td><Link href="/analysis/o" className="text-[#6366f1] hover:text-[#818cf8]">O — Realty Income</Link></td>
              <td>5.5%</td>
              <td>3%</td>
              <td>~$550</td>
              <td>~$1,350</td>
            </tr>
            <tr>
              <td><Link href="/analysis/abbv" className="text-[#6366f1] hover:text-[#818cf8]">ABBV — AbbVie</Link></td>
              <td>3.8%</td>
              <td>9%</td>
              <td>~$380</td>
              <td>~$2,650</td>
            </tr>
            <tr>
              <td><Link href="/analysis/hd" className="text-[#6366f1] hover:text-[#818cf8]">HD — Home Depot</Link></td>
              <td>2.5%</td>
              <td>11%</td>
              <td>~$250</td>
              <td>~$2,900</td>
            </tr>
          </tbody>
        </table>
        <p>
          Notice how ABBV and HD, despite starting with lower or similar yields than Realty Income, generate significantly more income by year 20 due to their higher dividend growth rates. A high starting yield matters less than sustained dividend growth over long horizons.
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
