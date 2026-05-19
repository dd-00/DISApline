import { ImageResponse } from 'next/og'

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
          background: '#06060A',
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 115,
            fontWeight: 400,
            color: '#C9A227',
            lineHeight: 1,
            paddingTop: 12,
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size }
  )
}
