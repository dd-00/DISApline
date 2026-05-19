import { ImageResponse } from 'next/og'

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
          background: '#06060A',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 22,
            fontWeight: 400,
            color: '#C9A227',
            lineHeight: 1,
            paddingTop: 3,
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size }
  )
}
