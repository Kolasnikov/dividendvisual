import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { TrackedOutboundLink } from '@/components/analytics/TrackedOutboundLink'
import { TrackNewsletterLanding } from '@/components/analytics/TrackNewsletterLanding'
import { getEtoroLink } from '@/lib/etoro'
import { serializeJsonLd } from '@/lib/json-ld'

const PAGE_URL = 'https://dividendvisual.com/resources/brokers'
const LAST_REVIEWED = 'July 11, 2026'

export const metadata: Metadata = {
  title: 'Dividend Investing Brokers Compared: Fees, DRIP & Access',
  description:
    'Compare eToro, Interactive Brokers, and Charles Schwab for dividend investing by availability, stock commissions, fractional shares, DRIP, currency costs, and trade-offs.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Dividend Investing Brokers Compared | DividendVisual',
    description: 'A practical broker comparison for dividend investors: fees, DRIP, fractional shares, market access, currencies, and limitations.',
    url: PAGE_URL,
    type: 'article',
  },
}

const BROKERS = [
  {
    name: 'eToro',
    href: '',
    tag: 'Simple multi-asset platform',
    bestFor: 'Investors who value a simple interface, fractional shares, and social features.',
    availability: 'Available in many countries, but products, entities, fees, and investor protections vary by residence.',
    stockCosts: 'A $1 or $2 stock commission may apply by country and exchange. Other fees and market spreads can also apply.',
    fractional: 'Available on eligible stocks; the platform advertises stock investing from $10.',
    drip: 'Dividends are credited to cash. Verify whether recurring or manual reinvestment fits your account; do not assume automatic DRIP.',
    currency: 'Local-currency accounts exist in selected regions. Conversion fees depend on location, payment method, account currency, and Club tier.',
    drawback: 'Pricing and whether a position is a real security or CFD can vary by product and jurisdiction. Check the execution ticket carefully.',
    officialLinks: [
      { href: 'https://www.etoro.com/stocks/', label: 'Stocks and dividend information' },
      { href: 'https://www.etoro.com/trading/fees/', label: 'Current fee schedule' },
    ],
    affiliate: true,
  },
  {
    name: 'Interactive Brokers',
    href: 'https://www.interactivebrokers.com/en/pricing/commissions-home.php',
    tag: 'Global markets and control',
    bestFor: 'Investors who need broad international market access, multiple currencies, advanced orders, or professional tooling.',
    availability: 'Serves clients across many jurisdictions through different regulated entities; available products depend on residence.',
    stockCosts: 'IBKR Lite offers eligible US residents $0 US-listed stock and ETF trades. IBKR Pro uses fixed or tiered commissions.',
    fractional: 'Eligible US, Canadian, and European shares can be traded fractionally; commission rules still apply.',
    drip: 'Dividend reinvestment is supported for eligible positions. Published commission minimums can apply to reinvestment orders.',
    currency: 'Multi-currency accounts and direct FX conversion are a core strength, with published currency commissions.',
    drawback: 'The pricing plans and platform are more complex. Market data subscriptions and third-party exchange fees may matter for advanced use.',
    officialLinks: [
      { href: 'https://www.interactivebrokers.com/en/pricing/commissions-stocks.php', label: 'Stock commission schedule' },
      { href: 'https://www.interactivebrokers.com/en/trading/fractional-trading.php', label: 'Fractional trading' },
    ],
    affiliate: false,
  },
  {
    name: 'Charles Schwab',
    href: 'https://www.schwab.com/pricing',
    tag: 'US full-service brokerage',
    bestFor: 'US-focused investors who want a broad brokerage relationship, research, retirement accounts, and automatic dividend reinvestment.',
    availability: 'Strongest fit for US residents. International account eligibility and available services depend on country.',
    stockCosts: '$0 online commission for US-listed stocks and ETFs. OTC, foreign, broker-assisted, options, and other transactions can cost more.',
    fractional: 'Stock Slices supports fractional purchases for eligible S&P 500 stocks; it is not a universal fractional-share catalogue.',
    drip: 'Eligible stock and ETF dividends can be reinvested automatically into whole or fractional shares at no charge.',
    currency: 'Primarily designed around US-dollar investing. Foreign securities and transactions can carry separate charges.',
    drawback: 'Less natural for non-US residents and investors seeking inexpensive direct access to many overseas exchanges.',
    officialLinks: [
      { href: 'https://www.schwab.com/pricing', label: 'Pricing and account minimums' },
      { href: 'https://www.schwab.com/stocks/dividend-reinvestment-plan', label: 'Dividend reinvestment plan' },
    ],
    affiliate: false,
  },
] as const

