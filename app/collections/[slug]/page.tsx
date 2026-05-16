import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { TrackPageView } from '@/components/analytics/TrackPageView'

type CollectionRow = Company & ComputedMetrics

interface PillarSection {
  heading: string
  paragraphs: string[]
}

interface CollectionMeta {
  title: string
  description: string
  metaDescription: string
  editorial: string[]
  pillar: PillarSection[]
  relatedBlog?: { href: string; label: string }[]
}

const COLLECTION_META: Record<string, CollectionMeta> = {
  'dividend-kings': {
    title: 'Dividend Kings',
    description: '50+ consecutive years of dividend growth — the most reliable income stocks in the market.',
    metaDescription: 'Dividend Kings stocks list 2026 with Weiss valuation analysis. Companies with 50+ consecutive years of dividend growth, yield history, and quality scores.',
    editorial: [
      'Of the roughly 4,000 publicly traded US companies, fewer than 60 have raised their dividend every single year for half a century. These are businesses that paid and grew through stagflation, the dot-com bust, the 2008 financial crisis, and COVID without ever missing a raise. The 50-year threshold filters brutally — it eliminates every company that had a bad enough decade to interrupt the streak.',
      'What the streak proves is specific: these businesses generate more cash than they need, in almost any economic environment, and management has the discipline to return it reliably. The dividend is not maintained out of pride. It keeps growing because the cash keeps coming — from brand moats, regulated positions, or essential products that customers buy regardless of what the economy is doing.',
      'For the Weiss yield method, Dividend Kings are ideal candidates. Decades of uninterrupted dividend history produce a tight, reliable yield range shaped by real market cycles. When a King\'s yield approaches its 10-year high, the signal carries more weight than it would for a company with only a few years of data to anchor it.',
    ],
    pillar: [
      {
        heading: 'What Qualifies a Stock as a Dividend King?',
        paragraphs: [
          'The definition is simple: a Dividend King has raised its annual dividend payout for at least 50 consecutive years without interruption. No freezes, no cuts — every single year, a larger dividend than the year before. As of 2026, fewer than 60 US-listed companies have achieved this.',
          'The 50-year bar is not arbitrary. Half a century of consecutive raises spans at minimum five major recessions (1973–75, 1980–82, 1990–91, 2001, 2008–09), multiple industry disruptions, and at least two periods of double-digit inflation. The companies that maintained a consecutive raise through all of that were not lucky — they had structural cash generation advantages that no external shock could overwhelm.',
          'Consumer staples dominate the Kings list: Coca-Cola, Procter & Gamble, Colgate-Palmolive, Kimberly-Clark. Industrial giants like Emerson Electric and Illinois Tool Works appear. A handful of specialty companies — Automatic Data Processing, Nordson — hold streaks because their business models generate recurring, contract-based revenue regardless of economic conditions. The common thread is not sector but cash flow durability.',
        ],
      },
      {
        heading: 'Why Dividend Kings Make Ideal Weiss Candidates',
        paragraphs: [
          'The Geraldine Weiss method relies on a stable historical yield range to identify undervaluation. A company with five years of dividend history has a thin, unreliable range — one unusual year can distort the entire signal. A Dividend King with 50+ years of data has a yield range shaped by actual market cycles: recessions, booms, interest rate regimes, sector rotations. The signal is real.',
          'King-level streaks also reduce the primary risk of yield-based valuation: the dividend cut. If a stock yields 5% and then cuts to 2.5%, the historical "high yield" becomes meaningless — you were not getting a bargain, you were getting a warning. Dividend Kings have demonstrated, across extraordinary economic conditions, that they do not cut. This makes their Weiss signals unusually reliable.',
          'When a Dividend King\'s yield approaches its 10-year high, it is almost always because of one of two things: a broad market selloff that dragged quality names indiscriminately lower, or a sector-specific rotation away from defensives driven by interest rate moves. In both cases, the business itself is unchanged. The income is secure. The price is low. That combination — safe dividend, historically cheap price — is the exact setup the Weiss method was designed to exploit.',
        ],
      },
      {
        heading: 'How to Evaluate a Dividend King Today',
        paragraphs: [
          'The quality score on each King\'s page breaks down five factors: payout ratio, dividend streak, 5-year CAGR, yield relative to history, and FCF coverage. Kings almost always score well on streak — the 25-point streak factor is maxed out at 25+ years, and every King qualifies. Where Kings differentiate is on growth rate and payout sustainability.',
          'A King with a 6–8% dividend CAGR and a 45% payout ratio is a fundamentally stronger holding than one with a 2% CAGR and an 80% payout ratio — even if both carry the same 50-year streak. The streak proves the past; the growth rate and payout ratio indicate the margin of safety going forward.',
          'Check the Weiss signal first (is the yield historically attractive?), then the quality score (is the dividend well-covered and growing meaningfully?), then read the specific analysis page for any company-specific context. The combination of Undervalued signal and a quality score above 70 represents the strongest entry setup in the Kings universe.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/dividend-kings-list-analysis', label: 'Dividend Kings: What 50 Years of Growth Means' },
      { href: '/blog/dividend-aristocrats-vs-kings', label: 'Dividend Aristocrats vs Kings: The Practical Difference' },
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
    ],
  },

  'dividend-aristocrats': {
    title: 'Dividend Aristocrats',
    description: 'S&P 500 companies with 25+ consecutive years of dividend growth and proven income track records.',
    metaDescription: 'Dividend Aristocrats list 2026 with yield analysis and Weiss valuation bands. S&P 500 stocks with 25+ years of consecutive dividend growth.',
    editorial: [
      'To qualify as a Dividend Aristocrat, a company must be in the S&P 500 and have raised its annual dividend for at least 25 consecutive years. The S&P 500 requirement adds a market cap and liquidity filter the Kings group lacks — every Aristocrat is a large, institutionally-held business with deep trading volume.',
      'A 25-year streak spans at minimum two major recessions. Companies that kept raising dividends through 2001 and 2009 demonstrated that their business models generate surplus cash even when the economy contracts sharply. That\'s a higher bar than it sounds — most companies manage dividends reactively; Aristocrats maintain them structurally.',
      'Sector representation is broader here than in the Kings group. Healthcare, industrials, financials, and technology-adjacent names appear — making the Aristocrats a better starting universe for investors who want dividend reliability alongside genuine sector diversification.',
    ],
    pillar: [
      {
        heading: 'The S&P 500 Requirement: Why It Matters',
        paragraphs: [
          'The Dividend Aristocrats index has two simultaneous requirements: 25+ consecutive years of dividend growth AND membership in the S&P 500. The second requirement does more work than it appears. S&P 500 inclusion requires meeting minimum market capitalization, liquidity, and profitability thresholds set by the index committee. Every Aristocrat has been through that screen.',
          'This means the Aristocrats universe is automatically free of small-cap dividend payers with questionable business models who happen to have raised their dividend during a favorable period. Every Aristocrat is a large, institutionally covered business. Many are household names. The index\'s institutional ownership creates deeper liquidity and tighter bid-ask spreads than you\'d find in smaller dividend-growth universes.',
          'It also means the Aristocrats list shrinks during market downturns: companies that drop out of the S&P 500 lose their eligibility regardless of their dividend streak. This is a feature, not a bug — it ensures the universe remains large-cap and liquid.',
        ],
      },
      {
        heading: 'Twenty-Five Years Through Two Recessions',
        paragraphs: [
          'The 2001 recession and the 2008–09 financial crisis are the two stress tests that define the Aristocrats universe. In 2008–09, hundreds of companies froze or cut dividends — financials, industrials, consumer discretionary names all reduced payouts to preserve cash during the worst credit event in 80 years. The companies that kept raising through that period had one thing in common: their core business operations generated more free cash flow than they needed, even in the worst quarter.',
          'That\'s a high bar. It\'s not about accounting. It\'s not about timing. It\'s about what the business actually generates in cash when conditions are worst. A company that kept raising its dividend through Q1 2009 was doing so because the checks were still clearing — not because management was feeling optimistic.',
          'This history is what gives Aristocrat Weiss signals weight. When an Aristocrat\'s yield reaches a 10-year high, you\'re looking at a company with a demonstrated track record of maintaining its payout through conditions far worse than whatever is currently driving the price down.',
        ],
      },
      {
        heading: 'Aristocrats vs Kings: When to Choose One Over the Other',
        paragraphs: [
          'All Dividend Kings are Aristocrats (a 50-year streak exceeds the 25-year bar), but not all Aristocrats are Kings. The distinction matters when you\'re building a concentrated income portfolio and choosing between them.',
          'Kings offer longer track records and, on average, more mature businesses with stable but slower-growing dividends. The yield range is tighter and more reliable. Aristocrats that are not yet Kings are often earlier in their compounding journey — faster dividend growth, slightly more business dynamism, potentially better total returns over a 20-year horizon.',
          'For investors prioritizing current income and maximum reliability, Kings first. For investors with a 15–20 year horizon prioritizing total income compounding, younger Aristocrats with high growth rates (6–10% CAGR) often outperform. The Weiss signal applies equally to both — buy either when the yield is historically attractive.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/dividend-aristocrats-vs-kings', label: 'Dividend Aristocrats vs Kings: The Practical Difference' },
      { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to Find Undervalued Dividend Stocks' },
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
    ],
  },

  'buffett-style': {
    title: 'Buffett-Style Compounders',
    description: 'Wide-moat dividend payers with durable competitive advantages and consistent income growth.',
    metaDescription: 'Buffett-style dividend stocks with wide economic moats. Weiss valuation analysis, quality scores, and dividend yield history for value investors.',
    editorial: [
      'Warren Buffett\'s investment philosophy and Geraldine Weiss\'s dividend yield method share a foundational premise: the best investments are businesses with durable competitive advantages bought at attractive prices. Where they differ is in the valuation tool — Buffett emphasizes qualitative moat assessment, Weiss uses 10-year yield history as a quantitative anchor.',
      'The stocks in this collection are businesses with structural advantages that are difficult to replicate: global brand recognition, proprietary distribution networks, pricing power that has held up across decades of competition. These are not just good businesses — they\'re businesses whose advantages appear to compound over time rather than erode.',
      'Combining both frameworks is more powerful than either alone. The Weiss signal tells you when the price is historically attractive; the moat assessment tells you whether the business deserves to be held through a full cycle. Both questions need a yes before a position makes sense.',
    ],
    pillar: [
      {
        heading: 'What Makes an Economic Moat?',
        paragraphs: [
          'An economic moat is a durable competitive advantage that allows a business to earn returns on capital above its cost of capital for an extended period. Buffett\'s framework identifies several sources: brand identity that commands pricing power (Coca-Cola), switching costs that trap customers (ADP\'s payroll systems), cost advantages from scale or proprietary processes (Ecolab), and network effects that grow stronger with each new user.',
          'Moats matter for dividend investors because they determine whether the dividend is structurally safe or cyclically contingent. A business with a genuine moat can raise prices to offset cost increases, maintain margins through recessions, and reinvest at high returns — all of which fund a growing dividend. A business without a moat competes on price, sees margins erode, and often has to reduce the dividend when conditions turn.',
          'The tell-tale sign of a real moat is consistent return on equity above 15–20% over a full economic cycle, maintained without excessive leverage. That kind of sustained profitability is what funds 25, 40, or 60 consecutive years of dividend growth.',
        ],
      },
      {
        heading: 'Where Buffett and Weiss Agree',
        paragraphs: [
          'Both frameworks converge on the same universe: established blue-chip companies with predictable cash generation, long operating histories, and dividends that function as a reliable income stream. Buffett has held Coca-Cola for decades — a Weiss analyst would tell you KO\'s dividend yield history makes it one of the clearest Weiss candidates in the market. Both frameworks would have flagged the COVID-crash entry point.',
          'The agreement isn\'t coincidental. Businesses with wide moats generate the stable, growing dividends that produce reliable Weiss yield ranges. Businesses without moats have volatile earnings, inconsistent dividends, and unreliable yield histories. By requiring the Weiss method to "work" on a stock, you\'re implicitly filtering for business quality.',
          'Use the Weiss signal as the trigger and the moat assessment as the confirmation. When a wide-moat business\'s yield approaches its 10-year high, you have two independent frameworks saying the same thing: the price is attractive. That double signal is the highest-conviction setup in long-term income investing.',
        ],
      },
      {
        heading: 'Questions to Ask About Any Moat Claim',
        paragraphs: [
          'Not every moat claim holds up to scrutiny. Brand recognition is often confused with actual pricing power — a well-known brand that competes on price (rather than commanding a premium) is not a moat. Distribution advantages erode as logistics infrastructure improves. Switching costs matter only if the customer can\'t easily replicate the workflow with a competitor.',
          'The practical test: has the company been able to raise prices consistently above inflation over the past decade, while maintaining or improving margins? If yes, the moat is real. If the company regularly discounts or absorbs cost increases without passing them to customers, the competitive advantage is weaker than advertised.',
          'For dividend investors, the moat question is ultimately about the next 20 years: will this business still be generating superior cash flow in 2040? For Coca-Cola, the answer seems clear. For businesses facing structural disruption — retailers, traditional media, commodity producers — the question deserves more scrutiny before committing to a multi-decade income position.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to Find Undervalued Dividend Stocks' },
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
      { href: '/blog/coca-cola-ko-dividend-analysis', label: 'Coca-Cola: 62 Years of Dividend Growth' },
    ],
  },

  'utilities': {
    title: 'Utility Dividend Stocks',
    description: 'Regulated utility companies offering stable, predictable dividend income in any market environment.',
    metaDescription: 'Best utility dividend stocks 2026 ranked by yield, quality score, and Weiss valuation signal. Stable income from regulated electric and gas utilities.',
    editorial: [
      'Regulated electric and gas utilities are among the most predictable dividend payers in the equity market — by design. Their rates, capital plans, and allowed returns are set by state public utility commissions through a formal rate-case process. The result is a business that earns a contracted margin on a known asset base, with limited ability to greatly overearn or dramatically underperform.',
      'That predictability makes utilities excellent Weiss candidates. Dividends grow steadily (typically 3–6% annually), the yield range is stable, and the undervalue/overvalue thresholds are relatively tight. When a utility\'s yield approaches its 10-year high, it\'s almost always because interest rates have risen and pulled prices down — creating a genuine entry opportunity, not a business problem.',
      'The key risk to understand: utilities are interest-rate sensitive. Rising rates increase their cost of capital and make dividend yields less attractive relative to bonds, pushing prices down mechanically. This creates Weiss undervalue signals that are often driven by macro rate pressure rather than company-specific issues — which is precisely when they tend to be the best opportunities.',
    ],
    pillar: [
      {
        heading: 'How Utility Regulation Creates Dividend Predictability',
        paragraphs: [
          'Regulated utilities do not compete on price — their rates are set by state public utility commissions (PUCs) through a formal rate-case process. The utility submits a filing showing its costs, capital investment, and a requested allowed return on equity (typically 9–11%). The commission reviews, negotiates, and approves a rate structure. The utility then earns that allowed return on its rate base — the value of its approved asset investments.',
          'This structure creates a business that earns a contracted margin on a known asset base. It cannot dramatically overearn (the commission would cut rates) or dramatically underperform (the next rate case provides cost recovery). The result is some of the most predictable free cash flow in the equity market — and predictable free cash flow funds predictable, growing dividends.',
          'Utility dividend growth is driven primarily by capital investment: when a utility builds a new power plant, transmission line, or pipeline, that asset gets added to the rate base, which increases the allowed earnings, which funds a larger dividend. This is why utility dividends grow modestly but reliably — the capex cycle directly drives the income stream.',
        ],
      },
      {
        heading: 'Interest Rates, Utility Prices, and Weiss Signals',
        paragraphs: [
          'Utilities are among the most interest-rate sensitive equities. When the 10-year Treasury yield rises, income-oriented investors compare utility dividend yields to bond yields. If a utility yields 3.5% and a Treasury yields 4.5%, money rotates from the utility to the bond — pushing the utility price down and the yield up until the spread is competitive again. This is mechanical, not company-specific.',
          'For Weiss-method investors, this creates a predictable opportunity cycle. Rate-hike periods push utility yields toward historical highs, triggering Undervalued signals — often for extended periods, since the market takes time to believe the rate cycle has peaked. When rates eventually stabilize or fall, utility prices recover and yields compress back toward fair value.',
          'The key insight: a utility entering Weiss undervalue territory during a rate-hike cycle is not a business problem. The dividend is not at risk. The rate regulator is still setting allowed returns. The only thing that changed is the comparison to Treasury yields. Investors who buy utilities during rate-driven weakness and hold through the rate cycle have historically earned both above-average yield and meaningful capital recovery.',
        ],
      },
      {
        heading: 'What to Check Before Buying a Utility Stock',
        paragraphs: [
          'Not all utilities are equally positioned. Before acting on a Weiss undervalue signal, check four things: the allowed return on equity (higher is better), the capital expenditure cycle (utilities in the middle of a major buildout grow rate base and dividends faster), the state regulatory environment (some state commissions are more utility-friendly than others), and the balance sheet leverage (utilities are capital-intensive, and high debt loads limit financial flexibility in adverse conditions).',
          'NextEra Energy (NEE) illustrates this well: its regulated Florida utility is supported by one of the most constructive regulatory environments in the country, and its renewable energy segment benefits from long-term contracted cash flows. Southern Company (SO) and Duke Energy (DUK) have large, established regulated franchises in the Southeast. These are different risk profiles from smaller, single-state utilities.',
          'The Weiss signal and quality score together give you a useful starting screen. The specific company context — capex pipeline, regulatory relationship, balance sheet — is the final layer before sizing a position.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
      { href: '/blog/best-undervalued-dividend-stocks-q2-2026', label: 'Undervalued Dividend Stocks: Q2 2026 Outlook' },
      { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to Find Undervalued Dividend Stocks' },
    ],
  },

  'reits': {
    title: 'REIT Dividend Stocks',
    description: 'Real estate investment trusts with high dividend yields and legally mandated income distributions.',
    metaDescription: 'Top REIT dividend stocks 2026 with historical yield analysis and Weiss valuation bands. High-income real estate investment trusts screened by quality score.',
    editorial: [
      'Real estate investment trusts are legally required to distribute at least 90% of their taxable income to shareholders. This structure produces some of the highest dividend yields in the equity market — and also means that standard payout ratio calculations are not meaningful for REITs. The correct measure is FFO payout (funds from operations), which adds back depreciation and adjusts for property gains and losses.',
      'Within the REIT universe, business quality varies sharply. Net lease REITs collect contractually fixed rents from credit-rated tenants under long-term leases — making cash flows unusually predictable. Cell tower REITs benefit from the essential infrastructure nature of wireless connectivity. Monthly dividend payers like Realty Income have built a track record specifically around income reliability. These are meaningfully different from retail or office REITs exposed to foot traffic and remote work trends.',
      'Weiss valuation applies to REITs with long, consistent dividend histories, but yield ranges tend to be structurally higher than non-REIT sectors. Use each REIT\'s own historical yield range as the benchmark — not a cross-sector comparison.',
    ],
    pillar: [
      {
        heading: 'Why REIT Payout Ratios Look High (And Why That\'s Normal)',
        paragraphs: [
          'A REIT reporting a 110% payout ratio is not in danger of cutting its dividend — it\'s following accounting rules that make the payout ratio calculation misleading for this sector. The core issue is depreciation: GAAP requires real estate assets to be depreciated over time, which reduces reported earnings even though real estate often appreciates in value. If you calculate payout ratio using GAAP earnings, it almost always looks dangerously elevated.',
          'The correct measure is AFFO (Adjusted Funds From Operations) or simply FFO payout. FFO adds back depreciation and excludes property sale gains — giving you a picture of the actual cash the REIT generates from operations. Most high-quality REITs run AFFO payout ratios of 70–85%, which is fully sustainable and typical for the sector.',
          'Before worrying about a high REIT payout ratio, always check whether the figure is based on GAAP EPS or FFO. If FFO-based and below 90%, the dividend is almost certainly well-covered. The quality score on each REIT\'s DividendVisual page uses FCF-based coverage metrics that are more appropriate for this sector.',
        ],
      },
      {
        heading: 'Net Lease REITs: The Most Predictable Subtype',
        paragraphs: [
          'Not all REITs are equally reliable for income investors. Net lease REITs — like Realty Income (O), NNN REIT, and STORE Capital — sit at the most predictable end of the REIT spectrum. In a net lease arrangement, the tenant pays not just rent but also property taxes, insurance, and maintenance costs. The REIT collects a fixed rent check with minimal variable costs. Leases run 10, 15, or 20 years with creditworthy tenants including major retailers, restaurants, and service businesses.',
          'This structure produces cash flows that are more bond-like than equity-like: contracted, long-dated, and minimally dependent on economic conditions. The tenant is responsible for the building; the REIT is responsible for collecting the check. For income investors, this is the closest thing to a triple-net dividend machine available in the equity market.',
          'Monthly dividend payment schedules — offered by Realty Income, MAIN Street Capital, and others — add an additional dimension of income predictability. Monthly compounding of reinvested dividends accelerates the DRIP effect compared to quarterly payers.',
        ],
      },
      {
        heading: 'Interest Rates and REIT Prices: Reading the Cycle',
        paragraphs: [
          'REIT valuations are systematically affected by interest rates. As rates rise, REIT prices fall — both because the cost of their debt financing increases and because competing income from bonds draws capital away from dividend-paying equities. This creates Weiss undervalue signals that are some of the most persistent and visible in the entire DividendVisual universe.',
          'The 2022–2023 rate-hike cycle was particularly severe for REITs. Many net lease names fell 25–40% from peak to trough, pushing yields to levels last seen in 2013–2014 — well into Weiss undervalue territory by historical standards. The dividend was never at risk: the tenants were still paying rent, the leases were still running, and the cash flow was largely unaffected by Federal Reserve policy.',
          'For investors willing to hold through rate uncertainty, REIT undervalue signals driven by macro rate pressure — rather than business deterioration — have historically produced some of the strongest subsequent total returns of any dividend setup. The key is verifying that the dividend is operationally sound before acting on the price signal.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/o-vs-nnn-reit-dividend-comparison', label: 'Realty Income vs NNN: Which Net Lease REIT Wins?' },
      { href: '/blog/dividend-yield-trap', label: 'The Dividend Yield Trap — When High Yield Is a Warning' },
      { href: '/blog/best-undervalued-dividend-stocks-q2-2026', label: 'Undervalued Dividend Stocks: Q2 2026 Outlook' },
    ],
  },

  'high-yield': {
    title: 'High Yield Dividend Stocks',
    description: 'Above-average dividend yields backed by established payout track records and FCF coverage.',
    metaDescription: 'High yield dividend stocks screened for sustainability 2026. Weiss valuation signals, payout ratios, and FCF coverage for income investors seeking above-average income.',
    editorial: [
      'A high dividend yield in a market where the average blue chip pays 2–3% is either a genuine opportunity or a warning that the payout is at risk. The difference matters: if the company cuts, you lose the income you were counting on and typically a significant portion of principal at the same time. High yield requires more scrutiny, not less.',
      'The stocks in this collection yield above average and have established payout histories — each has maintained its dividend through at least one major market downturn. That history provides real (if incomplete) evidence of sustainability. Past performance is not sufficient due diligence: always check the current FCF payout ratio and debt load before sizing a position.',
      'The Weiss signal is especially valuable in the high-yield universe. A stock whose yield is near its 10-year maximum is in one of two situations: the price has been pushed down by market fear that exceeds the actual business risk (a buying opportunity), or the market is correctly pricing in a future cut (a trap). The quality score and payout data on each stock\'s page help you distinguish between the two.',
    ],
    pillar: [
      {
        heading: 'What Makes a High Yield Safe vs. a Trap',
        paragraphs: [
          'A high yield becomes a trap when the dividend is sized beyond what the business can sustain. The warning signs are specific: FCF payout ratio above 90% (the dividend consumes essentially all free cash flow, leaving no buffer), debt-to-EBITDA rising (the company is borrowing to fund operations or the dividend itself), revenue declining over multiple quarters (the cash generation that funds the payout is eroding), and a payout ratio well above sector peers (management is maintaining the yield to avoid a sell-off rather than because the business supports it).',
          'AT&T in 2021 is the textbook case. The stock yielded above 8% for an extended period. Millions of income investors held it for the quarterly check. The payout ratio was elevated and covered by a complex mix of cash flows from legacy telecom and media assets. When the WarnerMedia spinoff was announced, the dividend was cut nearly in half. Investors who owned AT&T for the "safe high yield" lost years of compounding.',
          'The Weiss method adds a specific protection in the high-yield universe: it compares the current yield to the stock\'s own history, not to an abstract safety threshold. A stock that historically yields 4–6% and now yields 7% is flagging something — either an opportunity or a deteriorating business. The quality score is what helps you tell which.',
        ],
      },
      {
        heading: 'The Three Checks Before Buying a High-Yield Stock',
        paragraphs: [
          'First, FCF payout ratio: what percentage of free cash flow goes to the dividend? Under 60% is comfortable. 60–80% is acceptable with stable revenue. Above 80% requires a strong thesis for why cash flow will improve. Above 100% means the company is funding the dividend from debt or asset sales — unsustainable.',
          'Second, the payout trend: has the dividend been growing, flat, or declining over the past five years? A flat dividend in a growing revenue business is a red flag — management is either protecting the balance sheet or lacking confidence. A growing dividend (even modestly) signals management confidence in the cash flow trajectory.',
          'Third, the business model: does the high yield reflect a genuinely high-income business (net lease REITs, MLPs, BDCs) or a cyclically distressed price? The former can sustain structurally high yields indefinitely. The latter is a temporary state that resolves either through price recovery (if the dividend is maintained) or dividend cut (if it isn\'t). Know which one you own.',
        ],
      },
      {
        heading: 'When High Yield and Weiss Undervalue Coincide',
        paragraphs: [
          'The highest-conviction setup in the high-yield universe is when a stock with a long dividend history, strong FCF coverage, and an above-average yield also shows a Weiss Undervalued signal. This means: the dividend is structurally sound (history + FCF), the income is above average (yield), and the price is historically cheap (Weiss). Three independent signals pointing in the same direction.',
          'This combination is rare — it typically appears during sector-wide panics when indiscriminate selling pushes quality names down alongside genuinely distressed ones. In those moments, the high-yield names with strong quality scores are the ones worth examining most carefully.',
          'Use the DividendVisual quality score as the first filter: anything below 50 in the high-yield collection warrants extra caution regardless of the Weiss signal. Anything above 65 with an Undervalued signal is worth a detailed review of the specific analysis page.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/dividend-yield-trap', label: 'The Dividend Yield Trap — Why High Yield Is Sometimes a Warning' },
      { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to Find Undervalued Dividend Stocks' },
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
    ],
  },

  'low-payout-compounders': {
    title: 'Low Payout Compounders',
    description: 'Conservative payout ratios with maximum room for future dividend growth — compounding at its best.',
    metaDescription: 'Low payout ratio dividend stocks with maximum dividend growth potential. CAGR analysis, quality scores, and Weiss valuation for long-term income compounders.',
    editorial: [
      'A 1.5% yield growing at 12% annually generates more income per dollar invested than a static 5% yield — after about a decade. The math of compounding rewards patience: a $1,000 investment at 1.5% growing 12% annually generates $82/year after 15 years. The static 5% generates $50 forever. The compounder wins decisively over a long enough horizon.',
      'Low payout ratio companies have a structural advantage: they can raise dividends faster than earnings grow without straining the balance sheet. A business paying 20% of earnings has room to grow the dividend at 2–3x the rate of earnings growth. A business already at 80% payout has almost no such flexibility — every raise requires a proportional earnings increase first.',
      'Home Depot, Lowe\'s, and Texas Instruments started with modest yields and have built long enough track records to produce reliable Weiss signals. These are not traditional income stocks — they\'re growth businesses with dividend discipline. For investors with a 15–20 year horizon, they often deliver the best long-term income outcomes of any category in the dividend universe.',
    ],
    pillar: [
      {
        heading: 'The Yield on Cost Math That Changes Everything',
        paragraphs: [
          'Yield on cost is the annual dividend income divided by your original purchase price. It\'s the number that reveals whether a low-yield entry has been worth the patience. A $10,000 investment in Home Depot at a 2% yield in 2010 would be generating — as of 2026 — roughly 13% yield on cost, because the dividend has grown more than 6-fold in 16 years. The starting yield of 2% understated the long-term income dramatically.',
          'The math is straightforward. At 10% annual dividend CAGR (not unusual for low-payout compounders), a $1,000 investment at 1.5% yield generates $15 in year one. By year 10: $38. By year 15: $61. By year 20: $98. The cumulative income collected over 20 years exceeds $900 — nearly matching the original investment from dividends alone, before any capital appreciation.',
          'Contrast this with a 5% yield growing 2% annually. Year one: $50. Year 10: $61. Year 15: $67. Year 20: $74. The compounder, starting lower, surpasses the high-yield payer\'s annual income around year 17 and never looks back. The crossover point is the critical concept for anyone choosing between high yield now and high growth later.',
        ],
      },
      {
        heading: 'Why a Low Payout Ratio Is a Signal of Strength',
        paragraphs: [
          'A 20–35% payout ratio does not mean a company is stingy with shareholders. It means the company has options. It can grow the dividend 10–15% annually while earnings grow 8%. It can absorb a bad year without touching the dividend. It can accelerate raises when the business is doing well. High-payout companies have none of this flexibility — every dividend decision requires careful earnings management.',
          'The businesses in this collection are, in most cases, reinvesting the majority of their earnings into high-return projects: store expansion (HD, LOW), R&D and capex cycles (TXN), or operational scale (CTAS, MSFT). They\'re paying out enough to establish and grow a dividend track record while retaining the majority of earnings for internal compounding. This dual compounding — internal business reinvestment plus growing dividend — is the formula that has produced the best 20-year income outcomes in the US market.',
          'From a Weiss perspective, low-payout compounders have a shorter but growing history. The yield range is being established in real time — which means the signals are less historically anchored than a 50-year Dividend King\'s. This is a real limitation worth acknowledging: buy low-payout compounders when the quality signal is strong, even if the Weiss signal is less definitive.',
        ],
      },
      {
        heading: 'The Right Time Horizon for This Strategy',
        paragraphs: [
          'Low-payout compounders are explicitly a long-term strategy. If you need maximum income in years one through five, this is the wrong collection — the starting yields are low and the compounding takes time to matter. If you\'re in accumulation mode with a 15–20 year horizon before needing the income, this collection likely outperforms everything else in the dividend universe on a total income basis.',
          'The practical implementation: establish positions in high-quality compounders when the Weiss signal is at fair value or better, then hold through the growth phase without chasing yield. Re-evaluate if the payout ratio starts rising toward 60%+ (suggesting the company is beginning to prioritize income over reinvestment) or if dividend growth slows materially below 6% (suggesting the growth engine is decelerating).',
          'The DRIP calculator on each stock\'s page is particularly revealing for this collection. Enter a 10–12% CAGR assumption (conservative for the best compounders), set a 15–20 year horizon, and watch the yield-on-cost number. That number — not the starting yield — is what you\'re actually buying.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/home-depot-hd-dividend-analysis', label: 'Home Depot: The Low-Yield Stock That Became an Income Machine' },
      { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to Find Undervalued Dividend Stocks' },
      { href: '/blog/dividend-yield-trap', label: 'The Dividend Yield Trap Explained' },
    ],
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCollection(slug: string): Promise<CollectionRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/collections/${slug}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = COLLECTION_META[slug]
  if (!meta) return { title: slug }
  const year = new Date().getFullYear()
  return {
    title: `${meta.title} List ${year} — Dividend Yield Analysis`,
    description: meta.metaDescription,
    alternates: {
      canonical: `https://dividendvisual.com/collections/${slug}`,
    },
    openGraph: {
      title: `${meta.title} | DividendVisual`,
      description: meta.metaDescription,
      url: `https://dividendvisual.com/collections/${slug}`,
      type: 'article',
    },
  }
}

function pct(v: number | null, decimals = 2): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(decimals)}%`
}

function CollectionCard({ row }: { row: CollectionRow }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#6366f1]/40 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/ticker/${row.symbol}`}
            className="font-mono font-semibold text-[#f4f4f5] hover:text-[#6366f1] transition-colors"
          >
            {row.symbol}
          </Link>
          <div className="text-xs text-[#71717a] mt-0.5 line-clamp-1">{row.name}</div>
        </div>
        <SignalBadge signal={row.weissSignal} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
        <div>
          <div className="text-[#71717a]">Price</div>
          <div className="text-[#f4f4f5] font-medium">${row.currentPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[#71717a]">Yield</div>
          <div className="text-[#f4f4f5] font-medium">{pct(row.currentYield)}</div>
        </div>
        <div>
          <div className="text-[#71717a]">Quality</div>
          <div className={`font-semibold ${
            row.qualityScore >= 80 ? 'text-[#22c55e]' :
            row.qualityScore >= 60 ? 'text-[#6366f1]' :
            row.qualityScore >= 40 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
          }`}>
            {row.qualityScore}/100
          </div>
        </div>
        <div>
          <div className="text-[#71717a]">CAGR 5Y</div>
          <div className="text-[#f4f4f5] font-medium">{pct(row.dividendCagr5y, 1)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {row.isDividendKing && <DividendBadge type="king" />}
          {row.isDividendAristocrat && !row.isDividendKing && <DividendBadge type="aristocrat" />}
        </div>
        <Link
          href={`/analysis/${row.symbol.toLowerCase()}`}
          className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Analysis →
        </Link>
      </div>
    </div>
  )
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params
  const rows = await getCollection(slug)
  const meta = COLLECTION_META[slug] ?? { title: slug, description: '', editorial: [], pillar: [] }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${meta.title} — Dividend Yield Analysis`,
    description: meta.metaDescription,
    url: `https://dividendvisual.com/collections/${slug}`,
    publisher: { '@type': 'Organization', name: 'DividendVisual', url: 'https://dividendvisual.com' },
  }

  const itemListLd = rows.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${meta.title} — Dividend Stocks`,
    description: meta.metaDescription,
    url: `https://dividendvisual.com/collections/${slug}`,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://dividendvisual.com/analysis/${row.symbol.toLowerCase()}`,
      name: `${row.name} (${row.symbol})`,
    })),
  } : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {itemListLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
      <TrackPageView event="collection_viewed" properties={{ slug }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Collections', href: '/watchlist' },
        { label: meta.title },
      ]} />

      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-2">{meta.title}</h1>
        <p className="text-xs text-[#52525b] mb-6">{rows.length} stocks · Weiss valuation updated daily</p>
        {meta.editorial.length > 0 && (
          <div className="max-w-3xl space-y-3 border-l-2 border-[#6366f1]/20 pl-5">
            {meta.editorial.map((para, i) => (
              <p key={i} className="text-sm text-[#71717a] leading-relaxed">{para}</p>
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-[#71717a]">
          No data available yet. Run the ingestion scripts first.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rows.map((row) => (
            <CollectionCard key={row.symbol} row={row} />
          ))}
        </div>
      )}

      {/* Pillar content — below the grid for Google and interested readers */}
      {meta.pillar.length > 0 && (
        <div className="mt-16 max-w-3xl">
          <div className="border-t border-[#1e1e2e] pt-12">
            <article className="prose-dv">
              {meta.pillar.map((section) => (
                <div key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ))}
            </article>

            {meta.relatedBlog && meta.relatedBlog.length > 0 && (
              <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
                <p className="text-xs text-[#71717a] uppercase tracking-wide font-medium mb-4">Related Reading</p>
                <div className="flex flex-col gap-2">
                  {meta.relatedBlog.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                    >
                      → {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
