import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-reit-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('real-estate') ?? 'Real Estate'

export const metadata: Metadata = {
  title: `Best REIT Dividend Stocks ${YEAR}: Yield, Safety & Value`,
  description:
    'Compare REIT dividend stocks by yield, quality, dividend growth, reported payout context, and Weiss value signals. Learn what to verify in FFO, AFFO, debt, and occupancy.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best REIT Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare REIT dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best REIT Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'REIT dividend stocks ranked by yield, safety, quality, and Weiss valuation signal.',
  },
}

export default function BestReitDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_reit_dividend_stocks_viewed"
      source="best-reit-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="REIT income stocks screened for rate-cycle value"
      title={`Best REIT Dividend Stocks ${YEAR}`}
      description="Compare REIT dividend stocks by current yield, reported payout context, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for income investors evaluating real estate dividends without blindly chasing high yield."
      statLabel="REITs tracked"
      ctaTitle="Get alerts when REIT dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with REITs and other income stocks entering historically attractive Weiss yield territory."
      hideTopComparison
      tableTitle="REIT dividend stocks ranked by quality, yield, and valuation"
      tableDescription="Start with quality and Weiss valuation, then verify each REIT using property type, recurring FFO or AFFO coverage, debt maturities, occupancy, and tenant concentration. The reported payout field below is a screening input, not a substitute for REIT cash-flow analysis."
      payoutLabel="Reported payout*"
      payoutCaveat="*The available payout field is based on reported company metrics and may use GAAP earnings. For REITs, recurring FFO or AFFO payout coverage is normally the more decision-useful measure. Verify it in current company filings before relying on the dividend."
      decisionGuide={[
        {
          label: 'Cash flow',
          title: 'Use FFO or AFFO coverage',
          description: 'GAAP earnings include property depreciation, so the ordinary payout ratio can make a healthy REIT look less covered than it is.',
        },
        {
          label: 'Balance sheet',
          title: 'Map the debt maturity wall',
          description: 'A high yield is more defensible when fixed-rate debt, staggered maturities, and interest coverage reduce refinancing pressure.',
        },
        {
          label: 'Property type',
          title: 'Identify the demand engine',
          description: 'Net lease, industrial, storage, healthcare, and data-center REITs respond to different tenant and economic risks.',
        },
        {
          label: 'Valuation',
          title: 'Separate rate stress from impairment',
          description: 'An elevated historical yield can be useful when rates compress the price, but dangerous when rents, occupancy, or tenants deteriorate.',
        },
      ]}
      featuredAnalyses={[
        {
          href: '/analysis/o',
          symbol: 'O',
          title: 'Realty Income dividend history, yield, and monthly income setup',
          note: 'Read the O analysis before comparing rate-driven yield pressure with tenant durability, debt costs, and net lease peers.',
        },
        {
          href: '/analysis/nnn',
          symbol: 'NNN',
          title: 'NNN REIT dividend history, net lease coverage, and valuation',
          note: 'Compare NNN with Realty Income on tenant diversification, dividend growth history, starting yield, and rate sensitivity.',
        },
        {
          href: '/analysis/stag',
          symbol: 'STAG',
          title: 'STAG Industrial monthly dividend and warehouse exposure',
          note: 'Review a monthly payer whose income depends on industrial property demand rather than the retail net lease model.',
        },
      ]}
      relatedLinks={[
        { href: '/best-monthly-dividend-stocks', label: 'Best monthly dividend stocks' },
        { href: '/high-yield-dividend-stocks', label: 'High yield dividend stocks' },
        { href: '/compare/o-vs-nnn', label: 'O vs NNN comparison' },
        { href: '/compare/o-vs-stag', label: 'O vs STAG comparison' },
        { href: '/drip-calculator', label: 'Dividend DRIP calculator' },
        { href: '/blog/best-reit-dividend-stocks-2026', label: 'REIT dividend stock guide' },
        { href: 'https://www.irs.gov/newsroom/qualified-business-income-deduction', label: 'IRS guidance on qualified REIT dividends' },
      ]}
      sections={[
        {
          heading: 'How to evaluate REIT dividend stocks',
          paragraphs: [
            'REITs are legally required to distribute most taxable income, which makes them natural income vehicles. The trade-off is that REITs are sensitive to interest rates, debt costs, and property subsector cycles.',
            'For dividend investors, the most important question is whether a high REIT yield is caused by rate-driven price pressure or by weakening property cash flows. The Weiss method helps by comparing today\'s yield to the stock\'s own historical yield range.',
            'Start any REIT evaluation by identifying the property type. Industrial REITs, net lease REITs, self-storage REITs, and data center REITs have different demand drivers, lease structures, and interest rate sensitivities. A high yield in Realty Income requires different analysis than a high yield in an office REIT facing structural demand headwinds.',
          ],
        },
        {
          heading: 'Why REIT Weiss signals often appear during rate stress',
          paragraphs: [
            'When Treasury yields rise, REIT prices often fall mechanically because income investors demand a wider spread over bonds. That pushes REIT dividend yields toward historical highs, even when occupancy, leases, and rent collection remain healthy.',
            'The best setups usually combine an Undervalued Weiss signal, a quality score above the peer group, manageable payout coverage, and a property type with durable demand such as net lease, industrial, storage, or infrastructure real estate.',
            'The 2022–2023 rate cycle produced Weiss undervalue signals across many high-quality REITs because prices fell in response to rate increases while the underlying property businesses — particularly net lease, industrial, and self-storage — continued generating stable rents. For patient income investors, rate-driven REIT yield elevations have historically resolved as rates normalize.',
          ],
        },
        {
          heading: 'REIT payout ratios need context',
          paragraphs: [
            'Traditional earnings payout ratios can be misleading for REITs because real estate depreciation reduces GAAP earnings without reducing cash generation. FFO or AFFO coverage is usually the better framework.',
            'DividendVisual still treats very high payout metrics cautiously, but a REIT with durable rent collection, long leases, and a stable balance sheet can sustain a higher reported payout than an industrial or consumer company.',
            'Adjusted Funds from Operations (AFFO) accounts for maintenance capital expenditure in addition to depreciation, making it the most conservative cash flow measure for evaluating REIT dividend safety. A REIT paying 85% of AFFO is more conservatively positioned than one paying 85% of GAAP earnings — even though the reported ratio looks identical.',
          ],
        },
        {
          heading: 'Net lease REITs: the most predictable REIT income structure',
          paragraphs: [
            'Net lease REITs like Realty Income, National Retail Properties, and Agree Realty own properties leased to single tenants under long-term net lease contracts. The tenant pays not just rent but also property taxes, insurance, and maintenance costs. For the REIT, this creates a passive income stream with minimal operational complexity.',
            'Realty Income — which trades as "The Monthly Dividend Company" — has raised its dividend for over 25 consecutive years and has paid monthly dividends without interruption since its IPO in 1994. NNN REIT has a similar track record with over 30 consecutive years of dividend increases.',
            'The net lease model is the closest thing to a bond in the REIT universe. Tenants are typically investment-grade or near-investment-grade retailers with essential or experience-based formats — drug stores, convenience stores, dollar stores, casual dining. These formats have proven resilient to e-commerce disruption compared to department stores or specialty retail.',
          ],
        },
        {
          heading: 'Industrial and storage REITs: structural demand tailwinds',
          paragraphs: [
            'Industrial REITs like Prologis, STAG Industrial, and Duke Realty (now merged with Prologis) own warehouses, distribution centers, and logistics facilities. The structural driver is e-commerce: online retail requires approximately three times the warehouse space per dollar of sales compared to traditional retail. This has driven industrial REIT occupancy rates and rent growth to multi-decade highs.',
            'Self-storage REITs like Public Storage, Extra Space Storage, and CubeSmart benefit from a different structural dynamic: Americans accumulate more possessions than their homes can hold, and storage demand is remarkably recession-resistant because people tend to rent units during life transitions (divorce, death, downsizing, moving) that happen regardless of economic conditions.',
            'Both industrial and self-storage REITs tend to have shorter lease terms than net lease REITs, which means rent can reprice to market faster. In a rising rent environment, this is an advantage. In a weakening market, shorter leases expose cash flow to pressure more quickly. The current entry yield needs to be evaluated in the context of where rents are in the cycle.',
          ],
        },
        {
          heading: 'REIT tax treatment: what dividend investors need to know',
          paragraphs: [
            'REIT distributions can contain different tax components, and much of a typical REIT dividend may not receive the same treatment as a qualified corporate dividend. The after-tax yield can therefore differ materially from the headline yield shown on a stock screen.',
            'Qualified REIT dividends have historically interacted with the Section 199A deduction, but eligibility, limits, holding-period rules, and the tax years covered depend on current law and the investor\'s circumstances. Check the latest IRS instructions and your Form 1099-DIV rather than assuming every REIT distribution receives the same treatment.',
            'Account type can materially change the after-tax result. Taxable accounts, traditional retirement accounts, and Roth-style accounts have different consequences, so asset location should be evaluated with current professional tax guidance. DividendVisual does not calculate after-tax REIT income.',
          ],
        },
        {
          heading: 'REIT debt and rising rates: what matters for dividend sustainability',
          paragraphs: [
            'REITs are capital-intensive businesses that routinely use debt to acquire and develop properties. The relationship between debt costs and income is more direct in REITs than in most other sectors — when borrowing costs rise, debt refinancing reduces funds available for distribution unless rent growth offsets the increase.',
            'The key metrics are debt-to-equity ratio, weighted average maturity of the debt stack, the proportion of debt that is fixed-rate versus floating-rate, and coverage ratios (interest coverage, AFFO after debt service). REITs with long-duration fixed-rate debt are less exposed to near-term rate increases than those with short maturities or floating-rate exposure.',
            'Realty Income and NNN REIT have consistently maintained investment-grade credit ratings and conservative balance sheets relative to peers, which is part of why their dividend records are so long. For investors evaluating other REITs, comparing the balance sheet to O and NNN establishes a useful quality benchmark.',
          ],
        },
        {
          heading: 'Common questions about REIT dividend stocks',
          paragraphs: [
            'Are REIT dividends safe? REIT dividend safety depends on the property type, tenant quality, payout coverage on an AFFO basis, and balance sheet strength. Net lease REITs with investment-grade tenants and long lease terms have historically had the safest dividends. Office REITs and retail mall REITs have had the most dividend pressure.',
            'What is the best REIT for monthly income? Realty Income is the most widely cited monthly dividend REIT for income investors. It combines a long track record, investment-grade tenants, and a balance sheet that has supported consecutive dividend increases for over 25 years. Main Street Capital is a BDC (not technically a REIT) but is often grouped with monthly payers for income portfolio purposes.',
            'How does a REIT\'s yield compare to a bond? A REIT yield is not the same as a bond coupon. REIT dividends can grow over time (if rents and occupancy grow), which bonds cannot. But REIT dividends can also be cut if the underlying property business deteriorates, which bonds cannot (short of default). REITs offer income with growth potential but with more variability than an investment-grade bond.',
          ],
        },
      ]}
      checklist={[
        'Dividend yield is attractive versus the REIT\'s own history.',
        'Payout coverage is sustainable on a cash-flow or FFO basis.',
        'Debt maturities and refinancing costs are manageable.',
        'Property type has durable demand through weak markets.',
        'Weiss signal confirms the entry price is historically attractive.',
      ]}
      faq={[
        {
          question: 'What are the best REIT dividend stocks for income investors?',
          answer: 'The best REIT dividend stocks combine an attractive yield with sustainable FFO or AFFO payout coverage, manageable debt, durable property demand, and a long record of maintaining or raising dividends. DividendVisual ranks REITs by quality score first, then reviews yield and Weiss valuation signal.',
        },
        {
          question: 'Are REIT dividends safe?',
          answer: 'REIT dividends can be durable, but safety depends on property type, tenant quality, lease length, debt maturities, and payout coverage. Net lease, industrial, storage, and infrastructure REITs often have more resilient cash flows than highly cyclical property types.',
        },
        {
          question: 'Why do REIT dividend yields rise when interest rates rise?',
          answer: 'REITs compete with bonds for income capital. When Treasury yields rise, investors often demand higher REIT yields, which pushes REIT prices lower. That can create attractive entry points if property cash flows and payout coverage remain healthy.',
        },
        {
          question: 'What payout ratio should REIT investors use?',
          answer: 'For REITs, AFFO payout ratio is usually more useful than GAAP earnings payout ratio because depreciation reduces accounting earnings without reducing property cash flow. A sustainable REIT dividend is normally supported by recurring FFO or AFFO.',
        },
        {
          question: 'Does the payout column show AFFO payout ratio?',
          answer: 'Not necessarily. The table uses the reported payout metric available in the DividendVisual dataset, which may be based on GAAP earnings. Treat it as an initial warning flag only and verify recurring FFO or AFFO payout coverage in the REIT’s latest filings.',
        },
      ]}
    />
  )
}
