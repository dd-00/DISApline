import type { ReactNode } from 'react'
import ConstellationBackground from '@/components/ui/ConstellationBackground'
import CustomCursor from '@/components/ui/CustomCursor'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#09090B', position: 'relative', overflow: 'hidden' }}>
      <CustomCursor />
      <ConstellationBackground />
      {/* gold glow */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,162,39,0.07), transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--chalk)' }}>
            DIS<span style={{ color: 'var(--gold)' }}>A</span>pline
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
