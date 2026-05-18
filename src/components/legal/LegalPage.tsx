'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

interface Section {
  title: string
  content: ReactNode
}

interface LegalPageProps {
  title: string
  subtitle: string
  lastUpdated: string
  sections: Section[]
}

export default function LegalPage({ title, subtitle, lastUpdated, sections }: LegalPageProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        .legal-section h3 { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; color: #E8E4D8; margin: 0 0 12px; letter-spacing: -0.01em; }
        .legal-section p  { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; font-weight: 300; color: #8A8578; line-height: 1.9; margin: 0 0 12px; }
        .legal-section ul { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; font-weight: 300; color: #8A8578; line-height: 1.9; margin: 0 0 12px; padding-left: 20px; }
        .legal-section ul li { margin-bottom: 6px; }
        .legal-section strong { color: #C9A227; font-weight: 400; }
        .legal-section a { color: #C9A227; text-decoration: none; }
        .legal-section a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#09090B', color: '#E8E4D8' }}>

        {/* Nav */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(9,9,11,0.88)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 28px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: '#E8E4D8' }}>
                DIS<span style={{ color: '#C9A227' }}>A</span>pline
              </span>
            </Link>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Disclosures', href: '/disclosures' },
                { label: 'Cookies', href: '/cookies' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', letterSpacing: '0.08em', color: '#4A4640', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Header */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '64px 28px 48px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.65)', marginBottom: '18px' }}>Legal</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.05, color: '#E8E4D8', margin: '0 0 14px' }}>{title}</h1>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#4A4640', margin: 0 }}>{subtitle}</p>
            <div style={{ marginTop: '20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', letterSpacing: '0.06em' }}>
              Last updated: <span style={{ color: '#8A8578' }}>{lastUpdated}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ maxWidth: '860px', margin: '0 auto', padding: '56px 28px 96px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {sections.map((section, i) => (
              <div key={i} className="legal-section" style={{ paddingBottom: '48px', borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: 'rgba(201,162,39,0.45)', minWidth: '28px', paddingTop: '3px', letterSpacing: '0.06em' }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ flex: 1 }}>
                    <h3>{section.title}</h3>
                    <div>{section.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 28px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640' }}>
                © 2026 ZB Capital S.R.L. — Italy
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.55)', letterSpacing: '0.04em' }}>
                C.F. / P.IVA / N. iscr. RI: 18314361009 · Atto cost. 20/11/2025 · Iscr. RI 02/02/2016
              </span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Disclosures', href: '/disclosures' },
                { label: 'Cookies', href: '/cookies' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
