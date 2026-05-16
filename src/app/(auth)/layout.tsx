export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* subtle grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />
      {/* gold glow */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,162,39,0.07), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
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
