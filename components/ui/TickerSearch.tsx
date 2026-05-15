'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import type { SearchResult } from '@/lib/types'

interface TickerSearchProps {
  placeholder?: string
  size?: 'md' | 'lg'
}

export function TickerSearch({ placeholder = 'Search ticker or company...', size = 'md' }: TickerSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResult[] = await res.json()
        setResults(data)
        setOpen(data.length > 0)
        setActiveIndex(-1)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function navigate(symbol: string) {
    setOpen(false)
    setQuery('')
    router.push(`/ticker/${symbol}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = activeIndex >= 0 ? results[activeIndex] : results[0]
      if (target) navigate(target.symbol)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const inputClass = size === 'lg'
    ? 'w-full bg-[#111118] border border-[#1e1e2e] rounded-xl pl-12 pr-4 py-4 text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#6366f1] text-base transition-colors'
    : 'w-full bg-[#111118] border border-[#1e1e2e] rounded-lg pl-10 pr-4 py-2.5 text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#6366f1] text-sm transition-colors'

  const iconClass = size === 'lg' ? 'w-5 h-5 left-4' : 'w-4 h-4 left-3'

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 text-[#71717a] ${iconClass}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={inputClass}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#111118] border border-[#1e1e2e] rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onMouseDown={() => navigate(r.symbol)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === activeIndex ? 'bg-[#1e1e2e]' : 'hover:bg-[#1e1e2e]/50'
              } ${i > 0 ? 'border-t border-[#1e1e2e]' : ''}`}
            >
              <span className="font-mono font-semibold text-[#6366f1] w-14 shrink-0">{r.symbol}</span>
              <span className="text-[#f4f4f5] text-sm truncate flex-1">{r.name}</span>
              {r.sector && (
                <span className="text-xs text-[#71717a] shrink-0">{r.sector}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
