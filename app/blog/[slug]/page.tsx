import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPost } from '@/lib/blog'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | DividendVisual`,
      description: post.description,
      url: `https://dividendvisual.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    url: `https://dividendvisual.com/blog/${slug}`,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: post.title },
      ]} />

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#71717a]">{formatDate(post.date)}</span>
          <span className="text-[#1e1e2e]">·</span>
          <span className="text-xs text-[#71717a]">{post.readingTime} min read</span>
          {post.tags.map((tag) => (
            <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-[#f4f4f5] leading-tight mb-4">{post.title}</h1>
        <p className="text-[#71717a] text-lg leading-relaxed">{post.description}</p>
      </header>

      {/* Content */}
      <article className="prose-dv">
        <MDXRemote source={post.content} />
      </article>

      {/* Footer CTA */}
      <div className="mt-12 pt-8 border-t border-[#1e1e2e]">
        <p className="text-sm text-[#71717a] mb-4">See the Weiss valuation chart for any dividend stock:</p>
        <div className="flex flex-wrap gap-2">
          {['KO', 'JNJ', 'PG', 'MO', 'O'].map((sym) => (
            <Link
              key={sym}
              href={`/ticker/${sym}`}
              className="px-3 py-1.5 rounded-md bg-[#1e1e2e] text-sm font-mono text-[#f4f4f5] hover:bg-[#6366f1]/20 hover:text-[#6366f1] transition-colors"
            >
              {sym}
            </Link>
          ))}
          <Link
            href="/watchlist"
            className="px-3 py-1.5 rounded-md bg-[#6366f1]/10 text-sm text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors"
          >
            View all stocks →
          </Link>
        </div>
      </div>
    </div>
  )
}
