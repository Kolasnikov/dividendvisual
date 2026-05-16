import type { ComputedMetrics } from '@/lib/types'

interface QualityScoreCardProps {
  metrics: ComputedMetrics
}

function ScoreArc({ score }: { score: number }) {
  // SVG arc from 210deg to 330deg (240deg sweep)
  const RADIUS = 52
  const CX = 64
  const CY = 64
  const SWEEP = 240
  const START_DEG = 210

  function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(startDeg: number, endDeg: number) {
    const s = polar(CX, CY, RADIUS, startDeg)
    const e = polar(CX, CY, RADIUS, endDeg)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${e.x} ${e.y}`
  }

  const bgEnd = START_DEG + SWEEP
  const progressEnd = START_DEG + (score / 100) * SWEEP

  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <svg viewBox="0 0 128 90" className="w-36 h-auto mx-auto" role="img" aria-label={`Dividend quality score: ${score} out of 100`}>
      <path
        d={describeArc(START_DEG, bgEnd)}
        fill="none"
        stroke="#1e1e2e"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {score > 0 && (
        <path
          d={describeArc(START_DEG, progressEnd)}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
      <text x={CX} y={60} textAnchor="middle" fontSize="22" fontWeight="700" fill="#f4f4f5">
        {score}
      </text>
      <text x={CX} y={74} textAnchor="middle" fontSize="9" fill="#71717a">
        / 100
      </text>
    </svg>
  )
}

const BREAKDOWN_LABELS = [
  { key: 'payout', label: 'Payout Ratio', max: 25 },
  { key: 'streak', label: 'Dividend Streak', max: 25 },
  { key: 'cagr', label: 'Growth (CAGR 5Y)', max: 20 },
  { key: 'yield', label: 'Yield vs History', max: 15 },
  { key: 'fcf', label: 'FCF Coverage', max: 15 },
]

function computeBreakdown(m: ComputedMetrics): Record<string, number> {
  const pr = m.payoutRatio ?? 1.0
  const payoutScore =
    pr < 0.40 ? 25 : pr < 0.55 ? 20 : pr < 0.70 ? 12 : pr < 0.85 ? 5 : 0

  const years = m.yearsNoCut
  const streakScore = years >= 25 ? 25 : years >= 10 ? 20 : years >= 5 ? 12 : years >= 2 ? 5 : 0

  const cagr = m.dividendCagr5y ?? 0
  const cagrScore =
    cagr >= 0.08 ? 20 : cagr >= 0.05 ? 15 : cagr >= 0.02 ? 8 : cagr >= 0 ? 3 : 0

  const ratio = m.historicalMaxYield > 0 ? m.currentYield / m.historicalMaxYield : 0
  const yieldScore = ratio >= 0.85 ? 15 : ratio >= 0.70 ? 10 : ratio >= 0.50 ? 5 : 0

  const fcf = m.fcfPayout
  const fcfScore =
    fcf == null ? 0 : fcf < 0.50 ? 15 : fcf < 0.70 ? 10 : fcf < 0.85 ? 5 : 0

  return { payout: payoutScore, streak: streakScore, cagr: cagrScore, yield: yieldScore, fcf: fcfScore }
}

export function QualityScoreCard({ metrics }: QualityScoreCardProps) {
  const breakdown = computeBreakdown(metrics)
  const categoryColor: Record<string, string> = {
    Excellent: '#22c55e',
    Good: '#6366f1',
    Average: '#f59e0b',
    Risky: '#ef4444',
  }
  const color = categoryColor[metrics.qualityCategory] ?? '#71717a'

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <h3 className="text-sm font-medium text-[#71717a] mb-4">Quality Score</h3>

      <ScoreArc score={metrics.qualityScore} />

      <p className="text-center font-semibold mt-1 mb-5" style={{ color }}>
        {metrics.qualityCategory}
      </p>

      <div className="space-y-2.5">
        {BREAKDOWN_LABELS.map(({ key, label, max }) => {
          const val = breakdown[key] ?? 0
          const pct = (val / max) * 100
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#71717a]">{label}</span>
                <span className="text-[#f4f4f5]">
                  {val}/{max}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1e1e2e] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#22c55e' : pct >= 40 ? '#6366f1' : '#f59e0b' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
