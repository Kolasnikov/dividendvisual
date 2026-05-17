import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { BlogIndexClient } from '@/components/blog/BlogIndexClient'

export const metadata: Metadata = {
  title: 'Dividend Investing Blog — Guides, Analysis & Strategy',
  description: 'In-depth guides on dividend investing, the Geraldine Weiss method, dividend valuation, and income stock analysis. Learn how to find undervalued dividend stocks.',
  openGraph: {
    title: 'Dividend Investing Blog | DividendVisual',
    description: 'In-depth guides on dividend investing, the Geraldine Weiss method, and income stock analysis.',
    url: 'https://dividendvisual.com/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-3">Dividend Investing Blog</h1>
        <p className="text-[#71717a]">
          Guides, analysis, and strategy for income investors — built around the Geraldine Weiss dividend valuation method.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-[#71717a]">No posts yet.</p>
      ) : (
        <BlogIndexClient posts={posts} />
      )}
    </div>
  )
}
