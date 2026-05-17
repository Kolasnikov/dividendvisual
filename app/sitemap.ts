import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { COMPARE_PAIRS } from '@/app/compare/[pair]/page'
import { SECTOR_SLUGS } from '@/app/sector/[sector]/page'

const BASE = 'https://dividendvisual.com'

const TICKERS = [
  // Original universe
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
  'TXN', 'MSFT', 'ECL', 'ATO',
  // Dividend Kings (new)
  'AWR', 'DOV', 'CINF', 'NDSN', 'LANC', 'GWW', 'PPG', 'RPM', 'MSA', 'NUE', 'CBSH',
  // Dividend Aristocrats (new)
  'SHW', 'ED', 'ADP', 'SPGI', 'CHD', 'ROP', 'AOS', 'EXPD', 'PAYX', 'BRO',
  // Consumer
  'GIS', 'SJM', 'DEO', 'TJX', 'SBUX', 'FAST',
  // Healthcare
  'UNH', 'CVS', 'DGX', 'MCK',
  // Financials
  'BLK', 'ICE', 'CME', 'MMC', 'PNC', 'JPM', 'MTB', 'FITB', 'ALL', 'TRV', 'HBAN',
  // Industrials
  'HON', 'ETN', 'LMT', 'NOC', 'UPS', 'UNP', 'NSC', 'CSX', 'ROK', 'AME',
  // Technology
  'CSCO', 'QCOM', 'AVGO', 'IBM', 'AAPL', 'ACN', 'AMAT',
  // Payments / Fintech
  'V', 'MA', 'AXP', 'SCHW', 'MCO',
  // Consumer Discretionary
  'COST', 'NKE', 'DE',
  // Healthcare / Pharma
  'MRK',
  // Energy
  'OKE', 'PSX', 'VLO', 'EPD',
  // Utilities (new)
  'ETR', 'CMS', 'XEL', 'LNT', 'SRE', 'PNW', 'OGE',
  // REITs (new)
  'PSA', 'DLR', 'PLD', 'STAG', 'EXR', 'MAA', 'OHI', 'IRM', 'ESS',
  // Environmental
  'WM', 'RSG',
]

const COLLECTIONS = [
  'dividend-kings', 'dividend-aristocrats', 'buffett-style',
  'utilities', 'reits', 'high-yield', 'low-payout-compounders',
  'monthly-dividend-payers',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const posts = getAllPosts()

  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/watchlist`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/opportunities`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/drip-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/portfolio`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/resources`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/resources/books`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/resources/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
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

  const comparePairs: MetadataRoute.Sitemap = COMPARE_PAIRS.map(pair => ({
    url: `${BASE}/compare/${pair}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const sectors: MetadataRoute.Sitemap = SECTOR_SLUGS.map((slug) => ({
    url: `${BASE}/sector/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...statics, ...tickers, ...analysis, ...collections, ...blogPosts, ...comparePairs, ...sectors]
}
