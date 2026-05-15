import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

const BASE = 'https://dividendvisual.com'

const TICKERS = [
  'KO', 'PEP', 'JNJ', 'PG', 'MMM', 'MCD', 'WMT', 'HD', 'LOW',
  'ABT', 'MDT', 'ABBV', 'XOM', 'CVX', 'T', 'VZ', 'SO', 'DUK',
  'NEE', 'O', 'FRT', 'GPC', 'CLX', 'SYY', 'TGT', 'MO', 'PM',
  'MAIN', 'BEN', 'VFC',
  'KMB', 'CL', 'HRL', 'MKC', 'HSY', 'CPB',
  'BMY', 'PFE', 'AMGN', 'BDX', 'SYK',
  'EMR', 'ITW', 'CTAS', 'GD', 'CAT', 'PH',
  'USB', 'AFL', 'TROW', 'CB', 'AMP',
  'NNN', 'AMT', 'ADC',
  'AWK', 'WEC', 'AEP', 'D',
  'TXN', 'MSFT',
  'ECL', 'ATO',
]

const COLLECTIONS = [
  'dividend-kings', 'dividend-aristocrats', 'buffett-style',
  'utilities', 'reits', 'high-yield', 'low-payout-compounders',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const posts = getAllPosts()

  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/watchlist`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/opportunities`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const tickers: MetadataRoute.Sitemap = TICKERS.map((symbol) => ({
    url: `${BASE}/ticker/${symbol}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const analysis: MetadataRoute.Sitemap = TICKERS.map((symbol) => ({
    url: `${BASE}/analysis/${symbol.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const collections: MetadataRoute.Sitemap = COLLECTIONS.map((slug) => ({
    url: `${BASE}/collections/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...statics, ...tickers, ...analysis, ...collections, ...blogPosts]
}
