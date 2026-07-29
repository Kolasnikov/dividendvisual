import { TrackedOutboundLink } from '@/components/analytics/TrackedOutboundLink'

interface BrokerCTAProps {
  signal: string
  symbol: string
  companyName: string
  placement: string
}

export function BrokerCTA({ signal, symbol, companyName, placement }: BrokerCTAProps) {
  const isUndervalued = signal === 'undervalued'

  return (
    <div className={`rounded-xl p-5 border ${isUndervalued ? 'bg-[#0b1a10] border-[#22c55e]/25' : 'bg-[#111118] border-[#1e1e2e]'}`}>
      {isUndervalued ? (
        <>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[10px] font-semibold text-[#22c55e] uppercase tracking-wide">Historically elevated yield</span>
          </div>
          <p className="text-sm font-medium text-[#f4f4f5] mb-4 leading-snug">
            {symbol} has an undervalued Weiss signal. Review the risks and current trading costs before acting.
          </p>
        </>
      ) : (
        <>
          <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wide mb-1.5">Invest in {symbol}</p>
          <p className="text-sm font-medium text-[#f4f4f5] mb-4 leading-snug">
            Check {companyName} availability and current costs on eToro
          </p>
        </>
      )}

      <TrackedOutboundLink
        href={`/go/etoro?placement=${encodeURIComponent(placement)}`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        event="broker_cta_clicked"
        properties={{ broker: 'eToro', symbol, signal }}
        className={`flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          isUndervalued
            ? 'bg-[#22c55e] text-[#07130b] hover:bg-[#4ade80]'
            : 'bg-[#6366f1] text-white hover:bg-[#818cf8]'
        }`}
      >
        Check eToro terms and availability →
      </TrackedOutboundLink>

      <div className="flex justify-center gap-4 mt-3">
        {['Fractional shares', 'Fees vary by country', 'Capital at risk'].map((feat) => (
          <span key={feat} className="text-[10px] text-[#3e3e4e]">{feat}</span>
        ))}
      </div>

      <p className="text-[10px] text-[#3e3e4e] mt-3 leading-relaxed">
        DividendVisual may earn a commission if you open an account via this link, at no cost to you. Capital at risk. Not financial advice.
      </p>
    </div>
  )
}
