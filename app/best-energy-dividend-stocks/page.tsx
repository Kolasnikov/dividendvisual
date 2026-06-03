import type { Metadata } from 'next'
import { SectorDividendLanding } from '@/components/seo/SectorDividendLanding'
import { getSectorApiNameBySlug } from '@/lib/sector-mapping'

const PAGE_URL = 'https://dividendvisual.com/best-energy-dividend-stocks'
const YEAR = 2026
const DB_SECTOR = getSectorApiNameBySlug('energy') ?? 'Energy'

export const metadata: Metadata = {
  title: `Best Energy Dividend Stocks ${YEAR} - Oil, Gas & Midstream Income`,
  description:
    'Best energy dividend stocks ranked by dividend yield, quality score, payout safety, dividend growth, and Geraldine Weiss valuation signal. Compare XOM, CVX, OKE, PSX, VLO, EPD, and more.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Best Energy Dividend Stocks ${YEAR} | DividendVisual`,
    description:
      'Compare energy dividend stocks by yield, quality score, payout safety, dividend growth, and Weiss valuation signal.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Energy Dividend Stocks ${YEAR} | DividendVisual`,
    description: 'Energy dividend stocks ranked by yield, quality, payout safety, and Weiss valuation signal.',
  },
}

export default function BestEnergyDividendStocksPage() {
  return (
    <SectorDividendLanding
      pageUrl={PAGE_URL}
      eventName="best_energy_dividend_stocks_viewed"
      source="best-energy-dividend-stocks"
      dbSector={DB_SECTOR}
      eyebrow="Oil majors, refiners, and midstream dividend stocks"
      title={`Best Energy Dividend Stocks ${YEAR}`}
      description="Compare energy dividend stocks by current yield, payout safety, dividend growth, quality score, and Geraldine Weiss valuation signal. Built for income investors evaluating oil majors, refiners, midstream operators, and commodity-cycle dividend risk."
      statLabel="Energy stocks"
      ctaTitle="Get alerts when energy dividend stocks become undervalued"
      ctaDescription="A weekly dividend research email with energy dividend stocks and other income names entering historically attractive Weiss yield territory."
      relatedLinks={[
        { href: '/compare/xom-vs-cvx', label: 'XOM vs CVX comparison' },
        { href: '/high-yield-dividend-stocks', label: 'High yield dividend stocks' },
        { href: '/undervalued-dividend-stocks', label: 'Undervalued dividend stocks' },
        { href: '/dividend-aristocrats', label: 'Dividend Aristocrats' },
        { href: '/blog/dividend-yield-trap', label: 'Dividend yield trap guide' },
        { href: '/dividend-screener', label: 'Dividend stock screener' },
      ]}
      sections={[
        {
          heading: 'How to evaluate energy dividend stocks',
          paragraphs: [
            'Energy dividend stocks are shaped by commodity cycles. Oil majors, refiners, and midstream operators can all pay attractive dividends, but their cash-flow stability is not the same.',
            'Integrated majors such as Exxon Mobil and Chevron have long dividend records because their balance sheets and integrated operations help them survive oil downturns. Midstream companies can be more fee-based, but they still depend on volumes, leverage, and contract quality.',
            'Before acting on an energy dividend yield, check whether the yield elevation is caused by commodity price pressure — which is often temporary — or by structural cash-flow deterioration. The quality score and payout metrics on each DividendVisual page help separate these two scenarios.',
          ],
        },
        {
          heading: 'Why high yield needs context in energy',
          paragraphs: [
            'A high energy yield can be an opportunity when commodity fear pushes prices down temporarily. It can also be a warning when the market expects lower cash flow, refinancing pressure, or a payout reset.',
            'The Weiss method is useful because many energy leaders have long yield histories across oil cycles. Still, the signal should be paired with payout coverage, debt, commodity exposure, and management commitment to the dividend.',
            'In energy specifically, look at whether the company maintained or grew its dividend during the 2015–2016 oil crash and the 2020 pandemic demand collapse. Companies that held the line during both periods have demonstrated the balance sheet discipline and cash-flow management that separates durable energy dividends from cyclical income traps.',
          ],
        },
        {
          heading: 'Integrated majors vs midstream income',
          paragraphs: [
            'Integrated majors earn from exploration, production, refining, and chemicals. That diversification helps, but earnings still move with oil and gas prices. The dividend survives because the balance sheet is managed for downcycles.',
            'Midstream companies operate pipelines, terminals, and processing assets. Fee-based contracts can make cash flows steadier than upstream producers, but investors still need to check leverage, contract duration, counterparty quality, and distribution coverage.',
            'The distinction matters for income investors because a midstream stock yielding 6% on long-term take-or-pay contracts is a very different risk from an upstream producer yielding 6% on commodity-sensitive cash flow. Both can be attractive; neither should be evaluated purely on yield.',
          ],
        },
        {
          heading: 'Exxon Mobil and Chevron: the benchmark energy dividends',
          paragraphs: [
            'Exxon Mobil and Chevron are the two US energy companies that have maintained dividend growth across the most oil price cycles. Exxon has raised its dividend for over 40 consecutive years including through the 2015–2016 oil crash and the 2020 collapse in demand. Chevron has a comparable record.',
            'Both companies achieved this by managing debt conservatively enough to fund dividends from balance sheet during low-oil-price periods, then rebuilding cash flow when prices recover. The integrated model — production, refining, and chemicals — reduces exposure to any single commodity price point.',
            'For Weiss investors, the integrated major dividend history is long and real. A yield at the high end of the 10-year Exxon or Chevron range has historically reflected market fear rather than a fundamental shift in the business. That does not mean every elevated signal is risk-free, but it does mean the history provides a meaningful anchor.',
          ],
        },
        {
          heading: 'Midstream pipeline stocks: fee-based income in detail',
          paragraphs: [
            'Midstream companies like ONEOK, Enterprise Products Partners, and Williams Companies move oil, natural gas, and NGLs through pipelines and processing facilities. Their income is largely fee-based: they charge for volumes moved, not for the commodity price itself. That structure insulates cash flow from oil price volatility to a meaningful degree.',
            'The risks in midstream are leverage, counterparty quality, and contract duration. Many midstream companies expanded aggressively in the 2010s and carry significant debt. When volumes or contract renewals disappoint, debt-servicing requirements compete directly with distribution payments.',
            'Enterprise Products Partners is often cited as the midstream benchmark because of its investment-grade balance sheet, distribution growth record, and diversified asset base. Comparing other midstream names against EPD\'s financial discipline is a useful starting framework for evaluating midstream dividend sustainability.',
          ],
        },
        {
          heading: 'Energy dividend cuts: what history shows',
          paragraphs: [
            'Many energy companies cut or eliminated dividends during the 2015–2016 oil bust and again in 2020. The pattern is instructive: companies with high debt relative to cash flow were the first to cut. Companies with diversified operations, hedged production, or fee-based contracts held on longer.',
            'Integrated majors generally maintained dividends even when earnings turned negative, choosing to fund payouts from balance sheet or debt rather than break a streak measured in decades. Smaller upstream producers and overleveraged midstream companies cut much faster.',
            'This history makes payout coverage using through-cycle cash flow — not peak-cycle cash flow — the most important metric for energy dividend evaluation. A payout that requires $75 oil to cover will face more frequent stress than one that covers at $55.',
          ],
        },
        {
          heading: 'Refiners and variable dividends: a different income model',
          paragraphs: [
            'Refiners like Phillips 66, Valero, and Marathon Petroleum operate on crack spreads rather than commodity prices directly. Refining margins can be volatile, and many refiners combine a smaller base dividend with variable supplements or buybacks, making the total return less predictable than an integrated major.',
            'For income-focused investors, refiner dividends require more monitoring because the variable component can compress or disappear quickly when refining economics soften. The base dividend is usually well-covered even in weak margin environments, but the total yield can be misleading if it includes a large variable component.',
            'Phillips 66 has moved toward a more stable dividend growth model compared to its refiner peers, making it a more suitable candidate for Weiss-based income analysis. Investors comparing refiner yields should separate base from variable before applying historical yield ranges.',
          ],
        },
        {
          heading: 'Energy dividend entry: using the Weiss signal with commodity context',
          paragraphs: [
            'An energy Weiss undervalue signal has historically been most reliable when the yield elevation is caused by oil price weakness or sector rotation rather than company-specific deterioration. The best setups combine a high yield relative to history with a balance sheet that can bridge through weak oil prices.',
            'Timing matters more in energy than in consumer staples. A consumer staples company can remain undervalued for months without the thesis changing; in energy, a commodity recovery can move the stock 20–30% in weeks, compressing the yield back toward fair value. Acting on energy signals tends to reward investors who research quickly rather than waiting for perfect certainty.',
            'The practical checklist: check the quality score, verify payout coverage at normalized commodity prices, confirm the balance sheet can survive 12–18 months of weak prices, and verify the dividend held through prior downturns. If all four criteria pass, an elevated Weiss signal in an integrated major or investment-grade midstream company has historically been a reasonable entry.',
          ],
        },
      ]}
      checklist={[
        'Dividend survived prior oil and gas downturns.',
        'Balance sheet can support the payout through weak commodity prices.',
        'Payout coverage is based on normalized cash flow, not peak-cycle cash flow.',
        'Midstream contracts or integrated operations reduce volatility.',
        'Weiss signal is supported by dividend safety and quality metrics.',
      ]}
    />
  )
}
