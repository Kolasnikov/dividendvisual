import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Best Brokers for Dividend Investing — Commission-Free Stocks | DividendVisual',
  description:
    'Where to buy the dividend stocks you find on DividendVisual. eToro offers commission-free stocks with a €50 minimum — a low-friction way to start building a dividend portfolio.',
  alternates: {
    canonical: 'https://dividendvisual.com/resources/brokers',
  },
  openGraph: {
    title: 'Best Brokers for Dividend Investing | DividendVisual',
    description: 'Commission-free brokers for buy-and-hold dividend investors. Start with €50 on eToro.',
    url: 'https://dividendvisual.com/resources/brokers',
  },
}

const BROKERS = [
  {
    name: 'eToro',
    url: 'etoro.com',
    href: 'https://med.etoro.com/B22260_A129812_TClick_SDivVisual.aspx',
    tag: 'Commission-free',
    highlight: true,
    cta: 'Open an account on eToro',
    description:
      "The most accessible entry point for investors who discover a stock on DividendVisual and want to act on it. No commission on stocks, €50 minimum deposit, and fractional shares — meaning you can reinvest dividends immediately regardless of the stock price. eToro is well-known and regulated across Europe. The Copy Trading feature lets beginners mirror experienced dividend investors while building their own portfolio.",
    features: ['No stock commission', '€50 minimum', 'Fractional shares', 'Copy trading'],
  },
  {
    name: 'Interactive Brokers',
    url: 'interactivebrokers.com',
    href: 'https://www.interactivebrokers.com',
    tag: 'Professional',
    highlight: false,
    cta: 'Visit Interactive Brokers',
    description:
      "The preferred broker for serious, high-volume investors. Extremely low margin rates, access to international markets, and sophisticated order types. DRIP is supported on most dividend stocks. The platform is not beginner-friendly — the interface is dense and the account setup is involved — but execution quality and pricing are hard to beat once you're past the learning curve.",
    features: ['Ultra-low commissions', 'Global markets', 'DRIP support', 'Advanced tools'],
  },
  {
    name: 'Charles Schwab',
    url: 'schwab.com',
    href: 'https://www.schwab.com',
    tag: 'Full-service',
    highlight: false,
    cta: 'Visit Charles Schwab',
    description:
      "A trusted full-service broker with 50+ years of history. No account minimum, commission-free US stocks, and automatic DRIP enrollment on most dividend-paying stocks. Strong research tools and a clean interface make it a solid choice for long-term dividend investors who want a reliable, established platform without complexity.",
    features: ['No account minimum', 'Commission-free US stocks', 'DRIP enrollment', 'Strong research'],
  },
]

export default function BrokersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/resources' },
        { label: 'Brokers' },
      ]} />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-4">Brokers for Dividend Investing</h1>
        <p className="text-[#71717a] text-sm leading-relaxed max-w-xl">
          DividendVisual tells you which stocks are historically undervalued. These brokers are where
          you act on it. The right choice depends on where you are: eToro for a low-friction start,
          Interactive Brokers for scale and sophistication.
        </p>
        <p className="mt-5 text-xs text-[#3e3e4e] leading-relaxed border border-[#1e1e2e] rounded-lg px-4 py-3">
          This page contains affiliate links. DividendVisual may earn a commission if you open an
          account via these links, at no cost to you. Recommendations reflect genuine editorial
          judgment. Investing involves risk — capital at risk.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {BROKERS.map((broker) => (
          <div
            key={broker.name}
            className={`bg-[#111118] border rounded-xl p-6 ${
              broker.highlight ? 'border-[#22c55e]/35' : 'border-[#1e1e2e]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  broker.highlight
                    ? 'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10'
                    : 'text-[#52525b] border-[#2e2e3e] bg-[#1e1e2e]'
                }`}
              >
                {broker.tag}
              </span>
              {broker.highlight && (
                <span className="text-[10px] text-[#22c55e]">Recommended for DividendVisual users</span>
              )}
            </div>

            <h2 className="text-base font-semibold text-[#f4f4f5] leading-snug">{broker.name}</h2>
            <p className="text-xs text-[#52525b] mt-0.5 mb-3">{broker.url}</p>
            <p className="text-sm text-[#71717a] leading-relaxed mb-4">{broker.description}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {broker.features.map((feat) => (
                <span
                  key={feat}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    broker.highlight
                      ? 'text-[#22c55e] border-[#22c55e]/20 bg-[#22c55e]/5'
                      : 'text-[#52525b] border-[#2e2e3e]'
                  }`}
                >
                  {feat}
                </span>
              ))}
            </div>

            <a
              href={broker.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                broker.highlight
                  ? 'bg-[#22c55e] text-[#07130b] hover:bg-[#4ade80]'
                  : 'border border-[#2e2e3e] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#6366f1]/40'
              }`}
            >
              {broker.cta} ↗
            </a>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
        <p className="text-xs text-[#3e3e4e] leading-relaxed mb-4">
          Links may be affiliate links. DividendVisual may earn a commission on qualifying
          sign-ups. Capital at risk — past performance does not guarantee future results.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/resources/tools" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
            → Research tools (TradingView, FinViz, Morningstar)
          </Link>
          <Link href="/resources/books" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
            → Recommended books on dividend investing
          </Link>
        </div>
      </div>
    </div>
  )
}
