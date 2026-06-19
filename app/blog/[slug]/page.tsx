import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getAllPosts, getPost } from '@/lib/blog'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { DividendAlertsCTA } from '@/components/seo/DividendAlertsCTA'

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
    alternates: {
      canonical: `https://dividendvisual.com/blog/${slug}`,
    },
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

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function getRelatedPosts(currentSlug: string, currentTags: string[], count = 3) {
  const normalize = (t: string) => t.toLowerCase().trim()
  const currentNorm = new Set(currentTags.map(normalize))
  return getAllPosts()
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({
      ...p,
      overlap: p.tags.filter((t) => currentNorm.has(normalize(t))).length,
    }))
    .sort((a, b) => b.overlap - a.overlap || new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const related = getRelatedPosts(slug, post.tags)
  const modifiedDate = post.updated ?? post.date

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: modifiedDate,
    author: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
    url: `https://dividendvisual.com/blog/${slug}`,
    isAccessibleForFree: true,
  }
  const faqJsonLd = post.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      ) : null}

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: post.title },
      ]} />

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#71717a]">{formatDate(post.date)}</span>
          {post.updated ? (
            <>
              <span className="text-[#1e1e2e]">·</span>
              <span className="text-xs text-[#71717a]">Updated {formatDate(post.updated)}</span>
            </>
          ) : null}
          <span className="text-[#1e1e2e]">·</span>
          <span className="text-xs text-[#71717a]">DividendVisual Research</span>
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
        <div className="mt-5 rounded-lg border border-[#1e1e2e] bg-[#111118] px-4 py-3">
          <p className="text-xs leading-relaxed text-[#71717a]">
            Published by DividendVisual Research for educational purposes. We use historical dividend,
            price, payout, and cash-flow data to explain dividend valuation concepts; nothing here is
            investment, tax, or financial advice.
          </p>
        </div>
      </header>

      <div className="mb-10">
        <DividendAlertsCTA
          source="blog"
          title="Want the weekly undervalued dividend list?"
          description="Get a concise email with dividend stocks moving into historically attractive yield territory, plus the methodology links behind each signal."
          compact
        />
      </div>

      {/* Content */}
      <article className="prose-dv">
        <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>

      {post.faq?.length ? (
        <section className="mt-12 border-t border-[#1e1e2e] pt-8">
          <h2 className="text-2xl font-bold text-[#f4f4f5] mb-6">{post.faqTitle ?? 'Frequently Asked Questions'}</h2>
          <div className="space-y-6">
            {post.faq.map((item) => (
              <div key={item.question}>
                <h3 className="text-base font-semibold text-[#f4f4f5]">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a1a1aa]">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

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
            href="/dividend-screener"
            className="px-3 py-1.5 rounded-md bg-[#6366f1]/10 text-sm text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors"
          >
            View all stocks →
          </Link>
        </div>
        <p className="mt-4">
          <a
            href="https://www.tradingview.com/?aff_id=166728&aff_sub=blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#52525b] hover:text-[#71717a] transition-colors"
          >
            Full charts &amp; technical analysis on TradingView ↗
          </a>
        </p>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[#1e1e2e]">
          <p className="text-xs text-[#71717a] uppercase tracking-wide mb-5">Related articles</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#6366f1]/40 transition-colors group"
              >
                <p className="text-xs text-[#71717a] mb-2">{p.readingTime} min read</p>
                <p className="text-sm font-semibold text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors leading-snug">
                  {p.title}
                </p>
              </Link>
            ))}
          </div>
          <Link href="/blog" className="inline-block mt-5 text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
            ← All articles
          </Link>
        </div>
      )}
    </div>
  )
}
