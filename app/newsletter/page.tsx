import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'

const PAGE_URL = 'https://dividendvisual.com/newsletter'

export const metadata: Metadata = {
  title: 'Weekly Undervalued Dividend Watchlist | DividendVisual',
  description:
    'Get a free weekly email with dividend stocks entering historically attractive yield territory, ranked by quality score, payout safety, and Weiss valuation signal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Weekly Undervalued Dividend Watchlist | DividendVisual',
    description:
      'A concise weekly watchlist of quality dividend stocks trading near historically attractive yields.',
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekly Undervalued Dividend Watchlist | DividendVisual',
    description:
      'Dividend stocks entering historically attractive yield zones, ranked by quality and payout safety.',
  },
}

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Undervalued signals',
    description:
      'Stocks whose current yield is near the top of their 10-year historical range by the Geraldine Weiss method.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality filter',
    description:
      'Each idea is paired with quality score context, payout coverage, dividend streak, and dividend growth data.',
  },
  {
    icon: BarChart3,
    title: 'Research links',
    description:
      'Jump from the email straight into DividendVisual charts, peer comparisons, and full ticker analysis.',
  },
]

const FAQ = [
  {
    q: 'What is included in the weekly watchlist?',
    a: 'A short list of dividend stocks with elevated historical yields, plus quality score, payout context, risk notes, and links to the full DividendVisual analysis.',
  },
  {
    q: 'Is this a stock recommendation service?',
    a: 'No. The newsletter is educational research only. It highlights valuation and dividend quality signals so you can do your own due diligence.',
  },
  {
    q: 'How often is it sent?',
    a: 'Once per week. The goal is a concise research habit, not another noisy market email.',
  },
]

const SAMPLE_ISSUE = [
  {
    step: '01',
    title: 'What moved into attractive territory',
    description: 'A focused watchlist of dividend stocks whose current yield is elevated versus their own history.',
  },
  {
    step: '02',
    title: 'Why the yield may be high',
    description: 'Business context that helps distinguish a valuation opportunity from a deteriorating dividend.',
  },
  {
    step: '03',
    title: 'What to verify next',
    description: 'Payout coverage, dividend growth, quality score, and direct links to the underlying research.',
  },
]

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export default function NewsletterPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Newsletter' },
      ]} />

      <section className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#22c55e]">
            <Bell className="h-3.5 w-3.5" />
            Free weekly dividend research
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-[#f4f4f5]">
            Weekly Undervalued Dividend Watchlist
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#a1a1aa]">
            Get a concise weekly email with dividend stocks entering historically attractive yield territory,
            ranked by quality score, payout safety, and Weiss valuation signal.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { value: '150+', label: 'stocks tracked' },
              { value: '10Y', label: 'yield history' },
              { value: '1x', label: 'email per week' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
                <p className="text-2xl font-semibold text-[#f4f4f5]">{value}</p>
                <p className="mt-1 text-xs text-[#71717a]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <DividendAlertsCTA
            source="newsletter"
            title="Get the weekly watchlist"
            description="Quality dividend stocks moving into historically attractive yield territory, delivered once per week."
          />
        </div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#818cf8]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-[#f4f4f5]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{description}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-xl border border-[#1e1e2e] bg-[#111118] p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#818cf8]">Inside each issue</p>
          <h2 className="mt-3 text-2xl font-bold text-[#f4f4f5]">A research brief you can scan in five minutes</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
            Each edition starts with the signal, explains the risk behind it, and ends with the checks needed for your own due diligence. No price targets and no automatic buy calls.
          </p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {SAMPLE_ISSUE.map((item) => (
            <div key={item.step} className="rounded-lg border border-[#27273a] bg-[#09090b] p-5">
              <p className="font-mono text-xs font-semibold text-[#6366f1]">{item.step}</p>
              <h3 className="mt-3 text-sm font-semibold text-[#f4f4f5]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-2xl font-bold text-[#f4f4f5]">Built for patient income investors</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#a1a1aa]">
            <p>
              DividendVisual tracks dividend stocks through their own yield history. When a stock&apos;s yield
              rises toward the high end of its historical range, the price may be unusually attractive relative
              to the income it pays.
            </p>
            <p>
              The watchlist does not stop at yield. Every signal is paired with dividend quality context so
              high-yield traps do not crowd out stronger long-term income candidates.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">Start researching</p>
          <div className="mt-4 space-y-3">
            {[
              { href: '/dividend-screener', label: 'Dividend Screener' },
              { href: '/undervalued-dividend-stocks', label: 'Undervalued Stocks' },
              { href: '/methodology', label: 'Methodology' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md border border-[#2e2e3e] px-3 py-2 text-sm text-[#a1a1aa] transition-colors hover:border-[#6366f1]/40 hover:text-[#f4f4f5]"
              >
                {item.label} -&gt;
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-[#f4f4f5]">Newsletter FAQ</h2>
        <div className="mt-5 space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-[#f4f4f5]">{q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-[#71717a]">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
