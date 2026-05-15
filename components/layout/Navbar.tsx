'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/collections/dividend-kings', label: 'Collections' },
  { href: '/blog', label: 'Blog' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="border-b border-[#1e1e2e] bg-[#09090b]/95 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="group">
          <span className="font-bold text-[#f4f4f5] tracking-tight text-2xl">
            Dividend<span className="text-[#6366f1]">Visual</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-[#1e1e2e] text-[#f4f4f5]'
                  : 'text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1e1e2e]/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