const FAQ = [
  {
    question: 'Which broker is best for dividend investing?',
    answer: 'There is no universal best broker. The right choice depends on country, account type, market access, currency conversion, tax reporting, DRIP support, position size, and whether you need automatic reinvestment or advanced tools.',
  },
  {
    question: 'Is commission-free stock trading really free?',
    answer: 'A zero headline commission does not remove bid-ask spreads, currency conversion, regulatory charges, taxes, transfer costs, or product-specific fees. Check the broker’s current cost estimate before submitting an order.',
  },
  {
    question: 'Does every broker offer automatic DRIP?',
    answer: 'No. Some brokers automatically reinvest eligible dividends, some require enrollment for each holding, and others credit dividends to cash for manual reinvestment. Eligibility may differ by security and account.',
  },
  {
    question: 'Why does investor residence matter?',
    answer: 'Residence determines which regulated broker entity serves you, which products and account types are offered, applicable commissions, investor protection rules, tax reporting, and available base currencies.',
  },
]

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export default async function BrokersPage() {
  const etoroHref = getEtoroLink((await headers()).get('x-vercel-ip-country'))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <TrackNewsletterLanding landing="resources-brokers" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd()) }} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Brokers' }]} />

      <header className="mb-10 max-w-4xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#818cf8]">Broker comparison for dividend investors</p>
        <h1 className="text-3xl font-bold leading-tight text-[#f4f4f5] sm:text-4xl">Compare brokers by the costs and features that affect dividend income</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#a1a1aa]">
          A broker does not make a dividend stock safer or cheaper. It determines how you access the stock, convert currency, receive or reinvest dividends, keep records, and eventually transfer or withdraw the position.
        </p>
        <div className="mt-6 rounded-lg border border-[#f59e0b]/25 bg-[#f59e0b]/5 px-4 py-3 text-xs leading-relaxed text-[#a1a1aa]">
          <strong className="text-[#fbbf24]">Affiliate disclosure:</strong> DividendVisual has an affiliate relationship with eToro and may earn a commission from qualifying accounts, at no additional cost to you. Interactive Brokers and Charles Schwab are included for editorial comparison and use direct, non-affiliate links. Last reviewed {LAST_REVIEWED}; always verify current terms for your country.
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-[#f4f4f5]">Quick comparison</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#71717a]">This table is a decision map, not a winner ranking. Availability and fees can differ even between two investors using the same brand.</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#1e1e2e] bg-[#111118]">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-[#1e1e2e] text-xs text-[#71717a]">
              <tr><th className="px-4 py-3 font-medium">Broker</th><th className="px-4 py-3 font-medium">Best fit</th><th className="px-4 py-3 font-medium">Stock pricing</th><th className="px-4 py-3 font-medium">Dividend reinvestment</th><th className="px-4 py-3 font-medium">Main trade-off</th></tr>
            </thead>
            <tbody>
              {BROKERS.map((broker) => (
                <tr key={broker.name} className="border-b border-[#1e1e2e]/70 align-top last:border-0">
                  <td className="px-4 py-4 font-semibold text-[#f4f4f5]">{broker.name}{broker.affiliate ? <span className="ml-2 rounded border border-[#22c55e]/25 bg-[#22c55e]/10 px-1.5 py-0.5 text-[9px] text-[#22c55e]">Affiliate</span> : null}</td>
                  <td className="max-w-[220px] px-4 py-4 text-[#a1a1aa]">{broker.bestFor}</td>
                  <td className="max-w-[240px] px-4 py-4 text-[#a1a1aa]">{broker.stockCosts}</td>
                  <td className="max-w-[230px] px-4 py-4 text-[#a1a1aa]">{broker.drip}</td>
                  <td className="max-w-[230px] px-4 py-4 text-[#a1a1aa]">{broker.drawback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12 grid gap-5 lg:grid-cols-3">
        {BROKERS.map((broker) => {
          const destination = broker.name === 'eToro' ? etoroHref : broker.href
          return (
            <article key={broker.name} className="flex flex-col rounded-xl border border-[#1e1e2e] bg-[#111118] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#818cf8]">{broker.tag}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#f4f4f5]">{broker.name}</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="font-medium text-[#f4f4f5]">Availability</dt><dd className="mt-1 leading-relaxed text-[#71717a]">{broker.availability}</dd></div>
                <div><dt className="font-medium text-[#f4f4f5]">Fractional shares</dt><dd className="mt-1 leading-relaxed text-[#71717a]">{broker.fractional}</dd></div>
                <div><dt className="font-medium text-[#f4f4f5]">Currency</dt><dd className="mt-1 leading-relaxed text-[#71717a]">{broker.currency}</dd></div>
              </dl>
              <div className="mt-5 border-t border-[#1e1e2e] pt-4">
                <p className="text-xs font-medium text-[#a1a1aa]">Verify before opening an account</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {broker.officialLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6366f1] hover:text-[#818cf8]">{link.label} ↗</a>)}
                </div>
              </div>
              <TrackedOutboundLink href={destination} target="_blank" rel={`noopener noreferrer${broker.affiliate ? ' sponsored' : ''}`} event="broker_resource_clicked" properties={{ broker: broker.name, affiliate: broker.affiliate }} className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg border border-[#6366f1]/35 px-4 text-sm font-medium text-[#c7d2fe] hover:bg-[#6366f1]/10">
                Visit {broker.name} ↗
              </TrackedOutboundLink>
            </article>
          )
        })}
      </section>

      <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_340px]">
        <article className="prose-dv max-w-3xl">
          <h2>How to choose a broker for dividend investing</h2>
          <p>Start with jurisdiction and account type, not the promotional commission. Confirm that the broker accepts residents of your country and offers the taxable, retirement, ISA, or other account structure you need.</p>
          <h3>Calculate the full cost of ownership</h3>
          <p>For a long-term dividend investor, currency conversion, custody, transfer-out charges, tax documentation, and dividend processing can matter more than the commission on one purchase. Model the cost across deposits, purchases, reinvestment, and eventual withdrawal.</p>
          <h3>Verify how DRIP actually works</h3>
          <p>Automatic DRIP, recurring investments, and fractional trading are different features. A broker may support fractional purchases but still credit dividends to cash, or support DRIP only for eligible securities and accounts.</p>
          <h3>Check security ownership and product type</h3>
          <p>Confirm whether the order purchases the underlying share, a fractional beneficial interest, or a leveraged derivative such as a CFD. Product type affects fees, financing costs, voting, transfers, dividends, and risk.</p>
          <h3>Think about portability and records</h3>
          <p>Dividend portfolios can be held for decades. Review transfer options, cost-basis records, downloadable statements, tax reporting, and what happens to fractional positions if you move to another broker.</p>
        </article>
        <aside className="h-fit rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
          <p className="text-sm font-semibold text-[#f4f4f5]">Broker due-diligence checklist</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#71717a]">
            <p>1. Is the account available in my country?</p><p>2. Which regulated entity holds my account?</p><p>3. What is the all-in cost in my base currency?</p><p>4. Are dividends automatic, manual, or cash only?</p><p>5. Am I buying the underlying security?</p><p>6. Can I transfer positions and cost basis out?</p><p>7. What tax documents will I receive?</p>
          </div>
          <Link href="/drip-calculator" className="mt-5 inline-block text-sm text-[#6366f1] hover:text-[#818cf8]">Model dividend reinvestment -&gt;</Link>
        </aside>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-[#f4f4f5]">Broker comparison FAQ</h2>
        <div className="mt-5 space-y-3">
          {FAQ.map((item) => <details key={item.question} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3"><summary className="cursor-pointer text-sm font-medium text-[#f4f4f5]">{item.question}</summary><p className="mt-3 text-sm leading-relaxed text-[#71717a]">{item.answer}</p></details>)}
        </div>
      </section>

      <div className="border-t border-[#1e1e2e] pt-8 text-sm">
        <Link href="/resources/tools" className="text-[#6366f1] hover:text-[#818cf8]">Research and portfolio tools -&gt;</Link>
      </div>
    </div>
  )
}
