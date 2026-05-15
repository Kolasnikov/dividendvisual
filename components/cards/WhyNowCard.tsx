import { TrendingDown, TrendingUp, Minus, Info } from 'lucide-react'
import type { ComputedMetrics } from '@/lib/types'

interface WhyNowCardProps {
  metrics: ComputedMetrics
}

const SIGNAL_CONFIG = {
  undervalued: {
    borderColor: '#22c55e',
    Icon: TrendingDown,
    iconColor: '#22c55e',
    bgColor: '#22c55e',
  },
  fair: {
    borderColor: '#f59e0b',
    Icon: Minus,
    iconColor: '#f59e0b',
    bgColor: '#f59e0b',
  },
  overvalued: {
    borderColor: '#ef4444',
    Icon: TrendingUp,
    iconColor: '#ef4444',
    bgColor: '#ef4444',
  },
}

export function WhyNowCard({ metrics }: WhyNowCardProps) {
  const { borderColor, Icon, iconColor } = SIGNAL_CONFIG[metrics.weissSignal]
  const lines = metrics.whyNowText.split('\n').filter(Boolean)

  return (
    <div
      className="bg-[#111118] rounded-xl p-5"
      style={{ border: `1px solid ${borderColor}40` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <h3 className="text-sm font-medium text-[#71717a]">Why Now?</h3>
      </div>

      <div className="space-y-2.5">
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#71717a]" />
            <p className="text-sm text-[#f4f4f5] leading-relaxed">{line}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
