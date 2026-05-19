import Link from 'next/link'

interface ResearchDisclosureProps {
  updatedLabel: string
  compact?: boolean
}

export function ResearchDisclosure({ updatedLabel, compact = false }: ResearchDisclosureProps) {
  return (
    <aside className={`rounded-lg border border-[#1e1e2e] bg-[#111118] ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">DividendVisual Research</p>
          <p className="mt-1 text-sm text-[#f4f4f5]">
            Data-driven dividend analysis using the Geraldine Weiss yield method.
          </p>
        </div>
        <p className="text-xs text-[#71717a] sm:text-right">Updated {updatedLabel}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-[#f4f4f5]">Methodology</p>
          <p className="mt-1 text-xs leading-relaxed text-[#71717a]">
            10-year yield history, percentile-based valuation bands, and dividend quality scoring.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#f4f4f5]">Data Policy</p>
          <p className="mt-1 text-xs leading-relaxed text-[#71717a]">
            Price, dividend, payout, and growth metrics are refreshed regularly and cached for performance.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#f4f4f5]">Important</p>
          <p className="mt-1 text-xs leading-relaxed text-[#71717a]">
            Educational research only. This is not investment, tax, or financial advice.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-[#1e1e2e] pt-3">
        <Link href="/methodology" className="text-xs text-[#6366f1] hover:text-[#818cf8]">
          Full methodology
        </Link>
        <Link href="/about" className="text-xs text-[#6366f1] hover:text-[#818cf8]">
          About DividendVisual
        </Link>
        <Link href="/terms" className="text-xs text-[#6366f1] hover:text-[#818cf8]">
          Terms and disclaimer
        </Link>
      </div>
    </aside>
  )
}
