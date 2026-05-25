import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Resources for Dividend Investors | DividendVisual',
  description:
    'Curated books, research tools, and brokers for serious dividend investors — from foundational texts on value investing to commission-free brokers for acting on Weiss signals.',
  alternates: {
    canonical: 'https://dividendvisual.com/resources',
  },
  openGraph: {
    title: 'Resources for Dividend Investors | DividendVisual',
    description: 'Books, tools, and brokers that complement the DividendVisual approach.',
    url: 'https://dividendvisual.com/resources',
  },
}

export default function ResourcesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Resources' },
      ]} />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-4">Resources</h1>
        <p className="text-[#71717a] text-sm leading-relaxed max-w-xl">
          Books, research tools, and brokers that complement the DividendVisual approach — curated, not generic.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          href="/resources/books"
          className="group bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-colors"
        >
          <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wide mb-3">Books</p>
          <h2 className="text-base font-semibold text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors mb-2">
            Recommended Reading
          </h2>
          <p className="text-sm text-[#71717a] leading-relaxed">
            Five books on dividend valuation, quality investing, and the Weiss method — from Graham to Kelley Wright.
          </p>
          <p className="mt-4 text-sm text-[#6366f1] group-hover:text-[#818cf8] transition-colors">
            Browse books →
          </p>
        </Link>

        <Link
          href="/resources/tools"
          className="group bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-colors"
        >
          <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wide mb-3">Tools</p>
          <h2 className="text-base font-semibold text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors mb-2">
            Research Tools
          </h2>
          <p className="text-sm text-[#71717a] leading-relaxed">
            TradingView and FinViz for technical charts and fundamental due diligence after the Weiss signal fires.
          </p>
          <p className="mt-4 text-sm text-[#6366f1] group-hover:text-[#818cf8] transition-colors">
            Browse tools →
          </p>
        </Link>

        <Link
          href="/resources/brokers"
          className="group bg-[#111118] border border-[#22c55e]/20 rounded-xl p-6 hover:border-[#22c55e]/40 transition-colors"
        >
          <p className="text-[10px] font-semibold text-[#22c55e] uppercase tracking-wide mb-3">Brokers</p>
          <h2 className="text-base font-semibold text-[#f4f4f5] group-hover:text-[#22c55e] transition-colors mb-2">
            Where to Invest
          </h2>
          <p className="text-sm text-[#71717a] leading-relaxed">
            Commission-free brokers for acting on Weiss signals. eToro lets you start with €50 and buy fractional shares.
          </p>
          <p className="mt-4 text-sm text-[#22c55e] group-hover:text-[#4ade80] transition-colors">
            Browse brokers →
          </p>
        </Link>
      </div>
    </div>
  )
}
