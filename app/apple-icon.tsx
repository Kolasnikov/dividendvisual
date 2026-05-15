import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          borderRadius: 40,
        }}
      >
        <span style={{ fontSize: 82, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-3px', fontFamily: 'sans-serif' }}>
          D
        </span>
        <span style={{ fontSize: 82, fontWeight: 800, color: '#6366f1', letterSpacing: '-3px', fontFamily: 'sans-serif' }}>
          V
        </span>
      </div>
    ),
    { ...size },
  )
}
