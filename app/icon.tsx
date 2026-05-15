import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          borderRadius: 7,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.5px', fontFamily: 'sans-serif' }}>
          D
        </span>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#6366f1', letterSpacing: '-0.5px', fontFamily: 'sans-serif' }}>
          V
        </span>
      </div>
    ),
    { ...size },
  )
}
