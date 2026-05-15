import type { WeissSignal } from '@/lib/types'

interface SignalBadgeProps {
  signal: WeissSignal
  size?: 'sm' | 'md'
}

const CONFIG: Record<WeissSignal, { label: string; className: string }> = {
  undervalued: {
    label: 'Undervalued',
    className: 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30',
  },
  fair: {
    label: 'Fair Value',
    className: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30',
  },
  overvalued: {
    label: 'Overvalued',
    className: 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30',
  },
}

export function SignalBadge({ signal, size = 'md' }: SignalBadgeProps) {
  const { label, className } = CONFIG[signal]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${className}`}>
      {label}
    </span>
  )
}
