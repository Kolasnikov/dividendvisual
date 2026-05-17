'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { PostMeta } from '@/lib/blog'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim()
}

function labelTag(tag: string): string {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Props {
  posts: PostMeta[]
}

export function BlogIndexClient({ posts }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Collect all unique tags (normalized) with their original label and count
  const tagMap = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>()
    for (const post of posts) {
      for (const tag of post.tags) {
        const key = normalizeTag(tag)
        const existing = map.get(key)
        if (existing) {
          existing.count++
        } else {
          map.set(key, { label: labelTag(tag), count: 1 })
        }
      }
    }
    return map
  }, [posts])

  // Only show tags that appear on 2+ posts
  const tags = useMemo(
    () =>
      [...tagMap.entries()]
        .filter(([, v]) => v.count >= 2)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([key, v]) => ({ key, label: v.label, count: v.count })),
    [tagMap],
  )

  const filtered = useMemo(() => {
    if (!activeTag) return posts
    return posts.filter((p) => p.tags.some((t) => normalizeTag(t) === activeTag))
  }, [posts, activeTag])

  return (
    <>
      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTag === null
                ? 'bg-[#6366f1] text-white'
                : 'bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5]'
            }`}
          >
            All
          </button>
          {tags.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTag(activeTag === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTag === key
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#1e1e2e] text-[#71717a] hover:text-[#f4f4f5]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Post list */}
      {filtered.length === 0 ? (
        <p className="text-[#71717a] text-sm">No posts match this filter.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-colors group"
            >
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mb-3">
                <span className="text-xs text-[#71717a]">{formatDate(post.date)}</span>
                <span className="text-[#1e1e2e]">·</span>
                <span className="text-xs text-[#71717a]">{post.readingTime} min read</span>
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20"
                  >
                    {labelTag(tag)}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-semibold text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-[#71717a] leading-relaxed">{post.description}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
