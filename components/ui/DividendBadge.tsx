interface DividendBadgeProps {
  type: 'king' | 'aristocrat' | 'bluechip'
}

const CONFIG = {
  king:       { label: 'Dividend King',       className: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30' },
  aristocrat: { label: 'Dividend Aristocrat',  className: 'bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30' },
  bluechip:   { label: 'Blue Chip',            className: 'bg-[#71717a]/15 text-[#a1a1aa] border border-[#71717a]/30' },
}

export function DividendBadge({ type }: DividendBadgeProps) {
  const { label, className } = CONFIG[type]
  return (
    <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium ${className}`}>
      {label}
    </span>
  )
}
