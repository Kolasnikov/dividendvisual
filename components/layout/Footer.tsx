import Link from 'next/link'

const TOOL_LINKS = [
  { href: '/dividend-screener',            label: 'Screener' },
  { href: '/best-dividend-stocks',         label: 'Best Dividend Stocks' },
  { href: '/undervalued-dividend-stocks',  label: 'Opportunities' },
  { href: '/portfolio',                    label: 'Portfolio Tracker' },
  { href: '/drip-calculator',              label: 'DRIP Calculator' },
  { href: '/newsletter',                   label: 'Newsletter' },
  { href: '/support',                      label: 'Support' },
  { href: '/glossary',                     label: 'Glossary' },
  { href: '/methodology',                  label: 'Methodology' },
  { href: '/about',                        label: 'About' },
  { href: '/blog',                         label: 'Blog' },
]

const COLLECTION_LINKS = [
  { href: '/dividend-kings',                    label: 'Dividend Kings' },
  { href: '/dividend-aristocrats',              label: 'Aristocrats' },
  { href: '/best-utility-dividend-stocks',      label: 'Utilities' },
  { href: '/best-reit-dividend-stocks',         label: 'REITs' },
  { href: '/high-yield-dividend-stocks',        label: 'High Yield' },
  { href: '/best-monthly-dividend-stocks',      label: 'Monthly Payers' },
]

const LEARN_LINKS = [
  { href: '/methodology',                                    label: 'How It Works' },
  { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'Weiss Method' },
  { href: '/blog/how-to-find-undervalued-dividend-stocks',   label: 'Find Undervalued Stocks' },
  { href: '/blog/dividend-yield-trap',                       label: 'The Yield Trap' },
  { href: '/blog/dividend-kings-list-analysis',              label: 'Dividend Kings' },
  { href: '/blog/dividend-aristocrats-vs-kings',             label: 'Aristocrats vs Kings' },
  { href: '/resources/books',                                label: 'Books' },
  { href: '/resources/tools',                                label: 'Tools' },
  { href: '/resources/brokers',                              label: 'Brokers' },
]

export function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] mt-8 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="font-bold text-[#f4f4f5] text-lg tracking-tight">
                Dividend<span className="text-[#6366f1]">Visual</span>
              </span>
            </Link>
            <p className="text-xs text-[#52525b] leading-relaxed max-w-[180px]">
              Visual dividend valuation for serious income investors.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider mb-4">Tool</p>
            <div className="flex flex-col gap-2.5">
              {TOOL_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm text-[#71717a] hover:text-[#f4f4f5] transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider mb-4">Collections</p>
            <div className="flex flex-col gap-2.5">
              {COLLECTION_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm text-[#71717a] hover:text-[#f4f4f5] transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider mb-4">Learn</p>
            <div className="flex flex-col gap-2.5">
              {LEARN_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm text-[#71717a] hover:text-[#f4f4f5] transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-[#1e1e2e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#52525b]">© 2026 DividendVisual. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about"   className="text-xs text-[#3e3e4e] hover:text-[#71717a] transition-colors">About</Link>
            <Link href="/privacy" className="text-xs text-[#3e3e4e] hover:text-[#71717a] transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-xs text-[#3e3e4e] hover:text-[#71717a] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
