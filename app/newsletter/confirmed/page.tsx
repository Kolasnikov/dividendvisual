import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Mail,
  Search,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { NewsletterConfirmedTracking } from '@/components/analytics/NewsletterConfirmedTracking'

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

const EXPECTATIONS = [
  {
    icon: Mail,
    label: 'Welcome email',
    detail: 'The first onboarding email is sent automatically shortly after signup.',
  },
  {
    icon: CalendarDays,
    label: 'Weekly watchlist',
    detail: 'Every Friday, you get undervalued dividend setups ranked by quality and payout context.',
  },
  {
    icon: ShieldCheck,
    label: 'Risk filters',
    detail: 'Each issue includes yield-trap context so high yield does not get mistaken for value.',
  },
]

function cleanParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string | string[]; symbol?: string | string[] }>
}) {
  const params = await searchParams
  const source = cleanParam(params.source)
  const symbol = cleanParam(params.symbol).replace(/[^a-zA-Z.-]/g, '').toUpperCase()
  const sourceLabel = source ? source.replace(/-/g, ' ') : 'DividendVisual'
  const primaryHref = symbol ? `/analysis/${symbol.toLowerCase()}` : '/undervalued-dividend-stocks'
  const primaryLabel = symbol ? `Review ${symbol} analysis` : 'Review current opportunities'
  const primaryDescription = symbol
    ? `Keep going with the full ${symbol} dividend profile, Weiss chart, scoring, payout context, and peer signals.`
    : 'Start with stocks currently trading near historically attractive dividend yields.'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <NewsletterConfirmedTracking source={source} symbol={symbol} />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Newsletter', href: '/newsletter' },
        { label: 'Confirmed' },
      ]} />

      <section className="grid gap-8 rounded-xl border border-[#22c55e]/25 bg-[#111118] p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
            Subscription confirmed
          </p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-[#f4f4f5] sm:text-4xl">
            You&apos;re on the DividendVisual watchlist
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#a1a1aa] sm:text-base">
            Your subscription is active. The welcome sequence will help you read the Weiss valuation
            signal, separate attractive yields from dividend traps, and build a repeatable research workflow.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-5 text-sm font-semibold text-[#04130a] transition-colors hover:bg-[#16a34a]"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#27273a] px-5 text-sm font-semibold text-[#f4f4f5] transition-colors hover:border-[#6366f1]/50"
            >
              <BookOpen className="h-4 w-4" />
              Read methodology
            </Link>
          </div>
          <p className="mt-4 text-xs capitalize text-[#52525b]">
            Signup source: {sourceLabel}{symbol ? ` / ${symbol}` : ''}
          </p>
        </div>

        <div className="rounded-lg border border-[#1e1e2e] bg-[#09090b] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#818cf8]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f4f4f5]">Best next action</p>
              <p className="text-xs text-[#71717a]">Use the site while the first email queues.</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#a1a1aa]">{primaryDescription}</p>
          <Link
            href={primaryHref}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#818cf8] hover:text-[#a5b4fc]"
          >
            Continue research
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {EXPECTATIONS.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-[#f4f4f5]">{label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#818cf8]">Start here</p>
            <h2 className="mt-2 text-xl font-bold text-[#f4f4f5]">Make the newsletter more useful</h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-[#71717a]">
            The best email is easier to read when you already know the screener, the opportunity pages, and the method.
          </p>
        </div>
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

      <section className="mt-10 rounded-lg border border-[#1e1e2e] bg-[#09090b] p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold text-[#f4f4f5]">What the weekly email contains</p>
            <p className="mt-2 text-sm leading-relaxed text-[#71717a]">
              A concise research digest, not a list of random high-yield tickers.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-[#a1a1aa] sm:grid-cols-3">
            <p>Top undervalued setups by quality score.</p>
            <p>Yield-trap watch for names that need caution.</p>
            <p>One short dividend investing insight each week.</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <a
          href="https://www.sharesight.com/dividendvisual/"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-between gap-6 rounded-xl border border-[#1e1e2e] bg-[#111118] px-5 py-4 hover:border-[#6366f1]/40 transition-colors group"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#52525b] mb-1">While you wait for the first email</p>
            <p className="text-sm font-semibold text-[#f4f4f5]">Set up dividend tracking with Sharesight</p>
            <p className="text-xs text-[#71717a] mt-0.5">
              Tracks actual dividends received, DRIP cost basis, and tax reports across multiple brokers.
            </p>
          </div>
          <span className="text-[#6366f1] group-hover:text-[#818cf8] transition-colors text-lg shrink-0">→</span>
        </a>
        <p className="text-[10px] text-[#3e3e4e] mt-2 text-right">
          Affiliate link — DividendVisual may earn a commission at no cost to you.
        </p>
      </section>
    </div>
  )
}
