const baseUrl = process.env.SITE_URL ?? 'https://dividendvisual.com'

const pages = [
  '/best-utility-dividend-stocks',
  '/best-reit-dividend-stocks',
  '/best-healthcare-dividend-stocks',
  '/best-consumer-staples-dividend-stocks',
  '/best-financial-dividend-stocks',
  '/best-industrial-dividend-stocks',
  '/best-technology-dividend-stocks',
  '/best-energy-dividend-stocks',
]

async function verifyPage(path) {
  const url = new URL(path, baseUrl).toString()
  const response = await fetch(url)

  if (!response.ok) {
    return { path, ok: false, reason: `HTTP ${response.status}` }
  }

  const html = await response.text()
  const tickers = new Set(html.match(/\/analysis\/[a-z0-9.-]+/g) ?? [])

  if (tickers.size === 0) {
    return { path, ok: false, reason: '0 stock analysis links rendered' }
  }

  return { path, ok: true, count: tickers.size }
}

const results = await Promise.all(pages.map(verifyPage))
const failed = results.filter((result) => !result.ok)

for (const result of results) {
  if (result.ok) {
    console.log(`ok ${result.path}: ${result.count} stocks`)
  } else {
    console.error(`fail ${result.path}: ${result.reason}`)
  }
}

if (failed.length > 0) {
  process.exitCode = 1
}
