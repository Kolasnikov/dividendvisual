import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, BookOpen, Search, TrendingUp } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Subscription Confirmed | DividendVisual',
  description:
    'You are subscribed to the DividendVisual weekly undervalued dividend watchlist. Start with the screener, methodology, and current opportunities.',
  alternates: {
    canonical: 'https://dividendvisual.com/newsletter/confirmed',
  },
  robots: {
    index: false,
    follow: true,
  },
}

const NEXT_STEPS = [
  {
    href: '/dividend-screener',
    icon: Search,
    title: 'Open the dividend screener',
    description: 'Filter stocks by Weiss signal, quality score, yield, payout ratio, sector, and dividend growth.',
  },
  {
    href: '/undervalued-dividend-stocks',
    icon: TrendingUp,
    title: 'See current opportunities',
    description: 'Review stocks currently trading near historically attractive dividend yields.',
  },
  {
    href: '/methodology',
    icon: BookOpen,
    title: 'Read the methodology',
    description: 'Understand how DividendVisual calculates valuation bands, quality score, and signal strength.',
  },
]

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; symbol?: string }>
}) {
  const { source, symbol } = await searchParams
  const sourceLabel = source ? source.replace(/-/g, ' ') : 'DividendVisual'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Newsletter', href: '/newsletter' },
        { label: 'Confirmed' },
      ]} />

      <section className="rounded-xl border border-[#22c55e]/25 bg-[#111118] p-6 sm:p-8">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold leading-tight text-[#f4f4f5]">
          You&apos;re on the weekly watchlist
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#a1a1aa]">
          Check your inbox for the welcome email. Every Friday, you&apos;ll get a concise list of dividend
          stocks entering or remaining in historically attractive yield territory, ranked by quality and payout context.
        </p>
        <p className="mt-3 text-xs text-[#52525b]">
          Signup source: {sourceLabel}{symbol ? ` · ${symbol.toUpperCase()}` : ''}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[#f4f4f5]">Start here while you wait</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {NEXT_STEPS.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-[#1e1e2e] bg-[#111118] p-5 transition-colors hover:border-[#6366f1]/40"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#818cf8]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#f4f4f5] group-hover:text-[#818cf8]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-[#1e1e2e] bg-[#09090b] p-5">
        <p className="text-sm font-semibold text-[#f4f4f5]">What to expect</p>
        <div className="mt-4 grid gap-3 text-sm text-[#71717a] sm:grid-cols-3">
          <p>Top undervalued setups by quality score.</p>
          <p>Yield trap watch for high-yield names that need caution.</p>
          <p>One short dividend investing insight each week.</p>
        </div>
      </section>
    </div>
  )
}
