const baseUrl = process.env.SITE_URL ?? 'https://dividendvisual.com'

const requiredCompleteSymbols = new Set([
  'KO', 'PEP', 'JNJ', 'PG', 'ABT', 'MDT', 'ABBV', 'XOM', 'CVX', 'O',
  'MCD', 'WMT', 'LOW', 'HD', 'TGT', 'AFL', 'SPGI', 'ADP', 'MCD',
])

const validSignals = new Set(['undervalued', 'fair', 'overvalued'])
const validCategories = new Set(['Excellent', 'Good', 'Average', 'Risky'])

function pct(value) {
  return `${(value * 100).toFixed(2)}%`
}

function add(issues, severity, symbol, field, value, message) {
  issues.push({ severity, symbol, field, value, message })
}

async function loadWatchlist() {
  const url = `${baseUrl}/api/watchlist?sort=symbol&order=asc&audit=data-quality-${Date.now()}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to load watchlist: HTTP ${response.status}`)
  return response.json()
}

const rows = await loadWatchlist()
const issues = []

for (const row of rows) {
  const required = requiredCompleteSymbols.has(row.symbol)

  if (!row.name || row.name === row.symbol) {
    add(issues, required ? 'error' : 'warn', row.symbol, 'name', row.name, 'Missing company name')
  }

  if (!row.sector) {
    add(issues, required ? 'error' : 'warn', row.symbol, 'sector', row.sector, 'Missing sector')
  }

  if (!row.industry) {
    add(issues, required ? 'error' : 'warn', row.symbol, 'industry', row.industry, 'Missing industry')
  }

  if (!Number.isFinite(row.currentPrice) || row.currentPrice <= 0) {
    add(issues, 'error', row.symbol, 'currentPrice', row.currentPrice, 'Missing or invalid price')
  }

  if (!Number.isFinite(row.annualDividend) || row.annualDividend < 0) {
    add(issues, 'error', row.symbol, 'annualDividend', row.annualDividend, 'Invalid annual dividend')
  } else if ((row.isDividendKing || row.isDividendAristocrat || required) && row.annualDividend <= 0) {
    add(issues, 'error', row.symbol, 'annualDividend', row.annualDividend, 'Dividend stock has no annual dividend')
  }

  if (!Number.isFinite(row.currentYield) || row.currentYield < 0) {
    add(issues, 'error', row.symbol, 'currentYield', row.currentYield, 'Invalid dividend yield')
  } else if (row.annualDividend > 0 && row.currentYield <= 0) {
    add(issues, 'error', row.symbol, 'currentYield', row.currentYield, 'Annual dividend is positive but yield is zero')
  } else if (row.currentYield > 0.15) {
    add(issues, 'warn', row.symbol, 'currentYield', pct(row.currentYield), 'Yield above 15%; check for special dividend or bad price')
  }

  if (row.annualDividend > 0 && row.currentPrice > 0) {
    const impliedYield = row.annualDividend / row.currentPrice
    const drift = Math.abs(impliedYield - row.currentYield)
    if (drift > 0.0025) {
      add(issues, 'warn', row.symbol, 'currentYield', pct(row.currentYield), `Yield differs from dividend/price (${pct(impliedYield)})`)
    }
  }

  if (!validSignals.has(row.weissSignal)) {
    add(issues, 'error', row.symbol, 'weissSignal', row.weissSignal, 'Invalid Weiss signal')
  }

  if (!Number.isFinite(row.qualityScore) || row.qualityScore < 0 || row.qualityScore > 100) {
    add(issues, 'error', row.symbol, 'qualityScore', row.qualityScore, 'Quality score outside 0-100')
  } else if ((row.isDividendKing || row.isDividendAristocrat || required) && row.qualityScore === 0) {
    add(issues, 'warn', row.symbol, 'qualityScore', row.qualityScore, 'Elite dividend stock has quality score 0')
  }

  if (!validCategories.has(row.qualityCategory)) {
    add(issues, 'error', row.symbol, 'qualityCategory', row.qualityCategory, 'Invalid quality category')
  }

  if (row.isDividendKing && row.yearsIncreasingDividends < 50) {
    add(issues, 'error', row.symbol, 'yearsIncreasingDividends', row.yearsIncreasingDividends, 'Dividend King has fewer than 50 years')
  }

  if (row.isDividendAristocrat && row.yearsIncreasingDividends < 25) {
    add(issues, 'error', row.symbol, 'yearsIncreasingDividends', row.yearsIncreasingDividends, 'Dividend Aristocrat has fewer than 25 years')
  }

  if (!row.isDividendKing && !row.isDividendAristocrat && row.yearsIncreasingDividends >= 50) {
    add(issues, 'warn', row.symbol, 'yearsIncreasingDividends', row.yearsIncreasingDividends, '50+ year streak without King flag')
  }

  if (!row.isDividendKing && !row.isDividendAristocrat && row.yearsIncreasingDividends >= 25) {
    add(issues, 'warn', row.symbol, 'yearsIncreasingDividends', row.yearsIncreasingDividends, '25+ year streak without Aristocrat flag')
  }

  if (row.historicalMaxYield > 0 && row.historicalMinYield > 0 && row.historicalMinYield > row.historicalMaxYield) {
    add(issues, 'error', row.symbol, 'yieldRange', `${pct(row.historicalMinYield)} > ${pct(row.historicalMaxYield)}`, 'Historical min yield exceeds max yield')
  }
}

const errors = issues.filter((issue) => issue.severity === 'error')
const warnings = issues.filter((issue) => issue.severity === 'warn')

console.log(`Audited ${rows.length} stocks`)
console.log(`Errors: ${errors.length}`)
console.log(`Warnings: ${warnings.length}`)

for (const issue of issues) {
  console.log(`${issue.severity.toUpperCase()}\t${issue.symbol}\t${issue.field}\t${issue.value ?? 'null'}\t${issue.message}`)
}

if (errors.length > 0) process.exit(1)
