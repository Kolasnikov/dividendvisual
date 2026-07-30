import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { Company, ComputedMetrics } from '@/lib/types'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { DividendBadge } from '@/components/ui/DividendBadge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { TrackPageView } from '@/components/analytics/TrackPageView'
import {
  SECTOR_SLUGS,
  getSectorApiNameBySlug,
  getSectorCanonicalUrl,
  isDuplicateSectorRoute,
} from '@/lib/sector-mapping'
import { getWatchlistStocks } from '@/lib/stock-data'

type SectorRow = Company & ComputedMetrics

interface PillarSection {
  heading: string
  paragraphs: string[]
}

interface SectorMeta {
  dbSector: string
  title: string
  metaDescription: string
  editorial: string[]
  pillar: PillarSection[]
  relatedCollection?: string
  relatedCollectionLabel?: string
  relatedBlog?: { href: string; label: string }[]
}

const YEAR = new Date().getFullYear()

const SECTOR_META: Record<string, SectorMeta> = {
  utilities: {
    dbSector: 'Utilities',
    title: `Best Utility Dividend Stocks ${YEAR}`,
    metaDescription: `Best utility dividend stocks ${YEAR} ranked by Weiss yield signal, quality score, and dividend CAGR. NEE, SO, DUK, WEC, AEP and more — screened for payout reliability and yield history.`,
    editorial: [
      'Regulated electric and gas utilities have produced some of the most reliable dividend growth records in the equity market — not because they are exciting businesses, but because they are allowed to be boring. State public utility commissions set their rates, approve their capital budgets, and guarantee a return on equity. The dividend grows when the utility builds infrastructure, which earns a higher allowed return, which funds a bigger payout.',
      `For the Geraldine Weiss method, utilities are near-ideal candidates. Dividend histories stretch decades. The yield range is stable, shaped by rate cycles rather than business disruption. When Treasury yields rise, utility prices fall mechanically — pushing their yields toward historical highs and triggering Weiss undervalue signals. This creates predictable, recurring entry opportunities for patient income investors.`,
      'The risk is interest rate sensitivity, not business quality. A utility entering Weiss undervalue territory during a rate-hike cycle is almost always a price problem, not a company problem. The tenants are still paying their bills, the regulators are still approving the rates, and the dividend is still growing — the stock is just cheaper because bonds are competing for income capital.',
    ],
    pillar: [
      {
        heading: 'How Rate Regulation Funds Dividend Growth',
        paragraphs: [
          'Regulated utilities earn a return on their rate base — the value of assets they own and operate. When a utility builds a new transmission line, solar farm, or pipeline, that asset joins the rate base. The state public utility commission allows the utility to earn 9–11% on that capital, which flows through as higher earnings and, eventually, a higher dividend.',
          'This creates a direct link between capital investment and dividend growth that almost no other sector has. Utilities in the middle of large capital programs — NextEra\'s renewable buildout, Southern Company\'s nuclear expansion — grow dividends faster than utilities with mature, stable asset bases. The capex pipeline is the single most important forward-looking indicator for utility dividend growth.',
          'Dividend payout ratios for utilities typically run 60–75% of earnings — higher than most industrial sectors but appropriate given the stability of regulated earnings. The FCF payout ratio often looks elevated because utilities spend heavily on capital investment, but as long as the regulatory framework is intact, the earnings-based payout is the right measure of sustainability.',
        ],
      },
      {
        heading: 'Interest Rates, Utility Prices, and the Weiss Opportunity Cycle',
        paragraphs: [
          'Utilities are among the most interest-rate sensitive equities because income investors compare their dividend yields to Treasury yields. When the 10-year Treasury yield rises, income capital rotates from utilities to bonds — not because anything changed in the underlying business, but because the competing income improved. Utility prices fall until the dividend yield spread over Treasuries is competitive again.',
          'This mechanical repricing creates Weiss undervalue signals in the utility sector. Rate-hike cycles produce extended periods where utility yields approach 10-year highs — sometimes for one to three years — while the underlying businesses continue growing their dividends undisturbed. Investors who buy during rate-driven weakness own both the elevated yield and the eventual price recovery when rates stabilize.',
          'NextEra Energy, Southern Company, and Duke Energy have all traded at historically attractive yields during rate-hike periods while continuing to raise dividends. The pattern is consistent: the Weiss signal fires during macro rate pressure, not during company-specific distress. That distinction is what makes rate-driven utility undervalue signals some of the most reliable in the entire dividend universe.',
        ],
      },
      {
        heading: 'What to Check Before Buying a Utility Stock',
        paragraphs: [
          'Not all utilities are equal. Before acting on a Weiss undervalue signal, examine four things: the regulatory environment (some state commissions are more constructive than others), the capital expenditure pipeline (utilities in growth phases raise dividends faster), balance sheet leverage (high debt loads limit flexibility in adverse conditions), and transition risk (fossil-fuel-heavy utilities face long-term regulatory headwinds that renewable-heavy peers do not).',
          'NextEra Energy (NEE) represents the premium case: regulated Florida utility, extensive renewable energy subsidiary with long-term contracted cash flows, and one of the best dividend growth records in the sector. WEC Energy and Atmos Energy tend to score well on quality metrics due to efficient operations and conservative balance sheets.',
          'For dividend investors, the combination of Undervalued Weiss signal and a quality score above 60 — applied to a utility with a constructive regulatory environment — represents the strongest setup available in this sector.',
        ],
      },
    ],
    relatedCollection: 'utilities',
    relatedCollectionLabel: 'Utilities Collection',
    relatedBlog: [
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
      { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to Find Undervalued Dividend Stocks' },
    ],
  },

  'consumer-staples': {
    dbSector: 'Consumer Defensive',
    title: `Best Consumer Staples Dividend Stocks ${YEAR}`,
    metaDescription: `Best consumer staples dividend stocks ${YEAR} — KO, PG, PEP, KMB, CL ranked by Weiss signal, quality score, and dividend streak. Recession-resilient income stocks screened by 10-year yield history.`,
    editorial: [
      'Consumer staples are the heartland of dividend investing. These businesses sell products people buy regardless of what the economy is doing — toothpaste, soap, beverages, snacks, cigarettes. Pricing power is structural: a Coca-Cola or Procter & Gamble can raise prices most years because their products have no credible substitute at the consumer level. This generates cash reliably, which funds dividends reliably, which creates the long yield histories the Weiss method depends on.',
      `The consumer staples sector dominates the Dividend Kings list. Coca-Cola, Procter & Gamble, Colgate-Palmolive, Kimberly-Clark — these are not coincidental. The business model that produces 50-year dividend streaks requires brand moats that protect pricing, essential products that maintain demand through recessions, and global distribution that smooths geographic risk.`,
      'The Weiss signal for consumer staples is unusually reliable because the dividends themselves are unusually stable. A company that has raised its dividend through the 1973–75 oil shock, the 2008 financial crisis, and COVID without interruption has a yield range anchored by decades of real market cycles. When a consumer staples stock trades at its historical yield high, it is almost always a price problem — not a business problem.',
    ],
    pillar: [
      {
        heading: 'Why Dividend Kings Dominate Consumer Staples',
        paragraphs: [
          'The 50-year dividend streak requirement for Dividend King status filters specifically for the kind of business model consumer staples companies possess. A company cannot raise its dividend every year for half a century unless it generates cash reliably in almost any economic environment — requiring inelastic demand, pricing power to offset input cost increases, and balance sheet discipline to fund the raise even in bad years.',
          "Coca-Cola generates roughly $9–10 billion in free cash flow annually while paying $7–8 billion in dividends. This level of FCF coverage, combined with a brand that has endured for more than a century, explains why the 60+ year streak is sustainable. Procter & Gamble's 60+ year streak reflects the same principle across dozens of household brands that collectively produce one of the most predictable revenue streams in global commerce.",
          "For Weiss-method investors, this streak quality matters because it validates the yield range. A company with five years of dividend history has a thin, potentially unreliable range. A consumer staples King with 50+ years has a range shaped by actual economic cycles — recessions, inflation spikes, secular demand shifts. The undervalue signal from a King with that history carries significantly more weight.",
        ],
      },
      {
        heading: 'Reading the Weiss Signal in Consumer Staples',
        paragraphs: [
          'Consumer staples stocks tend to enter Weiss undervalue territory in one of two scenarios. The first is sector-wide rotation: when growth stocks lead the market, defensive staples underperform, their relative prices fall, and yields rise toward historical highs. The second is company-specific: a disappointing earnings quarter, a product category losing market share, or a management change that temporarily reprices the stock lower.',
          'The first scenario — sector rotation — produces the cleanest Weiss signals. The business itself is unchanged; the price is lower because investors preferred growth. When Coca-Cola traded near its 10-year yield high in 2023, the company was still generating $9 billion in FCF and raising the dividend. The yield signal was driven by market preference, not business deterioration.',
          'The second scenario requires more scrutiny. A staples company with declining volumes, rising private-label competition, or distribution challenges may have a legitimately elevated yield — not as a buying opportunity, but as a warning. The quality score helps distinguish: a company with declining FCF coverage and a weakening streak warrants caution even at a Weiss undervalue reading.',
        ],
      },
      {
        heading: 'Sector Characteristics That Support Long-Term Income',
        paragraphs: [
          'Consumer staples businesses share structural characteristics that make them exceptional long-term income vehicles: steady revenue (their products sell in recessions as reliably as in expansions), pricing power (established brands routinely raise prices 3–5% annually), international diversification (KO, PG, and PEP generate 40–60% of revenue outside the US), and capital efficiency (high returns on equity without requiring continuous reinvestment).',
          'The trade-off is growth. Consumer staples are mature businesses — revenue grows 2–5% annually in good years. For investors who need the income to compound over 15–20 years, the dividend growth rate matters more than the starting yield. A 5% annual dividend CAGR compounds meaningfully over 20 years; a static 5% yield on a non-growing business does not.',
          'The best consumer staples positions combine a Weiss undervalue signal (price is historically cheap), a quality score above 70 (dividend is safe and growing), and a dividend CAGR above 4% (income compounds meaningfully). All three together — entry price, safety, and growth — is the setup that has produced the best long-term income outcomes in this sector.',
        ],
      },
    ],
    relatedCollection: 'dividend-kings',
    relatedCollectionLabel: 'Dividend Kings',
    relatedBlog: [
      { href: '/blog/ko-vs-pep-dividend-comparison', label: 'KO vs PEP: Which Beverage King Compounds Better?' },
      { href: '/blog/coca-cola-ko-dividend-analysis', label: 'Coca-Cola (KO) Dividend Analysis' },
      { href: '/blog/procter-gamble-pg-dividend-analysis', label: 'Procter & Gamble (PG) Dividend Analysis' },
    ],
  },

  healthcare: {
    dbSector: 'Healthcare',
    title: `Best Healthcare Dividend Stocks ${YEAR}`,
    metaDescription: `Best healthcare dividend stocks ${YEAR} — JNJ, ABBV, ABT, MDT, PFE and more ranked by Weiss signal and quality score. Dividend growth in pharma, medical devices, and managed care.`,
    editorial: [
      'Healthcare is one of the most internally diverse sectors for dividend investors. Pharmaceuticals, medical device manufacturers, managed care organizations, and specialty distributors all share the healthcare label — but their dividend characteristics, risk profiles, and Weiss signal reliability differ considerably. A drug company facing patent cliffs behaves differently from a medical device manufacturer with a recurring consumables business model.',
      'The dividend aristocrats and kings within healthcare — Johnson & Johnson, Abbott Laboratories, Becton Dickinson, Medtronic — have maintained their streaks through one of the most disruptive periods in pharmaceutical history: the Affordable Care Act, COVID, biosimilar competition, and GLP-1 drug displacement. Their survival reflects diversified business models that do not depend on any single drug or product line.',
      'For Weiss-method investors, healthcare offers a distinctive combination: companies with long enough dividend histories to produce reliable yield ranges, exposure to structural demographic tailwinds (aging populations globally), and defensive characteristics that hold up in market downturns. The challenge is distinguishing dividend quality from yield traps where an elevated yield signals business distress rather than an attractive entry point.',
    ],
    pillar: [
      {
        heading: 'Pharmaceutical vs. Device vs. Services: Different Dividend Risk Profiles',
        paragraphs: [
          "Drug companies face binary risks that medical device and services companies do not. When a blockbuster drug loses patent protection, generic competition can reduce revenues by 80% within 18 months. AbbVie's Humira patent cliff cut Humira US revenues by more than 50% in 2023. AbbVie managed this because it had built a pipeline (Skyrizi, Rinvoq) to offset the loss. Companies without replacement revenue struggle, and their dividends follow.",
          "Medical device companies have more predictable cash flows. A company selling consumables used in hospital procedures — Becton Dickinson's needles, Medtronic's cardiac devices — benefits from recurring purchase patterns. Hospitals don't switch suppliers frequently, and replacement cycles are predictable. This predictability supports the stable free cash flow that funds reliable dividends.",
          'Managed care and health services (UnitedHealth Group, CVS Health) have different dynamics: revenues are contractual, which creates predictable top-line growth. Their margins face regulatory pressure — medical loss ratios for insurers, drug pricing reform for pharmacy benefit managers — which introduces political risk that device companies do not face.',
        ],
      },
      {
        heading: 'Aging Demographics and Structural Dividend Support',
        paragraphs: [
          'The primary structural tailwind for healthcare dividend stocks is demographic inevitability. The global population over 65 will nearly double by 2050. Older populations consume more healthcare services, medications, and medical devices — providing a demand floor that supports revenue growth across most healthcare subsectors regardless of economic cycles.',
          "For dividend investors, this demographic tailwind matters because it underpins the free cash flow that funds dividend raises. A medical device company selling products to an aging population has a more predictable growth trajectory than one dependent on cyclical industrial demand. The cash flows are more foreseeable, the dividend increases are more plannable, and the Weiss yield range is more reliable as a result.",
          'Companies like Abbott Laboratories, which generates revenue from diagnostics, medical devices, established pharmaceuticals, and nutrition products, benefit from multiple demand drivers within a single entity. This diversification reduces the binary risk that single-drug pharmaceutical companies face and produces smoother free cash flow — and smoother dividend growth records.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/jnj-vs-abbv-dividend-comparison', label: 'JNJ vs ABBV: Healthcare Dividends — Stability vs High Yield' },
      { href: '/blog/unh-vs-cvs-dividend-comparison', label: 'UNH vs CVS: Healthcare Dividends — Compounder or Value Trap?' },
      { href: '/blog/johnson-johnson-jnj-dividend-analysis', label: 'Johnson & Johnson (JNJ) Dividend Analysis' },
    ],
  },

  financials: {
    dbSector: 'Financial Services',
    title: `Best Financial Sector Dividend Stocks ${YEAR}`,
    metaDescription: `Best financial sector dividend stocks ${YEAR} — JPM, V, MA, AFL, CB, TROW ranked by Weiss signal and quality score. Banks, insurers, and payment processors screened for dividend reliability.`,
    editorial: [
      'The financial sector contains the most internally varied dividend stocks of any sector. Banks, insurance companies, payment networks, asset managers, and brokerages share the financials label but behave differently across economic cycles. Banks are rate-sensitive and credit-cycle-dependent. Insurers compound float at fixed-income rates. Payment networks like Visa and Mastercard are volume-driven businesses with near-zero credit risk.',
      'The 2008 financial crisis left a permanent mark on bank dividend history. Most major banks cut or eliminated dividends during the crisis, destroying years of streak history. This is why classic Dividend Kings and Aristocrats lists have limited bank representation — the streak requirement filters out companies that cut during 2008–2009. Insurers with diversified underwriting books (Aflac, Chubb, Travelers) fared better; payment processors (Visa, Mastercard) went public or built their streaks after the crisis.',
      'For Weiss-method investors, the best signals in financials tend to come from high-quality insurers and payment processors, where dividend histories are cleaner and the yield range reflects genuine valuation cycles rather than regulatory capital constraints.',
    ],
    pillar: [
      {
        heading: 'Banks vs. Insurers vs. Payment Networks: Dividend Quality Differences',
        paragraphs: [
          "Banks pay dividends from net interest income and fee revenue, but their ability to pay depends on regulatory capital requirements that don't apply to other sectors. The Federal Reserve's stress tests cap how much capital banks can return to shareholders — meaning bank dividend increases are subject to regulatory approval, not just board discretion. This regulatory ceiling limits the streak reliability that Weiss signals depend on.",
          'Property and casualty insurers (Chubb, Travelers) have different dynamics. Their earnings fluctuate with catastrophe claims, but premium rates in hard markets tend to recover and exceed claim costs. Aflac, which sells supplemental health insurance primarily in Japan, generates exceptionally stable premium income with limited credit cycle exposure. These characteristics produce cleaner dividend histories and more reliable Weiss yield ranges.',
          "Payment networks (Visa, Mastercard) have the cleanest business models in financials for dividend investors: they take a toll on global electronic commerce with minimal credit risk (the issuing banks hold the credit risk, not the networks). Revenue grows with transaction volume. Margins are structurally high. Dividend growth rates have historically been among the fastest of any sector — though the starting yields are low.",
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
      { href: '/blog/dividend-yield-trap', label: 'The Dividend Yield Trap — When High Yield Is a Warning' },
    ],
  },

  energy: {
    dbSector: 'Energy',
    title: `Best Energy Dividend Stocks ${YEAR}`,
    metaDescription: `Best energy dividend stocks ${YEAR} — XOM, CVX, OKE, PSX, EPD ranked by Weiss signal, quality score, and dividend streak. Oil and midstream dividend stocks screened by yield history.`,
    editorial: [
      'Energy dividend stocks occupy a unique position: high yields, cyclical earnings, and long dividend histories shaped by oil price cycles that no other sector experiences. Exxon Mobil and Chevron have raised dividends for 40+ consecutive years despite oil prices ranging from $15 to $145 per barrel in that period — a range that would have destroyed the dividends of any business with less financial discipline.',
      'The Weiss method is well-suited to energy dividend stocks because the long histories produce yield ranges that span multiple oil cycles. When oil prices collapse and integrated major share prices fall sharply, yields approach historical highs — triggering Weiss undervalue signals at precisely the moment sentiment is most negative. Investors who bought XOM or CVX during the 2015–2016 oil bust or the 2020 COVID crash at historical yield highs earned significant income and capital returns as energy prices recovered.',
      'Midstream energy companies (pipelines and gathering systems) have a different profile: their revenues are fee-based on volume rather than commodity price, making their dividends less cyclical than integrated majors. OKE and EPD generate cash flows more like toll roads than oil producers — volume-dependent, but not directly exposed to the price of the barrel.',
    ],
    pillar: [
      {
        heading: 'Integrated Majors vs. Midstream: Two Different Dividend Models',
        paragraphs: [
          "Integrated oil majors (XOM, CVX) produce oil and gas, refine it, and sell petroleum products. Their earnings are directly tied to commodity prices — when prices collapse, earnings fall and the dividend payout ratio rises sharply. The companies maintain the dividend by drawing on balance sheet strength until prices recover. This is why the streak matters: it proves the company has the financial capacity to maintain the payout through the worst commodity cycles.",
          "Exxon Mobil has raised its dividend for more than 40 consecutive years, including through the 1986 oil price collapse, the 1998–99 Asian crisis, the 2008 financial crisis, 2015–16, and the 2020 COVID demand destruction. Each of those cycles would have eliminated the dividend of a less financially disciplined company. XOM and CVX carry conservative balance sheets specifically to support the dividend through these cycles.",
          'Midstream companies (OKE, EPD) operate pipelines and processing infrastructure under fee-based contracts. When a natural gas producer contracts to ship through a pipeline, the midstream company earns its fee regardless of the commodity price — as long as volumes flow. This makes midstream dividends less cyclical and more predictable, though they are not immune to volume declines when low commodity prices suppress drilling activity.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/xom-vs-cvx-dividend-comparison', label: 'XOM vs CVX: Which Energy Dividend Survives the Oil Price Cycle?' },
      { href: '/blog/dividend-yield-trap', label: 'The Dividend Yield Trap Explained' },
    ],
  },

  technology: {
    dbSector: 'Technology',
    title: `Best Technology Dividend Stocks ${YEAR}`,
    metaDescription: `Best technology dividend stocks ${YEAR} — MSFT, TXN, AAPL, CSCO, AVGO, IBM ranked by Weiss signal and dividend CAGR. High-growth dividend payers in software, semiconductors, and IT services.`,
    editorial: [
      'Technology dividend stocks are the outliers of income investing — businesses that started as non-dividend growth stocks and evolved, as their cash generation compounded beyond what they could efficiently reinvest, into dividend payers with some of the fastest-growing payouts in the market. Microsoft, Texas Instruments, Apple, Broadcom, and Cisco represent different points on this evolution.',
      'The dividend yields are low by income-stock standards — typically 1–3% — but the growth rates are exceptional. Microsoft has grown its dividend at roughly 10–11% annually for the past decade. Texas Instruments at 12–15%. These growth rates, applied over 15–20 years with DRIP reinvestment, produce yield-on-cost figures that dwarf what a static 4–5% utility yield generates over the same period.',
      'The Weiss method applies to technology dividend payers, but with a caveat: most have shorter dividend histories than consumer staples Kings. A 10–15 year yield history is enough to anchor a Weiss range, but the signal carries less historical weight than one anchored by 40–50 years of data. Use the quality score and dividend growth rate as co-equal signals alongside Weiss for technology dividend stocks.',
    ],
    pillar: [
      {
        heading: 'Low Yield, High Growth: The Long-Term Income Math',
        paragraphs: [
          'A 1.5% dividend growing at 12% annually produces more income per dollar invested than a static 5% yield — after approximately 11–12 years. The crossover point is the central concept for evaluating technology dividend stocks as income vehicles. Before year 11, the high-yield stock wins. After year 11, the compounder wins permanently and the income gap widens every year.',
          "Texas Instruments illustrates this. The stock yielded roughly 1.5–2% in 2012, uninteresting to income investors focused on current yield. The company then raised its dividend at 14% annually for the next decade. By 2022, investors who bought in 2012 had a yield on cost of 7–10% — significantly above what most dedicated income stocks were yielding, with one of the strongest balance sheets in the semiconductor industry.",
          "Microsoft's dividend has grown from $0.92/year in 2012 to over $3.00/year today — a 225% increase. Investors who held through that growth earned far more in income per dollar invested than they would have from a higher-starting-yield but slower-growing alternative. The starting yield is almost irrelevant over a 15+ year horizon if the CAGR is high enough.",
        ],
      },
    ],
    relatedCollection: 'low-payout-compounders',
    relatedCollectionLabel: 'Low Payout Compounders',
    relatedBlog: [
      { href: '/blog/aapl-vs-msft-dividend-comparison', label: 'AAPL vs MSFT: Which Tech Giant Pays the Better Dividend?' },
      { href: '/blog/avgo-vs-qcom-dividend-comparison', label: 'AVGO vs QCOM: The Semiconductor Dividend Battle' },
    ],
  },

  'real-estate': {
    dbSector: 'Real Estate',
    title: `Best REIT Dividend Stocks ${YEAR}`,
    metaDescription: `Best REIT dividend stocks ${YEAR} — O, NNN, PSA, DLR, PLD and more ranked by Weiss signal, quality score, and yield history. Real estate investment trusts screened for dividend reliability.`,
    editorial: [
      'Real estate investment trusts (REITs) are legally required to distribute at least 90% of taxable income to shareholders — producing some of the highest dividend yields in the equity market. For dividend investors using the Weiss method, REITs offer long yield histories anchored by interest rate cycles and property market conditions that create predictable, recurring valuation opportunities.',
      'The most reliable REIT dividend payers for Weiss analysis are net lease REITs — companies like Realty Income (O) and NNN REIT that collect contractually fixed rents from credit-rated tenants under 10–20 year leases. Their cash flows are more bond-like than equity-like: contracted, long-dated, and minimally sensitive to economic conditions.',
      'When interest rates rise and REIT prices fall, the Weiss signal fires — not because the business is impaired, but because the price has been repriced lower by macro rate forces. This is the same dynamic as utility undervalue signals: the dividend is intact, the tenants are paying, the only thing that changed is the comparison to Treasury yields.',
    ],
    pillar: [
      {
        heading: "Why Standard Payout Ratios Don't Apply to REITs",
        paragraphs: [
          "GAAP accounting requires real estate to be depreciated over time, even though physical property often appreciates in value. This depreciation charge reduces reported earnings without reducing cash generation — so a REIT reporting a '110% payout ratio' based on GAAP EPS is almost certainly in good financial health. The correct measure is AFFO (Adjusted Funds from Operations) or FFO payout, which adds back depreciation and excludes property sale gains.",
          "Most high-quality REITs run AFFO payout ratios of 70–85%, which is fully sustainable and typical for the sector. Before evaluating any REIT's dividend safety, always determine whether the payout ratio is GAAP-based (potentially misleading) or FFO/AFFO-based (the correct measure). DividendVisual's quality score uses FCF-based coverage metrics that are more appropriate for the REIT sector.",
          'Monthly dividend payment schedules — offered by Realty Income, MAIN Street Capital, and others — add an additional dimension of income predictability. Monthly compounding of reinvested dividends accelerates the DRIP effect compared to quarterly payers, making these names particularly well-suited to the DRIP calculator.',
        ],
      },
    ],
    relatedCollection: 'reits',
    relatedCollectionLabel: 'REITs Collection',
    relatedBlog: [
      { href: '/blog/o-vs-nnn-reit-dividend-comparison', label: 'Realty Income vs NNN: Which Net Lease REIT Wins?' },
      { href: '/blog/dividend-yield-trap', label: 'The Dividend Yield Trap Explained' },
    ],
  },

  industrials: {
    dbSector: 'Industrials',
    title: `Best Industrial Dividend Stocks ${YEAR}`,
    metaDescription: `Best industrial dividend stocks ${YEAR} — CAT, HON, UNP, LMT, NOC, UPS ranked by Weiss signal, quality score, and dividend CAGR. Dividend-paying industrials screened by yield history.`,
    editorial: [
      'The industrials sector contains a wide range of dividend payers: defense contractors, railroads, logistics companies, factory automation specialists, and industrial conglomerates. What unites them from a dividend investor\'s perspective is their position in the capital goods and infrastructure cycle — demand is strong when economies expand, weaker when companies pull back on investment.',
      'Defense contractors (Lockheed Martin, Northrop Grumman, General Dynamics) are the most dividend-reliable subset because their revenues are government contracts rather than commercial cycles. The US defense budget has grown in almost every year since the 1990s, creating the kind of predictable, contractual cash flow that supports the long dividend streaks defense contractors have accumulated.',
      'Railroads (UNP, NSC, CSX) occupy a middle position: regulated, essential infrastructure with pricing power, but sensitive to freight volume cycles. Their dividend histories are long and their yields are moderate. The combination of pricing power and infrastructure moats has allowed Class I railroads to raise dividends through multiple economic cycles.',
    ],
    pillar: [
      {
        heading: 'Defense vs. Cyclical Industrials: A Key Dividend Distinction',
        paragraphs: [
          'Defense contractors generate revenue from multi-year government contracts. When the Department of Defense awards a large production contract to Lockheed Martin, that revenue is contracted for years into the future. The backlog of signed contracts serves as a forward revenue indicator that commercial manufacturers lack — giving defense dividends an unusual degree of forward predictability.',
          "Cyclical industrials — manufacturers of construction equipment, factory automation, or logistics infrastructure — face genuine earnings variability across economic cycles. Caterpillar's earnings in a construction boom year dwarf its earnings in a recession year. This variability shows up in Weiss yield ranges: the yield band is wider for cyclical industrials, and signals require more context before acting.",
          'Illinois Tool Works, Cintas, and Parker Hannifin have accumulated long dividend streaks despite cyclical exposure by maintaining conservative balance sheets and managing through-cycle cash generation carefully. Their streaks are evidence of financial discipline as much as business quality — and that discipline is exactly what makes Weiss signals on these companies worth taking seriously.',
        ],
      },
    ],
    relatedCollection: 'dividend-aristocrats',
    relatedCollectionLabel: 'Dividend Aristocrats',
    relatedBlog: [
      { href: '/blog/cat-vs-mmm-dividend-comparison', label: 'CAT vs MMM: Industrial Dividend Giants — Growth vs. Recovery' },
      { href: '/blog/lmt-vs-noc-dividend-comparison', label: 'LMT vs NOC: Which Defense Dividend Is Built to Last?' },
    ],
  },

  'communication-services': {
    dbSector: 'Communication Services',
    title: `Telecom Dividend Stocks ${YEAR}`,
    metaDescription: `AT&T and Verizon dividend analysis ${YEAR} — T and VZ ranked by Weiss signal, quality score, and yield history. High-yield telecom dividend stocks screened for payout sustainability.`,
    editorial: [
      "The communication services sector, for dividend investors, effectively means AT&T and Verizon — two of the highest-yielding large-cap dividend stocks in the US market. Both yield well above the S&P 500 average, both have long dividend histories, and both have faced serious structural challenges from debt-heavy wireless spectrum acquisitions that have constrained free cash flow and dividend growth.",
      'AT&T cut its dividend in half in 2022 when it spun off WarnerMedia. Verizon has maintained its dividend but grown it at a very slow pace — around 2% annually — as free cash flow has been constrained by massive 5G infrastructure capital investment. These are high-yield stocks, but they require more scrutiny than their yields suggest.',
      "The Weiss signal on telecom stocks needs to be read alongside the quality score carefully. An elevated yield that signals 'undervalued' by Weiss standards may instead reflect market concern about dividend sustainability — the yield trap scenario. AT&T in 2020–2021 is the textbook example: the Weiss signal appeared favorable, but the quality score and FCF payout metrics were warning of the cut that eventually came.",
    ],
    pillar: [
      {
        heading: 'Understanding the Telecom Yield Trap Risk',
        paragraphs: [
          "AT&T's dividend cut is the most prominent recent example of the yield trap in the blue-chip dividend universe. For several years, AT&T yielded 6–8%. Income investors held it for the quarterly check. When the WarnerMedia spinoff was announced, the dividend was cut nearly 50%, wiping out the income thesis that had supported the position.",
          "The warning signs were visible: FCF payout ratio above 80%, debt load among the highest of any non-financial S&P 500 company, and a dividend that had been frozen rather than growing — signaling management's own uncertainty about the payout level. The Weiss signal showed high yield, but the quality score reflected the payout strain. In cases like this, the quality score should override the Weiss signal.",
          'Verizon is a different case: the dividend has continued and the business generates genuine free cash flow — but FCF is consumed largely by network capex and debt service. Dividend growth is minimal. For investors who need income to compound over 15+ years, the ~2% CAGR makes it a poor compounder relative to lower-yielding alternatives with faster growth.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/t-vs-vz-dividend-comparison', label: 'T vs VZ: High-Yield Telecom — Recovery Play or Reliable Income?' },
      { href: '/blog/dividend-yield-trap', label: 'The Dividend Yield Trap Explained' },
    ],
  },

  'consumer-discretionary': {
    dbSector: 'Consumer Cyclical',
    title: `Best Consumer Discretionary Dividend Stocks ${YEAR}`,
    metaDescription: `Best consumer discretionary dividend stocks ${YEAR} — MCD, HD, LOW, SBUX, NKE ranked by Weiss signal, quality score, and dividend CAGR. Discretionary dividend compounders with quality growth records.`,
    editorial: [
      "Consumer discretionary dividend stocks are, almost by definition, low-yield but fast-growing income vehicles. McDonald's, Home Depot, Lowe's, and Nike all yield under 3%, but have grown dividends at 8–15% annually over the past decade. This makes them compounders rather than income generators in the traditional sense — the starting yield is unimpressive, but the income 10–15 years forward is substantial.",
      "What sets these companies apart from typical discretionary retailers is their franchise economics or market position dominance. McDonald's franchisees pay royalties regardless of consumer sentiment fluctuations. Home Depot benefits from a home improvement market with limited online substitutability for heavy building materials. These structural advantages create more reliable cash flows than pure consumer spending exposure would suggest.",
      'For Weiss-method investors, the shorter dividend histories of many consumer discretionary stocks — most only started paying meaningful dividends in the 2000s — mean the yield range is being established in real time. The signals are less historically anchored than a 50-year Dividend King\'s. Use the quality score and dividend CAGR as primary filters, with Weiss as confirmation.',
    ],
    pillar: [
      {
        heading: 'Franchise Economics and Dividend Reliability',
        paragraphs: [
          "McDonald's derives approximately 95% of its revenue from franchise royalties and rents rather than direct restaurant operations. This structure insulates the parent company from food cost inflation, labor costs, and local operating variability — the franchisees absorb those risks. McDonald's collects a percentage of gross sales, which grows with inflation and volume, and has grown its dividend for more than 45 consecutive years as a result.",
          'Home Depot and Lowe\'s benefit from the home improvement category\'s unique properties: large, heavy building materials are difficult to ship profitably for online retailers, and the "pro" customer (contractors, builders) values proximity and service relationships over minor price differences. This structural protection of the physical store model supports consistently growing free cash flow.',
          'These franchise and category-position moats are what allow consumer discretionary companies to generate the stable, growing cash flows needed for long dividend streaks — despite operating in a sector traditionally viewed as cyclical. The distinction between moat-protected discretionary and commodity discretionary is the key analytical question before buying into a Weiss signal here.',
        ],
      },
    ],
    relatedCollection: 'low-payout-compounders',
    relatedCollectionLabel: 'Low Payout Compounders',
    relatedBlog: [
      { href: '/blog/home-depot-hd-dividend-analysis', label: 'Home Depot: The Low-Yield Stock That Became an Income Machine' },
      { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to Find Undervalued Dividend Stocks' },
    ],
  },

  materials: {
    dbSector: 'Basic Materials',
    title: `Materials Sector Dividend Stocks ${YEAR}`,
    metaDescription: `Materials sector dividend stocks ${YEAR} — SHW, ECL, PPG, NUE, RPM ranked by Weiss signal and quality score. Specialty chemicals and materials companies screened for dividend reliability.`,
    editorial: [
      "The materials sector dividend stocks in the DividendVisual universe are dominated by specialty chemicals and coatings companies — Sherwin-Williams, Ecolab, PPG Industries, and RPM International — rather than commodity producers. This distinction matters enormously for dividend investors: specialty chemicals companies have pricing power and moats that commodity materials producers fundamentally lack.",
      "Sherwin-Williams has raised its dividend for more than 45 consecutive years — an Aristocrat approaching King status — built on a distribution moat (the company-owned store network) that competitors have found nearly impossible to replicate. Ecolab's 30+ year streak reflects the switching cost moat in industrial cleaning and water treatment, where customers prioritize reliability over price.",
      'Nucor (NUE), a steel producer, is the exception: a commodity producer that has maintained a long dividend streak through disciplined cost management, a flexible mini-mill production model that can adjust capacity to market conditions, and a conservative balance sheet that has allowed it to maintain dividends even during steel price downturns.',
    ],
    pillar: [
      {
        heading: 'Specialty Chemicals vs. Commodity Materials: Why the Distinction Matters',
        paragraphs: [
          'Commodity materials companies — steel producers, aluminum smelters, basic chemical manufacturers — earn returns that track global commodity prices. In commodity up-cycles, they generate exceptional free cash flow. In down-cycles, margins compress and free cash flow evaporates. This volatility makes sustained dividend streaks nearly impossible: the dividend that is affordable at commodity peak is unaffordable at commodity trough.',
          "Specialty chemicals companies, by contrast, sell formulated products with proprietary chemistry, service agreements, and application expertise embedded in the customer relationship. Ecolab does not just sell detergent — it sells clean, which encompasses the formulation, the equipment, the monitoring, and the regulatory compliance expertise. This service layer creates switching costs that protect margins through commodity cycles and allow for annual price increases that fund dividend growth.",
          'For Weiss-method investors, this means the materials stocks worth analyzing are those with specialty positioning and long dividend histories — the Sherwin-Williams, Ecolab, and PPG Industries of the sector. Pure commodity producers rarely have the dividend track record to produce reliable Weiss yield ranges, with Nucor as the notable exception.',
        ],
      },
    ],
    relatedBlog: [
      { href: '/blog/geraldine-weiss-dividend-valuation-method', label: 'The Geraldine Weiss Method Explained' },
      { href: '/blog/dividend-kings-list-analysis', label: 'Dividend Kings: What 50 Years of Growth Means' },
    ],
  },
}

function collectionHref(slug: string) {
  if (slug === 'dividend-kings') return '/dividend-kings'
  if (slug === 'dividend-aristocrats') return '/dividend-aristocrats'
  if (slug === 'high-yield') return '/high-yield-dividend-stocks'
  if (slug === 'monthly-dividend-payers') return '/best-monthly-dividend-stocks'
  if (slug === 'reits') return '/best-reit-dividend-stocks'
  if (slug === 'utilities') return '/best-utility-dividend-stocks'
  return `/collections/${slug}`
}

interface PageProps {
  params: Promise<{ sector: string }>
}

async function getSectorStocks(dbSector: string): Promise<SectorRow[]> {
  return getWatchlistStocks(dbSector)
}

export async function generateStaticParams() {
  return SECTOR_SLUGS.map(sector => ({ sector }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sector } = await params
  const meta = SECTOR_META[sector]
  if (!meta) return { title: 'Dividend Stocks by Sector' }
  const canonical = getSectorCanonicalUrl(sector) ?? `https://dividendvisual.com/sector/${sector}`
  const isCanonicalDuplicate = isDuplicateSectorRoute(sector)
  return {
    title: meta.title,
    description: meta.metaDescription,
    robots: isCanonicalDuplicate ? { index: false, follow: true } : undefined,
    alternates: { canonical },
    openGraph: {
      title: `${meta.title} | DividendVisual`,
      description: meta.metaDescription,
      url: canonical,
      type: 'article',
    },
  }
}

function pct(v: number | null, decimals = 2): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(decimals)}%`
}

function StockCard({ row }: { row: SectorRow }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#6366f1]/40 transition-colors">
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
          href={`/ticker/${row.symbol}`}
          className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Analysis →
        </Link>
      </div>
    </div>
  )
}

export default async function SectorPage({ params }: PageProps) {
  const { sector } = await params
  const meta = SECTOR_META[sector]
  if (!meta) notFound()

  const rows = await getSectorStocks(getSectorApiNameBySlug(sector) ?? meta.dbSector)
  const undervaluedCount = rows.filter(r => r.weissSignal === 'undervalued').length

  const itemListLd = rows.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${meta.title} — Weiss Yield Rankings`,
    description: meta.metaDescription,
    url: `https://dividendvisual.com/sector/${sector}`,
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
      {itemListLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
      <TrackPageView event="sector_viewed" properties={{ sector }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Screener', href: '/dividend-screener' },
        { label: meta.title },
      ]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f4f4f5] mb-2">{meta.title}</h1>
        <p className="text-xs text-[#52525b] mb-5">
          {rows.length} stocks · Weiss valuation updated daily
          {undervaluedCount > 0 && (
            <> · <span className="text-[#22c55e]">{undervaluedCount} currently undervalued</span></>
          )}
        </p>

        {meta.editorial.length > 0 && (
          <div className="max-w-3xl space-y-3 border-l-2 border-[#6366f1]/20 pl-5">
            {meta.editorial.map((para, i) => (
              <p key={i} className="text-sm text-[#71717a] leading-relaxed">{para}</p>
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-[#71717a]">No data available yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rows.map(row => <StockCard key={row.symbol} row={row} />)}
        </div>
      )}

      {meta.pillar.length > 0 && (
        <div className="mt-16 max-w-3xl">
          <div className="border-t border-[#1e1e2e] pt-12">
            <article className="prose-dv">
              {meta.pillar.map(section => (
                <div key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((para, i) => <p key={i}>{para}</p>)}
                </div>
              ))}
            </article>

            <div className="mt-10 pt-8 border-t border-[#1e1e2e] grid sm:grid-cols-2 gap-8">
              {meta.relatedCollection && (
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wide font-medium mb-4">Related Collection</p>
                  <Link
                    href={collectionHref(meta.relatedCollection)}
                    className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                  >
                    → {meta.relatedCollectionLabel}
                  </Link>
                </div>
              )}
              {meta.relatedBlog && meta.relatedBlog.length > 0 && (
                <div>
                  <p className="text-xs text-[#71717a] uppercase tracking-wide font-medium mb-4">Related Reading</p>
                  <div className="flex flex-col gap-2">
                    {meta.relatedBlog.map(({ href, label }) => (
                      <Link key={href} href={href} className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors">
                        → {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6">
              <a
                href={`/go/tradingview?url=${encodeURIComponent('https://www.tradingview.com/markets/stocks-usa/?aff_id=166728&aff_sub=sector')}&placement=sector-page`}
                target="_blank"
                rel="noopener sponsored"
                className="text-xs text-[#52525b] hover:text-[#71717a] transition-colors"
              >
                View US dividend stock charts on TradingView ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
