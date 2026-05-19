const baseUrl = process.env.SITE_URL ?? 'https://dividendvisual.com'

const expected = {
  PG: { king: true, aristocrat: true, minYears: 50 },
  JNJ: { king: true, aristocrat: true, minYears: 50 },
  ABT: { king: true, aristocrat: true, minYears: 50 },
  LOW: { king: true, aristocrat: true, minYears: 50 },
  PEP: { king: true, aristocrat: true, minYears: 50 },
  TGT: { king: true, aristocrat: true, minYears: 50 },
  WMT: { king: true, aristocrat: true, minYears: 50 },
  PH: { king: true, aristocrat: false, minYears: 50 },
  BEN: { king: false, aristocrat: true, minYears: 25 },
  CLX: { king: false, aristocrat: true, minYears: 25 },
  O: { king: false, aristocrat: true, minYears: 25 },
  MMM: { king: false, aristocrat: false },
  T: { king: false, aristocrat: false },
  SO: { king: false, aristocrat: false },
  DUK: { king: false, aristocrat: false },
  PM: { king: false, aristocrat: false },
  NNN: { king: false, aristocrat: false },
}

const response = await fetch(`${baseUrl}/api/watchlist?sort=symbol&order=asc&audit=dividend-classifications`)

if (!response.ok) {
  console.error(`Failed to load watchlist: HTTP ${response.status}`)
  process.exit(1)
}

const rows = await response.json()
const bySymbol = new Map(rows.map((row) => [row.symbol, row]))
let failures = 0

for (const [symbol, rule] of Object.entries(expected)) {
  const row = bySymbol.get(symbol)
  if (!row) {
    console.error(`fail ${symbol}: missing from watchlist`)
    failures += 1
    continue
  }

  const errors = []
  if (row.isDividendKing !== rule.king) errors.push(`king=${row.isDividendKing}`)
  if (row.isDividendAristocrat !== rule.aristocrat) errors.push(`aristocrat=${row.isDividendAristocrat}`)
  if (rule.minYears && row.yearsIncreasingDividends < rule.minYears) {
    errors.push(`years=${row.yearsIncreasingDividends}`)
  }

  if (errors.length > 0) {
    console.error(`fail ${symbol}: ${errors.join(', ')}`)
    failures += 1
  } else {
    console.log(`ok ${symbol}`)
  }
}

if (failures > 0) process.exit(1)
