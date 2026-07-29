import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackNewsletterLanding } from '@/components/analytics/TrackNewsletterLanding'
import { TrackedOutboundLink } from '@/components/analytics/TrackedOutboundLink'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Research Tools for Dividend Investors — TradingView & FinViz | DividendVisual',
  description:
    'TradingView and FinViz complement DividendVisual for technical charts and fundamental due diligence after the Weiss signal identifies a candidate.',
  alternates: {
    canonical: 'https://dividendvisual.com/resources/tools',
  },
  openGraph: {
    title: 'Research Tools for Dividend Investors | DividendVisual',
    description: 'TradingView and FinViz for deeper technical and fundamental research.',
    url: 'https://dividendvisual.com/resources/tools',
  },
}

const TOOLS = [
  {
    name: 'TradingView',
    url: 'tradingview.com',
    href: '/go/tradingview?placement=resources-tools',
    tag: 'Charts',
    description:
      'The go-to platform for price charts, technical analysis, and historical data. Once the Weiss signal identifies a candidate, TradingView is where you look at the price structure, support levels, and longer-term context before sizing a position.',
  },
  {
    name: 'FinViz',
    url: 'finviz.com',
    href: '/go/finviz?placement=resources-tools',
    tag: 'Screener',
    description:
      'A comprehensive stock screener and research platform. Where DividendVisual focuses on yield-based valuation and dividend quality, FinViz provides fundamental data, analyst ratings, earnings calendars, and sector maps. Useful for cross-referencing once a Weiss signal has identified a candidate.',
  },
  {
    name: 'Morningstar',
    url: 'morningstar.com',
    href: '/go/morningstar?placement=resources-tools',
    tag: 'Analyst Research',
    description:
      "Morningstar's independent analyst team assigns economic moat ratings (wide / narrow / none) and fair value estimates to thousands of stocks. These are particularly useful alongside a Weiss undervalue signal: DividendVisual tells you the stock is historically cheap on yield — Morningstar tells you whether the underlying business still has the durable competitive advantage to justify holding it long term.",
  },
  {
    name: 'Sharesight',
    url: 'sharesight.com',
    href: '/go/sharesight?placement=resources-tools',
    tag: 'Portfolio Tracking',
    description:
      'DividendVisual projects what your dividends could be. Sharesight tracks what you actually received — dividend income logged by payment date, cost basis from DRIP reinvestment, tax reports by broker, and portfolio performance across multiple accounts. Used by 500,000+ investors globally. Complementary to DividendVisual, not a replacement.',
  },
]

export default function ToolsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <TrackNewsletterLanding landing="resources-tools" />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/resources' },
        { label: 'Tools' },
      ]} />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-4">Research Tools</h1>
        <p className="text-[#71717a] text-sm leading-relaxed max-w-xl">
          DividendVisual tells you whether a dividend stock is historically cheap or expensive.
          These tools help with the next step — technical context and fundamental due diligence
          before committing to a position.
        </p>
        <p className="mt-5 text-xs text-[#3e3e4e] leading-relaxed border border-[#1e1e2e] rounded-lg px-4 py-3">
          This page contains affiliate links. If you sign up through these links, DividendVisual
          may earn a small commission at no extra cost to you.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {TOOLS.map((tool) => (
          <div key={tool.href} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border text-[#52525b] border-[#2e2e3e] bg-[#1e1e2e]">
                {tool.tag}
              </span>
            </div>
            <h2 className="text-base font-semibold text-[#f4f4f5]">{tool.name}</h2>
            <p className="text-xs text-[#52525b] mt-0.5 mb-3">{tool.url}</p>
            <p className="text-sm text-[#71717a] leading-relaxed mb-4">{tool.description}</p>
            <TrackedOutboundLink
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              event="affiliate_resource_clicked"
              properties={{ kind: 'tool', resource: tool.name }}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-[#2e2e3e] text-sm text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#6366f1]/40 transition-colors"
            >
              Visit {tool.name} ↗
            </TrackedOutboundLink>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
        <p className="text-xs text-[#3e3e4e] leading-relaxed mb-4">
          Links may be affiliate links. DividendVisual may earn a commission on qualifying
          sign-ups. Recommendations reflect genuine editorial judgment — no paid placements.
        </p>
        <Link href="/resources/brokers" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
          → Compare brokers for dividend investing
        </Link>
        <Link href="/resources/books" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
          → Recommended books on dividend investing
        </Link>
      </div>
    </div>
  )
}
