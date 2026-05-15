import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Dividend Investing Blog — Guides, Analysis & Strategy',
  description: 'In-depth guides on dividend investing, the Geraldine Weiss method, dividend valuation, and income stock analysis. Learn how to find undervalued dividend stocks.',
  openGraph: {
    title: 'Dividend Investing Blog | DividendVisual',
    description: 'In-depth guides on dividend investing, the Geraldine Weiss method, and income stock analysis.',
    url: 'https://dividendvisual.com/blog',
  },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-3">Dividend Investing Blog</h1>
        <p className="text-[#71717a]">
          Guides, analysis, and strategy for income investors — built around the Geraldine Weiss dividend valuation method.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-[#71717a]">No posts yet.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-[#71717a]">{formatDate(post.date)}</span>
                <span className="text-[#1e1e2e]">·</span>
                <span className="text-xs text-[#71717a]">{post.readingTime} min read</span>
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">
                    {tag}
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
    </div>
  )
}
