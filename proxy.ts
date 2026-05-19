import { NextResponse, type NextRequest } from 'next/server'

const SYMBOL_ROUTES = new Set(['ticker', 'analysis'])

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const [, route, symbol, ...rest] = url.pathname.split('/')

  if (!SYMBOL_ROUTES.has(route) || !symbol) {
    return NextResponse.next()
  }

  const canonicalSymbol = symbol.toLowerCase()
  if (symbol === canonicalSymbol) {
    return NextResponse.next()
  }

  url.pathname = `/${route}/${canonicalSymbol}${rest.length > 0 ? `/${rest.join('/')}` : ''}`
  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: ['/ticker/:path*', '/analysis/:path*'],
}
