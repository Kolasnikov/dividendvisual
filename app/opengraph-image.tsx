import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DividendVisual — Understand dividend valuation visually'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          fontFamily: 'sans-serif',
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
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-1px' }}>
            Dividend
          </span>
          <span style={{ fontSize: 52, fontWeight: 800, color: '#6366f1', letterSpacing: '-1px' }}>
            Visual
          </span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: '#71717a', marginBottom: 56, textAlign: 'center', maxWidth: 700 }}>
          Understand dividend valuation visually.
        </div>

        {/* Three pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Weiss Valuation Bands', color: '#6366f1' },
            { label: 'Quality Score', color: '#22c55e' },
            { label: 'Income Compounder', color: '#f59e0b' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: `${color}18`,
                border: `1px solid ${color}40`,
                borderRadius: 100,
                padding: '10px 22px',
                fontSize: 18,
                color,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{ position: 'absolute', bottom: 36, fontSize: 18, color: '#3f3f46' }}>
          dividendvisual.com
        </div>
      </div>
    ),
    { ...size },
  )
}
