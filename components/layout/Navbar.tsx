'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Search, X, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SearchResult } from '@/lib/types'

const NAV_LINKS = [
  { href: '/undervalued-dividend-stocks', label: 'Opportunities' },
  { href: '/dividend-screener', label: 'Screener' },
  { href: '/dividend-stock-comparisons', label: 'Compare' },
  { href: '/dividend-kings', label: 'Kings' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/blog', label: 'Blog' },
]

function NavSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trimmedQuery = query.trim()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (trimmedQuery.length < 1) return

    let ignore = false
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`)
        const data: SearchResult[] = await res.json()
        if (!ignore) {
          setResults(data)
          setOpen(data.length > 0)
          setActiveIndex(-1)
        }
      } catch {
        if (!ignore) setResults([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }, 200)
    return () => {
      ignore = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [trimmedQuery])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [onClose])

  function navigate(symbol: string) {
    setOpen(false); setQuery('')
    router.push(`/ticker/${symbol}`)
    onClose()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); return }
    if (!effectiveOpen) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const t = activeIndex >= 0 ? results[activeIndex] : results[0]; if (t) navigate(t.symbol) }
  }

  const effectiveOpen = trimmedQuery.length > 0 && open && results.length > 0
  const effectiveLoading = trimmedQuery.length > 0 && loading

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search ticker or company..."
          className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#6366f1] transition-colors"
          autoComplete="off"
          spellCheck={false}
        />
        {effectiveLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {effectiveOpen && (
        <div className="absolute top-full mt-2 w-full min-w-[280px] bg-[#111118] border border-[#1e1e2e] rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onMouseDown={() => navigate(r.symbol)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === activeIndex ? 'bg-[#1e1e2e]' : 'hover:bg-[#1e1e2e]/50'
              } ${i > 0 ? 'border-t border-[#1e1e2e]' : ''}`}
            >
              <span className="font-mono font-semibold text-[#6366f1] w-12 shrink-0 text-sm">{r.symbol}</span>
              <span className="text-[#f4f4f5] text-sm truncate flex-1">{r.name}</span>
              {r.sector && <span className="text-xs text-[#71717a] shrink-0 hidden sm:block">{r.sector}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setSearchOpen(true); setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="border-b border-[#1e1e2e] bg-[#09090b]/95 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="group shrink-0">
          <span className="font-bold text-[#f4f4f5] tracking-tight text-2xl">
            Dividend<span className="text-[#6366f1]">Visual</span>
          </span>
        </Link>

        {/* Right side */}
        {searchOpen ? (
          /* Search expanded */
          <div className="flex items-center gap-2 flex-1 justify-end">
            <NavSearch onClose={() => setSearchOpen(false)} />
            <button
              onClick={() => setSearchOpen(false)}
              className="text-[#71717a] hover:text-[#f4f4f5] transition-colors p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-1">
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

            {/* Search icon */}
            <button
              onClick={() => { setSearchOpen(true); setMenuOpen(false) }}
              className="p-1.5 rounded-md text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1e1e2e]/50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="sm:hidden p-1.5 rounded-md text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1e1e2e]/50 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && !searchOpen && (
        <div className="sm:hidden border-t border-[#1e1e2e] bg-[#09090b]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center px-4 py-3 text-sm border-b border-[#1e1e2e] transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-[#f4f4f5] bg-[#1e1e2e]'
                  : 'text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1e1e2e]/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
