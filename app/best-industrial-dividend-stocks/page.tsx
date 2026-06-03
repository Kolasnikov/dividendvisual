import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-industrial-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('industrials') ?? 'Industrials'

export const metadata: Metadata = {
  title: `Best Industrial Dividend Stocks ${YEAR} - Ranked by Quality & Weiss Signal`,
  description:
    'Best industrial dividend stocks ranked by dividend yield, quality score, payout safety, dividend growth, and Geraldine Weiss valuation signal. Compare CAT, HON, UNP, LMT, NOC, UPS, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Industrial Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare industrial dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Industrial Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Industrial dividend stocks ranked by quality, dividend growth, safety, and Weiss valuation signal.',
  },
}

export default function BestIndustrialDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_industrial_dividend_stocks_viewed"
      source="best-industrial-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Defense, railroads, automation, logistics, and industrial compounders"
      title={`Best Industrial Dividend Stocks ${YEAR}`}
      description="Compare industrial dividend stocks by current yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for dividend investors evaluating cyclical income, defense contractors, railroads, and industrial compounders."
      statLabel="Industrial stocks"
      ctaTitle="Get alerts when industrial dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with industrial dividend stocks and other quality income names entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/compare/lmt-vs-noc', label: 'LMT vs NOC comparison' },
        { href: '/compare/cat-vs-mmm', label: 'CAT vs MMM comparison' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
        { href: '/blog/how-to-find-undervalued-dividend-stocks', label: 'How to find undervalued dividend stocks' },
      ]}
      sections={[
        {
          heading: 'How to evaluate industrial dividend stocks',
          paragraphs: [
            'Industrial dividend stocks span defense contractors, railroads, logistics, factory automation, construction equipment, and diversified manufacturers. The common thread is exposure to capital spending, infrastructure, and long economic cycles.',
            'The best industrial dividend stocks usually have high switching costs, mission-critical products, long contract backlogs, or infrastructure-like assets. Those traits help smooth cash flow enough to support dividend growth through recessions.',
            'Unlike consumer staples, industrial earnings can swing 30–40% between peak and trough of an economic cycle. A payout ratio that looks conservative at cycle peak can become stretched quickly if a recession hits. Evaluate industrial dividends using normalized or mid-cycle earnings rather than peak earnings.',
          ],
        },
        {
          heading: 'Defense and railroads behave differently from cyclicals',
          paragraphs: [
            'Defense contractors such as Lockheed Martin, Northrop Grumman, and General Dynamics have revenue visibility from multi-year government contracts. That backlog can make their dividends more predictable than the average industrial stock.',
            'Railroads and logistics companies have infrastructure moats, but freight volumes still move with the economy. Cyclical manufacturers such as Caterpillar require even more context because earnings can swing sharply between boom and recession periods.',
            'The defense-to-cyclical spectrum matters for dividend evaluation. LMT and NOC dividends have been steadier than CAT or UNP because government procurement is relatively recession-resistant. But defense is not without risk — budget cycles, program cancellations, and cost overruns can affect earnings for individual contractors even when sector spending is stable.',
          ],
        },
        {
          heading: 'Using the Weiss signal in cyclical sectors',
          paragraphs: [
            'Industrial stocks often look most attractive by yield when the cycle is weak and sentiment is poor. That can be a real opportunity if the business has through-cycle cash generation and a dividend record that survived prior downturns.',
            'For cyclical industrials, pair the Weiss signal with balance-sheet strength, dividend growth discipline, and evidence that the payout can survive lower earnings without becoming stretched.',
            'The most reliable Weiss signals in industrials tend to appear in businesses with infrastructure-like moats or government contract visibility. Pure-cycle industrials — construction equipment, commodity processing, shipping — can show elevated yields for extended periods if the cycle is structurally weak rather than temporarily depressed.',
          ],
        },
        {
          heading: 'Defense contractor dividends: the backlog advantage',
          paragraphs: [
            'Lockheed Martin, Northrop Grumman, Raytheon Technologies, and General Dynamics operate on multi-year contract backlogs that can provide 18–36 months of revenue visibility. That visibility allows management teams to commit to dividend growth even when near-term earnings are uncertain.',
            'Lockheed Martin\'s F-35 program, Northrop Grumman\'s B-21 Raider, and General Dynamics\' Navy shipbuilding contracts represent multi-decade government commitments. These are not cyclical sales that evaporate during recessions — they are funded programs with bipartisan political support and treaty-level strategic significance.',
            'For income investors, defense contractor dividends have some of the most predictable funding mechanisms in the industrial universe. The main risk is program-specific disruption or defense budget pressure, which tends to affect individual companies rather than the sector broadly. The quality scores and dividend growth records at DividendVisual reflect this relative predictability.',
          ],
        },
        {
          heading: 'Railroads: pricing power on rails',
          paragraphs: [
            'Union Pacific, Norfolk Southern, and CSX operate infrastructure that cannot be replicated. No new Class I railroad has been built in over a century because the capital requirements and right-of-way challenges make entry impossible. That natural monopoly over key freight corridors gives railroads exceptional pricing power — they raise shipping rates faster than inflation in most years.',
            'Railroad dividends are funded by free cash flow that grows with both volume and price. Volume follows the economy, but price grows almost regardless. This combination has produced consistent dividend growth across cycles, though railroads did slow growth during the 2015–2016 freight recession and the 2020 pandemic disruption.',
            'The railroad dividend thesis is most compelling when freight volumes are weak and railroad yields push toward the high end of their historical ranges. Those moments — which have historically coincided with recession fears or near-term volume pressure — have tended to mark entry points that deliver strong total returns as volumes recover.',
          ],
        },
        {
          heading: 'Factory automation and industrial compounders: ITW and Emerson',
          paragraphs: [
            'Illinois Tool Works has raised its dividend for over 50 consecutive years. Emerson Electric had a similar streak before reorganizing its portfolio. Both are industrial conglomerates with portfolios focused on components, fasteners, and equipment used in manufacturing processes worldwide.',
            'The income thesis for companies like ITW is less about yield and more about compounding. ITW typically yields 2–3%, but the dividend growth rate has averaged 6–8% over long periods, and the business structure — thousands of small, niche positions with high customer switching costs — creates remarkably stable free cash flow through moderate economic cycles.',
            'These industrial compounders are most interesting to income investors when cyclical fears push the yield to historical highs. The business model tends to recover well from cycle troughs because the products are consumables and components that customers resume buying quickly once capital spending resumes.',
          ],
        },
        {
          heading: 'Industrial dividend risks: what to watch',
          paragraphs: [
            'The primary risks for industrial dividends are earnings cyclicality, balance sheet leverage from acquisitions, and structural demand shifts. Acquisitions are particularly relevant: many industrial companies grow through M&A, which temporarily inflates payout ratios as integration costs reduce earnings. Understanding whether a stretched payout ratio reflects a real risk or a transient acquisition year is important.',
            'Structural demand shifts are a longer-term risk. MMM\'s litigation exposure and the secular decline in certain specialty chemical markets affected its dividend growth capacity over a multi-year period. Evaluating an industrial stock requires asking whether the core business markets are stable, growing, or structurally declining.',
            'The dividend history table in the Weiss chart shows whether dividend growth has been consistent or irregular over 10 years. Consistent step-up growth suggests the business has funded increases through cycles. Flat dividends or skipped increases suggest past periods where cash flow was pressured — which is information about how the business behaves under stress.',
          ],
        },
        {
          heading: 'Common questions about industrial dividend stocks',
          paragraphs: [
            'Which industrial companies pay the best dividends? Defense contractors like LMT and NOC offer predictable income with backlog visibility. Railroads like UNP offer pricing-power-driven growth. Industrial compounders like ITW and CTAS (Cintas) offer lower yields but highly consistent long-term growth. The best choice depends on whether you prioritize yield, growth, or predictability.',
            'Are industrial dividends safe in a recession? It depends on the business model. Defense contractors tend to hold dividends through recessions. Infrastructure-like businesses (railroads, utilities, waste management) can slow growth but rarely cut. Cyclical manufacturers with high leverage are the most at risk if a recession is deep or prolonged.',
            'How do I find undervalued industrial dividend stocks? The DividendVisual screener filters industrial stocks by Weiss signal and quality score. Industrials most often show Weiss undervalue signals during recession fears or cycle troughs — precisely the moments when market sentiment is worst but long-term fundamentals may still be intact.',
          ],
        },
      ]}
      checklist={[
        'Dividend streak survived prior industrial downturns.',
        'Balance sheet can handle lower-cycle earnings.',
        'Business has backlog, infrastructure moat, or pricing power.',
        'Payout ratio is not based on peak-cycle earnings alone.',
        'Weiss signal is supported by quality score and dividend growth.',
      ]}
    />
  )
}
