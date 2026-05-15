import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SIGNAL_COLOR: Record<string, string> = {
  undervalued: '#22c55e',
  overvalued: '#ef4444',
  'fair-value': '#f59e0b',
}

const SIGNAL_LABEL: Record<string, string> = {
  undervalued: 'Undervalued',
  overvalued: 'Overvalued',
  'fair-value': 'Fair Value',
}

export default async function OgImage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const sym = symbol.toUpperCase()

  let name = sym
  let yieldPct = ''
  let signal = 'fair-value'
  let qualityScore: number | null = null

  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://dividendvisual.com'
    const res = await fetch(`${base}/api/ticker/${sym}`)
    if (res.ok) {
      const data = await res.json()
      name = data.company?.name ?? sym
      signal = data.metrics?.weissSignal ?? 'fair-value'
      if (data.metrics?.currentYield) {
        yieldPct = `${(data.metrics.currentYield * 100).toFixed(2)}%`
      }
      qualityScore = data.metrics?.qualityScore ?? null
    }
  } catch {
    // fallback to defaults
  }

  const signalColor = SIGNAL_COLOR[signal] ?? '#f59e0b'
  const signalLabel = SIGNAL_LABEL[signal] ?? 'Fair Value'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          fontFamily: 'sans-serif',
          padding: '56px 72px',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${signalColor}18 0%, transparent 65%)`,
          }}
        />

        {/* Top: branding */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5' }}>Dividend</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>Visual</span>
        </div>

        {/* Center: ticker info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 80, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-2px' }}>
              {sym}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: `${signalColor}20`,
                border: `1.5px solid ${signalColor}50`,
                borderRadius: 100,
                padding: '8px 24px',
                fontSize: 22,
                color: signalColor,
                fontWeight: 700,
              }}
            >
              {signalLabel}
            </div>
          </div>
          <div style={{ fontSize: 30, color: '#71717a', maxWidth: 700 }}>{name}</div>
        </div>

        {/* Bottom: metrics row */}
        <div style={{ display: 'flex', gap: 40 }}>
          {yieldPct && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 16, color: '#52525b' }}>Current Yield</span>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#f4f4f5' }}>{yieldPct}</span>
            </div>
          )}
          {qualityScore !== null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 16, color: '#52525b' }}>Quality Score</span>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#6366f1' }}>
                {qualityScore}<span style={{ fontSize: 20, color: '#52525b' }}>/100</span>
              </span>
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 18, color: '#3f3f46' }}>dividendvisual.com</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
