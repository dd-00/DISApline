'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'all')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
      background: 'rgba(17,17,19,0.97)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '16px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '14px',
    }}>
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px', fontWeight: 300, color: '#8A8578',
        margin: 0, maxWidth: '580px', lineHeight: 1.75, letterSpacing: '0.02em',
      }}>
        We use essential cookies to keep you logged in, and optional analytics cookies to improve the platform.{' '}
        <Link href="/cookies" style={{ color: '#C9A227', textDecoration: 'none' }}>Cookie Policy</Link>
        {' '}·{' '}
        <Link href="/privacy" style={{ color: '#C9A227', textDecoration: 'none' }}>Privacy Policy</Link>
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px',
            color: '#8A8578', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '5px',
            padding: '9px 18px', cursor: 'pointer', letterSpacing: '0.06em',
          }}
        >
          Essential only
        </button>
        <button
          onClick={accept}
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', fontWeight: 500,
            color: '#09090B', background: '#C9A227',
            border: 'none', borderRadius: '5px',
            padding: '9px 18px', cursor: 'pointer', letterSpacing: '0.06em',
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  )
}
