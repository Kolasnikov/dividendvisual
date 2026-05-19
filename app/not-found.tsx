import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-[#6366f1] mb-4">404</p>
      <h1 className="text-2xl font-bold text-[#f4f4f5] mb-3">Page not found</h1>
      <p className="text-[#71717a] text-sm max-w-sm mb-8">
        This ticker, page, or URL doesn&apos;t exist on DividendVisual. It may have moved or never existed.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/watchlist"
          className="px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#818cf8] transition-colors"
        >
          Browse all stocks
        </Link>
        <Link
          href="/undervalued-dividend-stocks"
          className="px-4 py-2 rounded-lg bg-[#1e1e2e] text-[#f4f4f5] text-sm font-medium hover:bg-[#27273a] transition-colors"
        >
          View opportunities
        </Link>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-[#71717a] text-sm font-medium hover:text-[#f4f4f5] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
