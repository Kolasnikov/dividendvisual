export function DataUnavailableNotice({ label = 'stock screen' }: { label?: string }) {
  return (
    <div className="rounded-lg border border-[#f59e0b]/25 bg-[#f59e0b]/5 px-5 py-4" role="status">
      <p className="text-sm font-semibold text-[#fbbf24]">Live data is temporarily unavailable</p>
      <p className="mt-1 text-sm leading-relaxed text-[#a1a1aa]">
        The {label} could not refresh its current metrics. The research guide remains available below; try the live comparison again shortly.
      </p>
    </div>
  )
}
