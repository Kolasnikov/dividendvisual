@AGENTS.md

# DividendVisual — Project Context

## What This Is

DividendVisual is a financial analysis web app for dividend investors. It implements the **Geraldine Weiss yield method**: compare a stock's current dividend yield against its 10-year historical yield range to determine if it's undervalued, fairly valued, or overvalued.

**Live site:** https://dividendvisual.com
**Status:** Deployed, no monetization yet. Building toward it.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.6, App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Turso (SQLite in the cloud) via `@libsql/client` |
| Charts | Recharts 3 |
| Data pipeline | Python (yfinance), runs daily |
| Email | Resend (newsletter subscribe) |
| Hosting | Vercel |
| Analytics | Vercel Analytics (`@vercel/analytics`) |

---

## Directory Structure

```
app/                        — Next.js App Router
├── page.tsx                — Home: hero, FAQ schema, top picks, email capture, collections carousel
├── watchlist/page.tsx      — Screener: filter by signal/badge/sector, sortable columns
├── opportunities/page.tsx  — Undervalued stocks (Weiss + quality >= 60)
├── ticker/[symbol]/page.tsx — Stock detail: Weiss chart, quality score, DRIP, metrics
├── analysis/[symbol]/page.tsx — Editorial analysis page (long-form, SEO-focused)
├── collections/[slug]/page.tsx — Curated thematic collections
├── blog/page.tsx           — Blog index (9 posts)
├── blog/[slug]/page.tsx    — Individual MDX blog post
├── api/
│   ├── watchlist/          — GET all stocks with metrics
│   ├── ticker/[symbol]/    — GET single stock (company + metrics + chart data)
│   ├── search/             — GET autocomplete (symbol or name match)
│   ├── subscribe/          — POST email to Resend
│   └── collections/[slug]/ — GET stocks in a collection
├── sitemap.ts              — Dynamic sitemap (tickers, collections, blog)
└── robots.ts               — Allow all, points to sitemap

components/
├── WeissChart.tsx          — Interactive yield history chart with bands (1Y/3Y/5Y/10Y/MAX)
├── DRIPChart.tsx           — DRIP compounding calculator + bar chart
├── QualityScoreCard.tsx    — SVG arc gauge 0–100, factor breakdown
├── MetricsCard.tsx
├── WhyNowCard.tsx          — Narrative buy/hold/avoid signal
├── WatchlistClient.tsx     — Client-side filter/sort table
├── TickerSearch.tsx        — Navbar search with debounce + keyboard nav
├── TickerTape.tsx          — Horizontal scrolling ticker strip
├── EmailCapture.tsx        — Hero + banner variants
└── layout/Navbar, Footer

content/blog/               — MDX blog posts (9 total)
lib/                        — db.ts, types.ts, blog utils
scripts/
├── ingest.py               — Fetches price/dividend history via yfinance → Turso
└── compute_bands.py        — Calculates Weiss bands, quality score, why-now text
```

---

## Database Schema (Turso/SQLite)

**`companies`**: symbol, name, sector, industry, dividend_king (bool), dividend_aristocrat (bool), blue_chip (bool), years_increasing_dividends

**`computed_metrics`**: symbol, current_price, annual_dividend, current_yield, historical_max_yield, historical_min_yield, median_yield, undervalued_price, overvalued_price, weiss_signal (Undervalued/Fair/Overvalued), quality_score (0–100), quality_category, payout_ratio, fcf_payout, dividend_cagr_5y, dividend_cagr_10y, years_no_cut, why_now_text, updated_at

**`weiss_chart_data`**: symbol, date, price, undervalued_band, overvalued_price_band, annual_dividend

**`collections`**: slug, symbol (many-to-many)

---

## Tickers Covered (62)

- **Dividend Kings** (~15): KO, PEP, MMM, GPC, MO, BEN, FRT, CLX, KMB, CL, HRL, BDX, EMR, ITW, AFL
- **Dividend Aristocrats** (~25): JNJ, PG, MCD, WMT, HD, ABT, MDT, XOM, CVX, T, SO, DUK, NEE, ABBV, PM, SYY, LOW, MKC, CTAS, GD, CAT, TROW, NNN, ECL, ATO, SYK, CB
- **Tech dividend growers**: TXN, MSFT
- **Others**: VZ, O, VFC, MAIN, BMY, PFE, AMGN, PH, USB, AMP, AMT, ADC, AWK, WEC, AEP, D, HSY, CPB

---

## Key Business Logic

### Weiss Method
- Compute 10-year historical yield range for each ticker
- **Undervalued**: current yield ≥ 90th percentile of historical yield (stock price is low)
- **Overvalued**: current yield ≤ 10th percentile of historical yield (stock price is high)
- **Fair**: between the two bands

### Quality Score (0–100)
| Factor | Max | Scoring |
|--------|-----|---------|
| Payout ratio | 25 | <40% (25), <55% (20), <70% (12), <85% (5), ≥85% (0) |
| Dividend streak | 25 | ≥25y (25), ≥10y (20), ≥5y (12), ≥2y (5), <2y (0) |
| Dividend CAGR 5Y | 20 | ≥8% (20), ≥5% (15), ≥2% (8), >0% (3), ≤0% (0) |
| Yield vs history | 15 | ≥85% of max (15), ≥70% (10), ≥50% (5), <50% (0) |
| FCF coverage | 15 | <50% (15), <70% (10), <85% (5), ≥85% (0) |

Categories: Excellent ≥80, Good 60–79, Average 40–59, Risky <40

### DRIP Calculator
- Inputs: initial investment, yield, dividend CAGR, horizon (years), current price
- Yearly: income × (1 + CAGR), reinvest → buy more shares
- Outputs: income per year, yield-on-cost, share count

---

## Collections (7)
- `dividend-kings` — 50+ years consecutive dividend growth
- `dividend-aristocrats` — 25+ years, S&P 500 members
- `buffett-style` — Wide-moat compounders
- `utilities` — Regulated stable income
- `reits` — High-yield real estate investment trusts
- `high-yield` — Above-average yields with history
- `low-payout-compounders` — Growth-focused, low payout ratio

---

## SEO Setup
- **Sitemap**: auto-generated by Next.js (`sitemap.ts`), covers all tickers, collections, blog posts
- **Robots**: allow all, points to sitemap
- **Schema markup**: FAQ (home), Organization/WebApplication (home), Article (ticker + blog), BreadcrumbList (all pages)
- **Open Graph**: full OG metadata + custom OG image (opengraph-image.tsx)
- **Page caching**: `s-maxage=3600, stale-while-revalidate=86400`
- **Blog**: 9 posts on dividend investing topics, MDX-rendered

---

## Monetization Status
**Nothing implemented yet.** Options under consideration:
- Newsletter (email capture built — Resend integration exists)
- Premium features (more tickers, alerts, portfolio tracking)
- Broker affiliate links
- Lead generation
- Discrete display advertising

---

## What's Missing (known gaps)
- No user accounts / auth
- No saved watchlists or portfolio tracking
- No price alerts or notifications
- No CSV/PDF export
- No error.tsx / not-found.tsx / global-error.tsx pages
- No privacy policy, terms of service, or about page
- No affiliate links
- No rate limiting on API routes
- Vercel Analytics imported but no custom event tracking
