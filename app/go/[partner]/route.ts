import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { getEtoroLink } from '@/lib/etoro'
import { trackAffiliateClick } from '@/lib/trackClick'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ partner: string }>
}

const FIXED_LINKS: Record<string, string> = {
  tradingview: 'https://www.tradingview.com/?aff_id=166728',
  finviz: 'https://finviz.com/?affilId=757578555',
  morningstar: 'https://www.awin1.com/cread.php?awinmid=81639&awinaffid=2899577',
  sharesight: 'https://www.sharesight.com/dividendvisual/',
}

// Partners that allow a per-item destination override (?url=), validated by host.
const OVERRIDE_HOSTS: Record<string, RegExp> = {
  tradingview: /(^|\.)tradingview\.com$/i,
  finviz: /(^|\.)finviz\.com$/i,
  amazon: /(^|\.)amazon\.[a-z.]+$|^amzn\.to$/i,
}

function isAllowedOverride(partner: string, candidate: string): string | null {
  const pattern = OVERRIDE_HOSTS[partner]
  if (!pattern) return null
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'https:') return null
    return pattern.test(parsed.hostname) ? parsed.toString() : null
  } catch {
    return null
  }
}

function resolveDestination(partner: string, country: string | null, urlOverride: string | null): string | null {
  if (partner === 'etoro') return getEtoroLink(country)

  if (partner === 'amazon') {
    return urlOverride ? isAllowedOverride('amazon', urlOverride) : null
  }

  const fixed = FIXED_LINKS[partner]
  if (!fixed) return null

  if (urlOverride) {
    const validated = isAllowedOverride(partner, urlOverride)
    if (validated) return validated
  }
  return fixed
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { partner } = await context.params
  const country = request.headers.get('x-vercel-ip-country')
  const urlOverride = request.nextUrl.searchParams.get('url')
  const destination = resolveDestination(partner, country, urlOverride)

  if (!destination) {
    return NextResponse.json({ error: 'Affiliate link not configured' }, { status: 404 })
  }

  const placement = request.nextUrl.searchParams.get('placement')
  const referrer = request.headers.get('referer')
  const userAgent = request.headers.get('user-agent') ?? ''

  after(() =>
    trackAffiliateClick({
      site: 'dividendvisual',
      partner,
      placement,
      destinationUrl: destination,
      referrerPath: referrer,
      userAgent,
      country,
    })
  )

  return NextResponse.redirect(destination, 302)
}
