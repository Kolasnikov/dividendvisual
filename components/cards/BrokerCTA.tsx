import Link from 'next/link'

// ─── Affiliate link config ────────────────────────────────────────────────────
// Replace each href with your actual affiliate URL from the broker's program.
// IBKR:        https://www.interactivebrokers.com/en/trading/ibkr-affiliate-program.php
// M1 Finance:  https://www.impact.com/marketplace/brand/m1-finance/
// Schwab:      https://www.cj.com (search "Charles Schwab" in CJ Affiliate marketplace)
const BROKERS = [
  {
    name: 'Interactive Brokers',
    tagline: 'Built for serious investors',
    badge: 'Best overall',
    badgeColor: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20',
    // TODO: replace with your IBKR affiliate link
    href: 'https://www.interactivebrokers.com/?utm_source=dividendvisual&utm_medium=referral&utm_campaign=broker-cta',
  },
  {
    name: 'M1 Finance',
    tagline: 'Auto-reinvest dividends (DRIP)',
    badge: 'Best for DRIP',
    badgeColor: 'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/20',
    // TODO: replace with your M1 Finance affiliate link
    href: 'https://m1.finance/?utm_source=dividendvisual&utm_medium=referral&utm_campaign=broker-cta',
  },
  {
    name: 'Charles Schwab',
    tagline: 'Trusted for 50+ years',
    badge: 'No minimums',
    badgeColor: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20',
    // TODO: replace with your Schwab affiliate link
    href: 'https://www.schwab.com/open-an-account?utm_source=dividendvisual&utm_medium=referral&utm_campaign=broker-cta',
  },
]

interface BrokerCTAProps {
  signal: string
  symbol: string
  companyName: string
}

export function BrokerCTA({ signal, symbol, companyName }: BrokerCTAProps) {
  const isUndervalued = signal === 'undervalued'

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      {/* Header */}
      <div className="mb-4">
        {isUndervalued ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-xs font-semibold text-[#22c55e] uppercase tracking-wide">
                In the buy zone
              </span>
            </div>
            <p className="text-sm font-medium text-[#f4f4f5]">
              {symbol} is historically undervalued. Ready to add it to your portfolio?
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-[#71717a] uppercase tracking-wide mb-1">
              Invest in {symbol}
            </p>
            <p className="text-sm font-medium text-[#f4f4f5]">
              Compare brokers to buy {companyName}
            </p>
          </>
        )}
      </div>

      {/* Broker cards */}
      <div className="flex flex-col gap-2">
        {BROKERS.map((broker) => (
          <Link
            key={broker.name}
            href={broker.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#09090b] border border-[#1e1e2e] hover:border-[#6366f1]/40 transition-colors group"
          >
            <div>
              <span className="text-sm font-medium text-[#f4f4f5] group-hover:text-white transition-colors">
                {broker.name}
              </span>
              <p className="text-xs text-[#71717a] mt-0.5">{broker.tagline}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${broker.badgeColor}`}>
                {broker.badge}
              </span>
              <span className="text-[#71717a] group-hover:text-[#6366f1] transition-colors text-sm">→</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-[10px] text-[#3e3e4e] mt-3 leading-relaxed">
        DividendVisual may earn a commission if you open an account via these links, at no cost to you.
        Not financial advice — always do your own research.
      </p>
    </div>
  )
}
