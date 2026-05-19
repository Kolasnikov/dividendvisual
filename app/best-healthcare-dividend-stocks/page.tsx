import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-healthcare-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('healthcare') ?? 'Healthcare'

export const metadata: Metadata = {
  title: `Best Healthcare Dividend Stocks ${YEAR} - Ranked by Safety, Growth & Weiss Signal`,
  description:
    'Best healthcare dividend stocks ranked by payout safety, dividend growth, quality score, current yield, and Geraldine Weiss valuation signal. Compare JNJ, ABT, MDT, BDX, ABBV, UNH, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Healthcare Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare healthcare dividend stocks by yield, dividend safety, payout ratio, dividend growth, quality score, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Healthcare Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Healthcare dividend stocks ranked by safety, growth, quality, and Weiss valuation signal.',
  },
}

export default function BestHealthcareDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_healthcare_dividend_stocks_viewed"
      source="best-healthcare-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Defensive healthcare income stocks"
      title={`Best Healthcare Dividend Stocks ${YEAR}`}
      description="Compare healthcare dividend stocks by dividend yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for long-term income investors evaluating pharma, medical devices, managed care, and healthcare services."
      statLabel="Healthcare stocks"
      ctaTitle="Get alerts when healthcare dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with healthcare and other quality defensive stocks entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/dividend-kings', label: 'Dividend Kings' },
        { href: '/compare/jnj-vs-abbv', label: 'JNJ vs ABBV comparison' },
        { href: '/compare/unh-vs-cvs', label: 'UNH vs CVS comparison' },
        { href: '/blog/best-healthcare-dividend-stocks-2026', label: 'Healthcare dividend stock guide' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
      ]}
      sections={[
        {
          heading: 'How to evaluate healthcare dividend stocks',
          paragraphs: [
            'Healthcare is defensive, but it is not one single business model. Pharmaceuticals, medical devices, diagnostics, managed care, and distribution all have different dividend risk profiles.',
            'For dividend investors, the key is separating durable cash-flow franchises from companies facing patent cliffs, reimbursement pressure, litigation, or pipeline risk. A strong healthcare dividend usually combines diversification, conservative payout coverage, and a long record of annual increases.',
          ],
        },
        {
          heading: 'Why healthcare works with the Weiss method',
          paragraphs: [
            'Many large healthcare dividend stocks have long enough histories for yield-based valuation to be useful. When a high-quality healthcare company trades near the high end of its historical dividend yield range, the market may be pricing in temporary sector fear rather than permanent business impairment.',
            'The strongest setups pair an Undervalued Weiss signal with a quality score that confirms payout safety. This matters in healthcare because an elevated yield can also reflect real concerns about drug exclusivity, regulatory pricing, or falling cash flow.',
          ],
        },
        {
          heading: 'Device and services compounders vs pharma income',
          paragraphs: [
            'Medical device and healthcare services companies often produce smoother cash flows than single-drug pharmaceutical companies. Recurring procedures, consumables, installed equipment bases, and insurance/service contracts create more predictable dividend funding.',
            'Pharmaceutical companies can still be excellent dividend stocks, but they require more monitoring. Patent cliffs, clinical trial failures, and pricing reform can change the cash-flow outlook faster than in consumer staples or utilities.',
          ],
        },
      ]}
      checklist={[
        'Dividend is covered by earnings or free cash flow.',
        'Patent cliff or regulatory risk does not dominate the thesis.',
        'Dividend growth remains positive and sustainable.',
        'Quality score confirms payout durability.',
        'Weiss signal shows the entry yield is attractive versus history.',
      ]}
    />
  )
}
