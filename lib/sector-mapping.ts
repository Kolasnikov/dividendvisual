export const BASE_URL = 'https://dividendvisual.com'

export interface SectorDefinition {
  slug: string
  dbSector: string
  label: string
  publicName: string
  canonicalPath: string
  aliases?: string[]
}

export const SECTORS: readonly SectorDefinition[] = [
  {
    slug: 'utilities',
    dbSector: 'Utilities',
    label: 'Utilities',
    publicName: 'Utility',
    canonicalPath: '/best-utility-dividend-stocks',
  },
  {
    slug: 'consumer-staples',
    dbSector: 'Consumer Defensive',
    label: 'Consumer Staples',
    publicName: 'Consumer Staples',
    canonicalPath: '/best-consumer-staples-dividend-stocks',
    aliases: ['Consumer Staples'],
  },
  {
    slug: 'healthcare',
    dbSector: 'Healthcare',
    label: 'Healthcare',
    publicName: 'Healthcare',
    canonicalPath: '/best-healthcare-dividend-stocks',
    aliases: ['Health Care'],
  },
  {
    slug: 'financials',
    dbSector: 'Financial Services',
    label: 'Financials',
    publicName: 'Financial',
    canonicalPath: '/best-financial-dividend-stocks',
    aliases: ['Financials'],
  },
  {
    slug: 'energy',
    dbSector: 'Energy',
    label: 'Energy',
    publicName: 'Energy',
    canonicalPath: '/best-energy-dividend-stocks',
  },
  {
    slug: 'technology',
    dbSector: 'Technology',
    label: 'Technology',
    publicName: 'Technology',
    canonicalPath: '/best-technology-dividend-stocks',
    aliases: ['Information Technology'],
  },
  {
    slug: 'real-estate',
    dbSector: 'Real Estate',
    label: 'Real Estate',
    publicName: 'REIT',
    canonicalPath: '/best-reit-dividend-stocks',
  },
  {
    slug: 'industrials',
    dbSector: 'Industrials',
    label: 'Industrials',
    publicName: 'Industrial',
    canonicalPath: '/best-industrial-dividend-stocks',
  },
  {
    slug: 'communication-services',
    dbSector: 'Communication Services',
    label: 'Communication Services',
    publicName: 'Communication Services',
    canonicalPath: '/sector/communication-services',
  },
  {
    slug: 'consumer-discretionary',
    dbSector: 'Consumer Cyclical',
    label: 'Consumer Discretionary',
    publicName: 'Consumer Discretionary',
    canonicalPath: '/sector/consumer-discretionary',
    aliases: ['Consumer Discretionary'],
  },
  {
    slug: 'materials',
    dbSector: 'Basic Materials',
    label: 'Materials',
    publicName: 'Materials',
    canonicalPath: '/sector/materials',
    aliases: ['Materials'],
  },
]

export const SECTOR_SLUGS = SECTORS.map((sector) => sector.slug)

export function getSectorBySlug(slug: string): SectorDefinition | undefined {
  return SECTORS.find((sector) => sector.slug === slug)
}

export function getSectorByDbSector(dbSector: string): SectorDefinition | undefined {
  return SECTORS.find(
    (sector) => sector.dbSector === dbSector || sector.aliases?.includes(dbSector),
  )
}

export function getSectorApiNameBySlug(slug: string): string | undefined {
  return getSectorBySlug(slug)?.dbSector
}

export function getSectorCanonicalPath(slug: string): string | undefined {
  return getSectorBySlug(slug)?.canonicalPath
}

export function getSectorCanonicalUrl(slug: string): string | undefined {
  const path = getSectorCanonicalPath(slug)
  return path ? `${BASE_URL}${path}` : undefined
}

export function isDuplicateSectorRoute(slug: string): boolean {
  const sector = getSectorBySlug(slug)
  return Boolean(sector && sector.canonicalPath !== `/sector/${slug}`)
}

export function getIndexableSectorSlugs(): string[] {
  return SECTORS
    .filter((sector) => sector.canonicalPath === `/sector/${sector.slug}`)
    .map((sector) => sector.slug)
}

export function getSectorLandingHref(dbSector: string): string {
  return getSectorByDbSector(dbSector)?.canonicalPath ?? `/sector/${dbSector.toLowerCase().replace(/ /g, '-')}`
}
