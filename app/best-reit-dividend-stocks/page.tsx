import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-reit-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('real-estate') ?? 'Real Estate'

export const metadata: Metadata = {
  title: `Best REIT Dividend Stocks ${YEAR}: Yield, Safety & Value`,
  description:
    'Compare 14 REIT dividend stocks by yield, AFFO payout ratio, dividend growth, and Weiss value signals. Updated daily to find safer income ideas.',
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
      description="Compare REIT dividend stocks by current yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for income investors evaluating real estate dividends without blindly chasing high yield."
      statLabel="REITs tracked"
      ctaTitle="Get alerts when REIT dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with REITs and other income stocks entering historically attractive Weiss yield territory."
      featuredAnalyses={[
        {
          href: '/analysis/o',
          symbol: 'O',
          title: 'Realty Income dividend history, yield, and monthly income setup',
          note: 'Read the O analysis before comparing rate-driven yield pressure with tenant durability, debt costs, and net lease peers.',
        },
      ]}
      relatedLinks={[
        { href: '/best-monthly-dividend-stocks', label: 'Best monthly dividend stocks' },
        { href: '/high-yield-dividend-stocks', label: 'High yield dividend stocks' },
        { href: '/compare/o-vs-nnn', label: 'O vs NNN comparison' },
        { href: '/compare/o-vs-stag', label: 'O vs STAG comparison' },
        { href: '/drip-calculator', label: 'Dividend DRIP calculator' },
        { href: '/blog/best-reit-dividend-stocks-2026', label: 'REIT dividend stock guide' },
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
            'Most REIT dividends are classified as ordinary income rather than qualified dividends, which means they are taxed at your marginal income tax rate rather than the preferential 0–20% capital gains rate. For investors in high tax brackets, the after-tax yield from a REIT is meaningfully lower than the quoted yield.',
            'The Tax Cuts and Jobs Act introduced Section 199A, which allows non-corporate taxpayers to deduct up to 20% of qualified REIT dividends. This partially offsets the ordinary income treatment. The deduction shows up in Box 5 of your 1099-DIV and is handled automatically by most tax software.',
            'The practical implication is that REITs tend to be more tax-efficient in tax-deferred accounts (IRAs, 401ks) than in taxable brokerage accounts. An investor in the 32% marginal bracket owning a REIT in a taxable account faces a 25.6% effective rate (32% minus the 20% Section 199A deduction) rather than the 15% qualified dividend rate they would receive from Coca-Cola or Johnson & Johnson.',
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
    />
  )
}
