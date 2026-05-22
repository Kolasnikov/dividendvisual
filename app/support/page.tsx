import type { Metadata } from 'next'
import Link from 'next/link'
import { HeartHandshake, Mail, Share2 } from 'lucide-react'
import { TrackNewsletterLanding } from '@/components/analytics/TrackNewsletterLanding'
import { TrackedOutboundLink } from '@/components/analytics/TrackedOutboundLink'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

const PAGE_URL = 'https://dividendvisual.com/support'

const SUPPORT_TIERS = [
  { amount: 5,   url: 'https://buy.stripe.com/cNieVd3KIf1P23E6458bS00' },
  { amount: 15,  url: 'https://buy.stripe.com/4gM00j5SQ3j74bM1NP8bS01' },
  { amount: 25,  url: 'https://buy.stripe.com/dRmcN59522f3gYy0JL8bS02' },
  { amount: 50,  url: 'https://buy.stripe.com/6oU00j3KI9Hv6jU5018bS03' },
  { amount: 100, url: 'https://buy.stripe.com/4gM14n6WU1aZbEe8cd8bS04' },
]

export const metadata: Metadata = {
  title: 'Support DividendVisual',
  description:
    'Support DividendVisual and help keep the free dividend watchlist, Weiss valuation signals, and research data pipeline running.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Support DividendVisual',
    description:
      'Help keep DividendVisual free, independent, and useful for patient dividend research.',
    url: PAGE_URL,
    type: 'website',
  },
}

const SUPPORT_REASONS = [
  'Keep the daily data refresh and quality scoring pipeline running.',
  'Improve the weekly watchlist with better research context and fewer noisy signals.',
  'Build free tools and educational pages without pushing the core rankings behind a paywall too early.',
]

const NON_MONETARY_SUPPORT = [
  {
    icon: Mail,
    title: 'Stay subscribed',
    body: 'Read the weekly watchlist and use the ticker pages when a setup deserves deeper work.',
    href: '/newsletter',
    label: 'Open the newsletter',
  },
  {
    icon: Share2,
    title: 'Share the research',
    body: 'Send a useful chart, screener page, or watchlist issue to an investor who would actually value it.',
    href: '/dividend-screener',
    label: 'Open the screener',
  },
]

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <TrackNewsletterLanding landing="support" />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Support' },
      ]} />

      <header className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#22c55e]">
          Support DividendVisual
        </p>
        <h1 className="text-3xl font-bold leading-tight text-[#f4f4f5] sm:text-4xl">
          Help keep the dividend watchlist free and independent
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#a1a1aa]">
          DividendVisual is built for patient dividend research: daily Weiss valuation signals,
          quality context, and one concise weekly watchlist. Voluntary support helps improve that
          work without turning every useful signal into a sales pitch.
        </p>
      </header>

      <section className="border-y border-[#1e1e2e] py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#f4f4f5]">Become an early supporter</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#71717a]">
              Support is optional. It does not change the methodology, rankings, watchlist order, or
              research coverage. It helps fund the unglamorous part: data refreshes, email delivery,
              hosting, and time spent making the research more useful.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[200px]">
            <p className="text-xs font-medium text-[#52525b] uppercase tracking-wide">Choose an amount</p>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORT_TIERS.slice(0, 3).map(({ amount, url }) => (
                <TrackedOutboundLink
                  key={amount}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="support_checkout_clicked"
                  properties={{ amount }}
                  className="flex items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#111118] px-3 py-2.5 text-sm font-semibold text-[#f4f4f5] transition-colors hover:border-[#22c55e] hover:text-[#22c55e]"
                >
                  ${amount}
                </TrackedOutboundLink>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORT_TIERS.slice(3).map(({ amount, url }) => (
                <TrackedOutboundLink
                  key={amount}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="support_checkout_clicked"
                  properties={{ amount }}
                  className="flex items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#111118] px-3 py-2.5 text-sm font-semibold text-[#f4f4f5] transition-colors hover:border-[#22c55e] hover:text-[#22c55e]"
                >
                  ${amount}
                </TrackedOutboundLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-xl font-semibold text-[#f4f4f5]">What support helps fund</h2>
        <div className="mt-5 space-y-3">
          {SUPPORT_REASONS.map((reason) => (
            <div key={reason} className="flex gap-3 border-b border-[#1e1e2e] pb-3 text-sm leading-relaxed text-[#a1a1aa]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" />
              <p>{reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#1e1e2e] pt-8">
        <h2 className="text-xl font-semibold text-[#f4f4f5]">Other ways to help right now</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {NON_MONETARY_SUPPORT.map(({ icon: Icon, title, body, href, label }) => (
            <div key={title} className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
              <Icon className="h-5 w-5 text-[#818cf8]" />
              <h3 className="mt-4 text-sm font-semibold text-[#f4f4f5]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{body}</p>
              <Link
                href={href}
                className="mt-4 inline-flex text-sm font-medium text-[#6366f1] transition-colors hover:text-[#818cf8]"
              >
                {label} -&gt;
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-[#52525b]">
          DividendVisual is educational research only. Support is voluntary and is not payment for
          personal investment, tax, or financial advice.
        </p>
      </section>
    </div>
  )
}
