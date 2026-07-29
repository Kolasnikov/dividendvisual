import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackNewsletterLanding } from '@/components/analytics/TrackNewsletterLanding'
import { TrackedOutboundLink } from '@/components/analytics/TrackedOutboundLink'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Dividend Investing Books — Recommended Reading | DividendVisual',
  description:
    "A curated reading list for serious dividend investors — from Graham's foundational value framework to Kelley Wright's modern update of the Weiss method.",
  alternates: {
    canonical: 'https://dividendvisual.com/resources/books',
  },
  openGraph: {
    title: 'Dividend Investing Books | DividendVisual',
    description: 'Five books that shaped the philosophy behind DividendVisual — curated, not generic.',
    url: 'https://dividendvisual.com/resources/books',
  },
}

const BOOKS = [
  {
    title: 'The Little Book of Big Dividends',
    author: 'Charles B. Carlson',
    href: 'https://amzn.to/3PMOvyT',
    description:
      "A practical, no-nonsense guide to building a dividend portfolio using a systematic approach. Carlson's BSD method shares DNA with the Weiss philosophy: buy quality companies when they're cheap, hold them, reinvest. Short chapters, actionable framework.",
    tag: 'Practical',
  },
  {
    title: 'Get Rich with Dividends',
    author: 'Marc Lichtenfeld',
    href: 'https://amzn.to/3RejowI',
    description:
      "Focused on dividend growth rather than yield alone. Complements the Weiss method — once you've identified undervalued stocks, Lichtenfeld's framework helps think about long-term income compounding. Good companion read after understanding valuation.",
    tag: 'Growth',
  },
  {
    title: 'The Single Best Investment',
    author: 'Lowell Miller',
    href: 'https://amzn.to/492JZ5Y',
    description:
      'Miller argues that owning high-quality, growing dividend payers is the single best long-term investment strategy available to individual investors. Dense but rewarding — the philosophical backbone of quality-focused income investing.',
    tag: 'Philosophy',
  },
  {
    title: "Dividends Still Don't Lie",
    author: 'Kelley Wright',
    href: 'https://amzn.to/4frK0UO',
    description:
      "Kelley Wright's update of the original Geraldine Weiss framework for the modern market. If you've spent time on DividendVisual, this is the natural next step — it goes deeper into the yield-based valuation method this tool is built on.",
    tag: 'Weiss Method',
    highlight: true,
  },
  {
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    href: 'https://amzn.to/4wFjptO',
    description:
      "Graham's foundational text on value investing. The intellectual foundation behind every serious long-term investor — including Weiss herself. Chapters 8 and 20 alone are worth the read. Not dividend-specific, but the margin-of-safety principle underlies everything.",
    tag: 'Foundation',
  },
]

export default function BooksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <TrackNewsletterLanding landing="resources-books" />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/resources' },
        { label: 'Books' },
      ]} />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-4">Recommended Reading</h1>
        <p className="text-[#71717a] text-sm leading-relaxed max-w-xl">
          Five books that shaped the philosophy behind DividendVisual. Not a generic affiliate list —
          these are the texts I return to when thinking about dividend valuation, quality, and
          long-term income compounding. Start with <em>Dividends Still Don&apos;t Lie</em> if you
          want to go deeper into the Weiss method specifically.
        </p>
        <p className="mt-5 text-xs text-[#3e3e4e] leading-relaxed border border-[#1e1e2e] rounded-lg px-4 py-3">
          This page contains affiliate links. If you purchase through these links, DividendVisual
          may earn a small commission at no extra cost to you.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {BOOKS.map((book) => (
          <div
            key={book.href}
            className={`bg-[#111118] border rounded-xl p-6 ${
              book.highlight ? 'border-[#6366f1]/40' : 'border-[#1e1e2e]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  book.highlight
                    ? 'text-[#6366f1] border-[#6366f1]/30 bg-[#6366f1]/10'
                    : 'text-[#52525b] border-[#2e2e3e] bg-[#1e1e2e]'
                }`}
              >
                {book.tag}
              </span>
              {book.highlight && (
                <span className="text-[10px] text-[#6366f1]">Directly related to the Weiss method</span>
              )}
            </div>
            <h2 className="text-base font-semibold text-[#f4f4f5] leading-snug">{book.title}</h2>
            <p className="text-xs text-[#52525b] mt-0.5 mb-3">{book.author}</p>
            <p className="text-sm text-[#71717a] leading-relaxed mb-4">{book.description}</p>
            <TrackedOutboundLink
              href={`/go/amazon?url=${encodeURIComponent(book.href)}&placement=resources-books`}
              target="_blank"
              rel="noopener"
              event="affiliate_resource_clicked"
              properties={{ kind: 'book', resource: book.title }}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-[#2e2e3e] text-sm text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#6366f1]/40 transition-colors"
            >
              View on Amazon ↗
            </TrackedOutboundLink>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
        <p className="text-xs text-[#3e3e4e] leading-relaxed mb-4">
          All links go to Amazon via affiliate links. DividendVisual may earn a commission on
          qualifying purchases. Recommendations reflect genuine editorial judgment — no publisher
          relationships or paid placements.
        </p>
        <Link href="/resources/tools" className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
          → Research tools (TradingView, FinViz)
        </Link>
      </div>
    </div>
  )
}
