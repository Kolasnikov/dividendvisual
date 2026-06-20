import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { COMPARE_PAIRS } from '@/app/compare/[pair]/page'
import { getIndexableSectorSlugs } from '@/lib/sector-mapping'

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
  'buffett-style',
  'low-payout-compounders',
]

const DRIP_TICKERS = ['KO', 'JNJ', 'PG', 'O', 'ABBV', 'HD', 'MO', 'XOM', 'TXN', 'BDX', 'MKC', 'NNN', 'VZ', 'FAST', 'STAG']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const posts = getAllPosts()

  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/dividend-screener`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE}/best-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${BASE}/undervalued-dividend-stocks`, lastModified: now, changeFrequency: 'daily', priority: 0.92 },
    { url: `${BASE}/dividend-stock-comparisons`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/dividend-kings`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/dividend-aristocrats`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/high-yield-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-monthly-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-reit-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-utility-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-healthcare-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-consumer-staples-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-financial-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-industrial-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-technology-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/best-energy-dividend-stocks`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/drip-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/portfolio`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/newsletter`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/support`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/resources`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/resources/books`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/resources/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/resources/brokers`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
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

  const analysis: MetadataRoute.Sitemap = TICKERS.map((symbol) => ({
    url: `${BASE}/analysis/${symbol.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const dripCalculators: MetadataRoute.Sitemap = DRIP_TICKERS.map((symbol) => ({
    url: `${BASE}/drip-calculator/${symbol.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.72,
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

  const sectors: MetadataRoute.Sitemap = getIndexableSectorSlugs()
    .map((slug) => ({
      url: `${BASE}/sector/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...statics, ...analysis, ...dripCalculators, ...collections, ...blogPosts, ...comparePairs, ...sectors]
}
