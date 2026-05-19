'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import CookieBanner from '@/components/ui/CookieBanner'

const TICKER_ITEMS = ['DISCIPLINE', 'PSYCHOLOGY', 'PATTERN DETECTION', 'EQUITY TRACKING', 'BIAS AWARENESS', 'RULE ADHERENCE', 'REFLECTION', 'RISK CONTROL', 'FOCUS', 'CONSISTENCY', 'SELF-AWARENESS', 'EDGE']

const FEATURES = [
  { num: '01', title: 'Psychology Scoring', desc: 'Every trade scored across emotion, discipline, and bias resistance. Your psychology has a number — and it moves.', color: '#C9A227' },
  { num: '02', title: 'Pattern Detection', desc: 'Revenge trades, FOMO entries, loss aversion — surfaced before they cost you real money.', color: '#7EB8E8' },
  { num: '03', title: 'Trade Journal', desc: 'Log trades with chart screenshots, pre/post check-ins, and deep reflection prompts.', color: '#5DB87A' },
  { num: '04', title: 'Equity Curve', desc: 'Real cumulative P&L over time. See exactly where discipline collapsed.', color: '#C9A227' },
  { num: '05', title: 'Correlation Insights', desc: 'Do you win more when rested? We answer that with your own data, precisely.', color: '#7EB8E8' },
  { num: '06', title: 'Daily Check-In', desc: 'Rate your mental state before markets open. Know which days to stay out.', color: '#5DB87A' },
]

const CURVE_LINE = 'M0,480 L55,462 L110,448 L165,428 L205,408 L245,392 L285,365 L320,376 L360,350 L400,325 L440,338 L480,302 L520,312 L560,278 L600,256 L640,270 L680,235 L720,214 L760,198 L800,178 L840,158 L880,140 L920,122 L960,108 L1000,92'
const CURVE_FILL = CURVE_LINE + ' L1000,480 L0,480 Z'

interface Star { x: number; y: number; r: number; phase: number; speed: number; driftX: number; driftY: number; driftSpeed: number }

async function handleCheckout(plan: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  if (res.status === 401) { window.location.href = '/signup?redirect=pricing'; return }
  const { url } = await res.json()
  if (url) window.location.href = url
}

export default function LandingPage() {
  const [cursorHover, setCursorHover] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function checkout(plan: string) {
    setLoadingPlan(plan)
    await handleCheckout(plan)
    setLoadingPlan(null)
  }

  // Two-part cursor
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouseTarget = useRef({ x: -300, y: -300 })
  const ringPos     = useRef({ x: -300, y: -300 })
  const isHover     = useRef(false)

  // Constellation
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef  = useRef<Star[]>([])
  const mouseConst = useRef({ x: -2000, y: -2000 })

  // Reveal
  const revealRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window)
    const W = window.innerWidth
    const H = window.innerHeight

    // ── Generate stars ─────────────────────────────────────
    if (isMobile) {
      // Skip constellation and cursor on mobile — too heavy and irrelevant for touch
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }
        }),
        { threshold: 0.08 }
      )
      revealRefs.current.forEach(el => { if (el) obs.observe(el) })
      return () => obs.disconnect()
    }

    starsRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.7 + 0.25,
      driftX: Math.random() * Math.PI * 2,
      driftY: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 1.2 + 0.5,
    }))

    const canvas = canvasRef.current!
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    const LINK_DIST = 145
    const GLOW_DIST = 190

    // ── Constellation RAF ──────────────────────────────────
    let constRaf: number
    function drawStars() {
      const now = performance.now() / 1000
      const mx = mouseConst.current.x
      const my = mouseConst.current.y
      const stars = starsRef.current
      ctx.clearRect(0, 0, W, H)

      // Compute drifted positions once per frame
      const px = stars.map(s => s.x + Math.sin(now * s.driftSpeed + s.driftX) * 14)
      const py = stars.map(s => s.y + Math.cos(now * s.driftSpeed * 0.8 + s.driftY) * 10)

      // Lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dist = Math.hypot(px[i] - px[j], py[i] - py[j])
          if (dist > LINK_DIST) continue

          const midX = (px[i] + px[j]) / 2
          const midY = (py[i] + py[j]) / 2
          const mDist = Math.hypot(midX - mx, midY - my)
          const prox = Math.max(0, 1 - mDist / GLOW_DIST)
          const fade = 1 - dist / LINK_DIST

          ctx.beginPath()
          ctx.moveTo(px[i], py[i])
          ctx.lineTo(px[j], py[j])
          ctx.strokeStyle = prox > 0
            ? `rgba(201,162,39,${0.03 + prox * 0.13})`
            : `rgba(138,133,120,${0.022 * fade})`
          ctx.lineWidth = prox > 0 ? 0.4 + prox * 0.3 : 0.25
          ctx.stroke()
        }
      }

      // Stars
      for (let k = 0; k < stars.length; k++) {
        const s = stars[k]
        const sx = px[k], sy = py[k]
        const sDist = Math.hypot(sx - mx, sy - my)
        const prox  = Math.max(0, 1 - sDist / GLOW_DIST)
        const twinkle = Math.sin(now * s.speed + s.phase) * 0.5 + 0.5

        if (prox > 0) {
          // soft outer glow
          const glowR = s.r + prox * 8
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR)
          g.addColorStop(0, `rgba(201,162,39,${prox * 0.14})`)
          g.addColorStop(1, 'rgba(201,162,39,0)')
          ctx.beginPath()
          ctx.arc(sx, sy, glowR, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()

          // core
          ctx.beginPath()
          ctx.arc(sx, sy, s.r * (1 + prox * 0.6), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(201,162,39,${0.18 + prox * 0.18})`
          ctx.fill()
        } else {
          const base = 0.06 + twinkle * 0.07
          ctx.beginPath()
          ctx.arc(sx, sy, s.r * (0.8 + twinkle * 0.25), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(190,178,148,${base})`
          ctx.fill()
        }
      }
      constRaf = requestAnimationFrame(drawStars)
    }
    drawStars()

    // ── Cursor RAF ─────────────────────────────────────────
    let curRaf: number
    function moveCursor() {
      const mx = mouseTarget.current.x
      const my = mouseTarget.current.y
      const lerp = isHover.current ? 0.09 : 0.12

      ringPos.current.x += (mx - ringPos.current.x) * lerp
      ringPos.current.y += (my - ringPos.current.y) * lerp

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%,-50%)`
      }
      curRaf = requestAnimationFrame(moveCursor)
    }
    moveCursor()

    // ── Magnetic buttons ───────────────────────────────────
    function applyMagnetic(e: MouseEvent) {
      document.querySelectorAll<HTMLElement>('.l-magnetic').forEach(el => {
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
        const radius = 90

        if (dist < radius) {
          const pull = (1 - dist / radius)
          const dx = (e.clientX - cx) * pull * 0.42
          const dy = (e.clientY - cy) * pull * 0.42
          const scale = 1 + pull * 0.08
          el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
          el.style.boxShadow = `0 0 ${24 + pull * 28}px rgba(201,162,39,${0.12 + pull * 0.32})`
        } else {
          el.style.transform = 'translate(0,0) scale(1)'
          el.style.boxShadow = ''
        }
      })
    }

    // ── Mouse events ───────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouseConst.current = { x: e.clientX, y: e.clientY }
      mouseTarget.current = { x: e.clientX, y: e.clientY }
      applyMagnetic(e)
    }

    const onOver = (e: MouseEvent) => {
      const hovering = !!(e.target as HTMLElement).closest('a, button')
      isHover.current = hovering
      setCursorHover(hovering)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)

    // ── Scroll reveal ──────────────────────────────────────
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      }),
      { threshold: 0.08 }
    )
    revealRefs.current.forEach(el => { if (el) obs.observe(el) })

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(constRaf)
      cancelAnimationFrame(curRaf)
      obs.disconnect()
    }
  }, [])

  const reveal = (i: number): React.CSSProperties => ({
    opacity: 0, transform: 'translateY(28px)',
    transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`,
  })
  const addReveal = (i: number) => (el: HTMLElement | null) => { revealRefs.current[i] = el }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

        * { cursor: none !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawCurve {
          from { stroke-dashoffset: 4000; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fillFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.75); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: translate(var(--dx), var(--dy)) translate(-50%,-50%) scale(1); }
          50%       { transform: translate(var(--dx), var(--dy)) translate(-50%,-50%) scale(1.6); }
        }

        .l-nav   { animation: fadeUp 0.7s ease 0.05s both; }
        .l-badge { animation: fadeUp 0.7s ease 0.2s both; }
        .l-h1a   { animation: fadeUp 0.9s ease 0.32s both; }
        .l-h1b   { animation: fadeUp 0.9s ease 0.46s both; }
        .l-sub   { animation: fadeUp 0.8s ease 0.6s both; }
        .l-ctas  { animation: fadeUp 0.8s ease 0.74s both; }
        .l-curve { animation: drawCurve 3.6s cubic-bezier(0.4,0,0.2,1) 0.6s both; stroke-dasharray: 4000; stroke-dashoffset: 4000; }
        .l-fill  { animation: fillFade 1.8s ease 1.8s both; }
        .l-blink { animation: blink 1.1s step-end infinite; }
        .l-ticker { animation: ticker 30s linear infinite; }
        .l-dot   { animation: pulse 2.2s ease-in-out infinite; }

        .l-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 768px) {
          .l-feat-grid { grid-template-columns: 1fr !important; }
          .l-pricing-grid { grid-template-columns: 1fr !important; }
          .l-constellation { display: none !important; }
          .l-cursor-dot, .l-cursor-ring { display: none !important; }
        }

        .l-card { transition: border-color 0.22s, transform 0.22s, background 0.22s, box-shadow 0.22s !important; }
        .l-card:hover {
          border-color: rgba(201,162,39,0.32) !important;
          transform: translateY(-6px) scale(1.015) !important;
          background: rgba(201,162,39,0.035) !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(201,162,39,0.08) !important;
        }

        .l-magnetic {
          transition: transform 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s ease !important;
          will-change: transform;
        }

        .l-btn-gold {
          transition: background 0.15s, box-shadow 0.2s !important;
          position: relative; overflow: hidden;
        }
        .l-btn-gold::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .l-btn-gold:hover::after { transform: translateX(100%); }
        .l-btn-gold:hover { background: #E8C460 !important; }

        .l-btn-ghost { transition: border-color 0.2s, color 0.2s, background 0.2s !important; }
        .l-btn-ghost:hover { border-color: rgba(201,162,39,0.4) !important; color: #E8E4D8 !important; background: rgba(201,162,39,0.04) !important; }

        details summary::-webkit-details-marker { display: none; }
        details summary::marker { display: none; }
        details[open] summary .faq-plus { opacity: 0; }
        details[open] summary .faq-minus { opacity: 1; }
        details summary .faq-plus { opacity: 1; transition: opacity 0.15s; }
        details summary .faq-minus { opacity: 0; position: absolute; transition: opacity 0.15s; }
        details[open] > p { animation: fadeUp 0.25s ease both; }

        .grain-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.032;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }
      `}</style>

      <CookieBanner />

      {/* Grain */}
      <div className="grain-bg" />

      {/* Constellation canvas */}
      <canvas ref={canvasRef} className="l-constellation" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />


      {/* Cursor — gold dot (exact position) */}
      <div
        ref={dotRef}
        className="l-cursor-dot"
        style={{
          position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999,
          width: cursorHover ? '8px' : '6px',
          height: cursorHover ? '8px' : '6px',
          borderRadius: '50%',
          background: '#C9A227',
          boxShadow: `0 0 ${cursorHover ? 12 : 6}px rgba(201,162,39,${cursorHover ? 0.9 : 0.6})`,
          transition: 'width 0.18s ease, height 0.18s ease, box-shadow 0.18s ease',
          willChange: 'transform',
        }}
      />

      {/* Cursor — ring (delayed follow) */}
      <div
        ref={ringRef}
        className="l-cursor-ring"
        style={{
          position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9998,
          width: cursorHover ? '56px' : '34px',
          height: cursorHover ? '56px' : '34px',
          borderRadius: '50%',
          border: `1.5px solid rgba(201,162,39,${cursorHover ? 0.85 : 0.45})`,
          background: cursorHover ? 'rgba(201,162,39,0.06)' : 'transparent',
          boxShadow: cursorHover ? '0 0 20px rgba(201,162,39,0.18), inset 0 0 12px rgba(201,162,39,0.06)' : 'none',
          transition: 'width 0.3s cubic-bezier(0.23,1,0.32,1), height 0.3s cubic-bezier(0.23,1,0.32,1), border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
          willChange: 'transform',
        }}
      />

      <div style={{ minHeight: '100vh', background: '#09090B', color: '#E8E4D8', position: 'relative', overflowX: 'hidden' }}>

        {/* Ambient halo */}
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 65% 20%, rgba(201,162,39,0.05) 0, transparent 60%), radial-gradient(ellipse 45% 50% at 10% 85%, rgba(77,122,108,0.035) 0, transparent 55%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* ── NAV ──────────────────────────────────────────── */}
        <nav className="l-nav" style={{ position: 'relative', zIndex: 10, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(9,9,11,0.82)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 28px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 400, letterSpacing: '-0.01em', color: '#E8E4D8' }}>
              DIS<span style={{ color: '#C9A227' }}>A</span>pline
            </span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link href="/login" className="l-btn-ghost l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#8A8578', letterSpacing: '0.06em', textDecoration: 'none', padding: '7px 16px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.06)', display: 'inline-block' }}>
                Sign in
              </Link>
              <Link href="/signup" className="l-btn-gold l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 500, color: '#09090B', letterSpacing: '0.07em', textDecoration: 'none', padding: '7px 18px', borderRadius: '5px', background: '#C9A227', display: 'inline-block' }}>
                Get started →
              </Link>
            </div>
          </div>
        </nav>

        {/* ── DISCLAIMER STRIP ─────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 10, background: 'rgba(201,162,39,0.05)', borderBottom: '1px solid rgba(201,162,39,0.1)', padding: '7px 28px' }}>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', color: 'rgba(201,162,39,0.62)', textAlign: 'center', letterSpacing: '0.05em', margin: 0 }}>
            DISApline is a personal journaling tool — not financial advice. Trading involves substantial risk of loss.{' '}
            <Link href="/disclosures" style={{ color: 'rgba(201,162,39,0.85)', textDecoration: 'none' }}>Risk disclosures →</Link>
          </p>
        </div>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '108px 28px 80px', position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 1000 480" preserveAspectRatio="xMaxYMid meet" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '62%', pointerEvents: 'none', zIndex: 2, opacity: 0.13 }}>
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="l-fill" d={CURVE_FILL} fill="url(#curveGrad)" />
            <path className="l-curve" d={CURVE_LINE} fill="none" stroke="#C9A227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 5 }}>
            <div style={{ maxWidth: '640px' }}>
              <div className="l-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '100px', border: '1px solid rgba(201,162,39,0.22)', background: 'rgba(201,162,39,0.05)', marginBottom: '36px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A227' }}>
                <div className="l-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A227', flexShrink: 0 }} />
                Trading Psychology Journal
              </div>

              <h1 className="l-h1a" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(54px, 6.5vw, 92px)', fontWeight: 300, lineHeight: 1.0, letterSpacing: '-0.03em', color: '#E8E4D8', margin: '0 0 4px' }}>
                Know yourself.
              </h1>
              <h1 className="l-h1b" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(54px, 6.5vw, 92px)', fontWeight: 300, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 32px' }}>
                <em style={{ background: 'linear-gradient(130deg, #C9A227, #E8C460 60%, #C9A227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>Trade better.</em>
              </h1>

              <p className="l-sub" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', fontWeight: 300, color: '#8A8578', letterSpacing: '0.02em', lineHeight: 1.82, maxWidth: '440px', marginBottom: '40px' }}>
                The trading journal built around your psychology.<br />Not just your trades.<br />Track emotional triggers.<br />Detect cognitive biases.<br />Measure rule adherence across every session.<span className="l-blink" style={{ color: '#C9A227', marginLeft: '1px' }}>_</span>
              </p>

              <div className="l-ctas" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a href="#pricing" className="l-btn-gold l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 500, color: '#09090B', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '13px 30px', borderRadius: '5px', background: '#C9A227', textDecoration: 'none', display: 'inline-block' }}>
                  See plans
                </a>
                <Link href="/login" className="l-btn-ghost l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 400, color: '#8A8578', letterSpacing: '0.06em', padding: '13px 26px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', display: 'inline-block' }}>
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ──────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', padding: '36px 28px' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
            {[{ v: '6', l: 'metrics tracked' }, { v: '12', l: 'patterns detected' }, { v: '∞', l: 'trades' }].map(({ v, l }, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '52px', fontWeight: 300, lineHeight: 1, background: 'linear-gradient(130deg, #C9A227, #E8C460)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '6px' }}>{v}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TICKER ───────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 5, borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', padding: '14px 0', background: 'rgba(255,255,255,0.008)' }}>
          <div className="l-ticker" style={{ display: 'flex', gap: '56px', whiteSpace: 'nowrap', width: 'max-content' }}>
            {[...Array(2)].flatMap((_, r) =>
              TICKER_ITEMS.map((item, i) => (
                <span key={`${r}-${i}`} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8.5px', fontWeight: 300, letterSpacing: '0.22em', textTransform: 'uppercase', color: i % 4 === 0 ? '#C9A227' : 'rgba(138,133,120,0.4)' }}>
                  {item}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ── FEATURE GRID ─────────────────────────────────── */}
        <section id="features" style={{ padding: '96px 28px', position: 'relative', zIndex: 5 }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
            <div ref={addReveal(0)} style={{ ...reveal(0), textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A227', marginBottom: '14px' }}>What you get</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.08, color: '#E8E4D8' }}>
                Built around your psychology,<br />not just your trades.
              </h2>
            </div>
            <div className="l-feat-grid">
              {FEATURES.map(({ num, title, desc, color }, i) => (
                <div key={num} ref={addReveal(i + 1)} className="l-card" style={{ ...reveal(i + 1), padding: '32px', borderRadius: '10px', background: '#111113', border: '1px solid rgba(255,255,255,0.055)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}, transparent 70%)` }} />
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', color, marginBottom: '14px', opacity: 0.8 }}>{num}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#E8E4D8', marginBottom: '14px', lineHeight: 1.18 }}>{title}</h3>
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#8A8578', lineHeight: 1.88, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BROKER INTEGRATIONS ──────────────────────────── */}
        <section style={{ position: 'relative', zIndex: 5, padding: '88px 28px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.008)' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
            <div ref={addReveal(13)} style={{ ...reveal(0), textAlign: 'center', marginBottom: '52px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A227', marginBottom: '14px' }}>Broker integrations</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 3.8vw, 48px)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.08, color: '#E8E4D8', marginBottom: '18px' }}>
                Import your full trade history<br />in seconds.
              </h2>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#8A8578', maxWidth: '440px', margin: '0 auto', lineHeight: 1.82, letterSpacing: '0.02em' }}>
                Drop your CSV export — broker is auto-detected. No configuration, no manual entry, no duplicate imports.
              </p>
            </div>

            <div ref={addReveal(14)} style={{ ...reveal(1), display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {[
                { name: 'MetaTrader',    sub: 'MT4 · MT5'           },
                { name: 'Tradovate',     sub: 'Futures · Options'   },
                { name: 'IBKR',         sub: 'Interactive Brokers'  },
                { name: 'NinjaTrader',   sub: 'NT8'                 },
                { name: 'ThinkOrSwim',   sub: 'TD Ameritrade'       },
              ].map(({ name, sub }) => (
                <div key={name} style={{
                  padding: '22px 28px', borderRadius: '10px',
                  background: '#111113', border: '1px solid rgba(255,255,255,0.055)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  minWidth: '160px', flex: '0 0 auto',
                  transition: 'border-color 0.22s, background 0.22s, box-shadow 0.22s',
                }} className="l-card">
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', fontWeight: 500, color: '#C9A227', letterSpacing: '0.18em', textTransform: 'uppercase', background: 'rgba(201,162,39,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(201,162,39,0.2)' }}>CSV</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: '#E8E4D8', letterSpacing: '-0.01em' }}>{name}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: '#4A4640', letterSpacing: '0.06em' }}>{sub}</span>
                </div>
              ))}
            </div>

            <div ref={addReveal(15)} style={{ ...reveal(2), textAlign: 'center', marginTop: '40px' }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', color: 'rgba(74,70,64,0.55)', letterSpacing: '0.06em', lineHeight: 1.8 }}>
                MT4 Detailed Report · MT5 Detailed Report · Tradovate Orders CSV · IBKR Flex Query ·<br />NinjaTrader Executions / Trade Performance · ThinkOrSwim Account Statement
              </p>
            </div>
          </div>
        </section>

        {/* ── PHILOSOPHY QUOTE ─────────────────────────────── */}
        <section style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '96px 28px', background: 'linear-gradient(180deg, rgba(201,162,39,0.022) 0%, transparent 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,162,39,0.055), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div ref={addReveal(7)} style={{ ...reveal(7) }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(201,162,39,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '32px' }}>On discipline</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3.2vw, 40px)', fontWeight: 300, fontStyle: 'italic', color: '#E8E4D8', lineHeight: 1.45, marginBottom: '28px' }}>
                "The market reflects your psychology back at you.<br />Learn to read yourself, and you begin to read the market."
              </p>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: '#4A4640', letterSpacing: '0.1em' }}>— Built for traders who take the inner game seriously</span>
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────── */}
        <section id="pricing" style={{ position: 'relative', zIndex: 5, padding: '112px 28px' }}>
          <div ref={addReveal(8)} style={{ ...reveal(8), textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(201,162,39,0.65)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '20px' }}>Simple pricing</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 300, color: '#E8E4D8', lineHeight: 1.04, letterSpacing: '-0.025em', margin: 0 }}>
              Your edge is<br /><em style={{ color: '#C9A227' }}>already inside you.</em>
            </h2>
          </div>

          <div className="l-pricing-grid" style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>

            {/* Monthly */}
            <div ref={addReveal(9)} style={{ ...reveal(9), borderRadius: '12px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)', padding: '36px 32px 32px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4640', marginBottom: '20px' }}>Monthly</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '54px', fontWeight: 300, color: '#E8E4D8', lineHeight: 1, letterSpacing: '-0.03em' }}>$9</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 300, color: '#8A8578' }}>.99</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', marginLeft: '4px' }}>/month</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: '#4A4640', marginBottom: '28px', letterSpacing: '0.04em' }}>Billed monthly — cancel any time</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Full journal & analytics', 'Psychology scoring', 'Pattern detection', 'Unlimited trade entries'].map(f => (
                  <li key={f} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#8A8578', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#C9A227', fontSize: '8px' }}>✦</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => checkout('monthly')} disabled={loadingPlan === 'monthly'} className="l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8578', padding: '12px 0', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', display: 'block', width: '100%', background: 'transparent', cursor: 'pointer', opacity: loadingPlan === 'monthly' ? 0.5 : 1 }}>
                {loadingPlan === 'monthly' ? 'Redirecting…' : 'Add to cart'}
              </button>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.6)', textAlign: 'center', marginTop: '10px', letterSpacing: '0.04em' }}>VAT calculated at checkout</div>
            </div>

            {/* Yearly — highlighted */}
            <div ref={addReveal(10)} style={{ ...reveal(10), borderRadius: '12px', background: 'rgba(201,162,39,0.04)', border: '1px solid rgba(201,162,39,0.28)', padding: '36px 32px 32px', display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: '#C9A227', color: '#09090B', fontFamily: "'IBM Plex Mono', monospace", fontSize: '8.5px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 14px', borderRadius: '0 0 8px 8px' }}>Most popular</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.7)', marginBottom: '20px' }}>Yearly</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '54px', fontWeight: 300, color: '#E8E4D8', lineHeight: 1, letterSpacing: '-0.03em' }}>$99</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 300, color: '#8A8578' }}>.99</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', marginLeft: '4px' }}>/year</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(201,162,39,0.55)', marginBottom: '28px', letterSpacing: '0.04em' }}>Billed every 12 months — save 17%</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Everything in Monthly', 'Priority support', 'Early access to new features', 'Annual performance report'].map(f => (
                  <li key={f} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#8A8578', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#C9A227', fontSize: '8px' }}>✦</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => checkout('yearly')} disabled={loadingPlan === 'yearly'} className="l-btn-gold l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#09090B', padding: '13px 0', borderRadius: '6px', background: '#C9A227', textAlign: 'center', display: 'block', width: '100%', border: 'none', cursor: 'pointer', opacity: loadingPlan === 'yearly' ? 0.5 : 1 }}>
                {loadingPlan === 'yearly' ? 'Redirecting…' : 'Add to cart'}
              </button>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.6)', textAlign: 'center', marginTop: '10px', letterSpacing: '0.04em' }}>VAT calculated at checkout</div>
            </div>

            {/* Lifetime */}
            <div ref={addReveal(11)} style={{ ...reveal(11), borderRadius: '12px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)', padding: '36px 32px 32px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4640', marginBottom: '20px' }}>Lifetime</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '54px', fontWeight: 300, color: '#E8E4D8', lineHeight: 1, letterSpacing: '-0.03em' }}>$199</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 300, color: '#8A8578' }}>.99</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', marginLeft: '4px' }}>one-time</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: '#4A4640', marginBottom: '28px', letterSpacing: '0.04em' }}>Pay once, use forever</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Everything in Yearly', 'All future features included', 'Lifetime priority support', 'No renewal, no surprises'].map(f => (
                  <li key={f} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#8A8578', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#C9A227', fontSize: '8px' }}>✦</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => checkout('lifetime')} disabled={loadingPlan === 'lifetime'} className="l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8578', padding: '12px 0', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', display: 'block', width: '100%', background: 'transparent', cursor: 'pointer', opacity: loadingPlan === 'lifetime' ? 0.5 : 1 }}>
                {loadingPlan === 'lifetime' ? 'Redirecting…' : 'Add to cart'}
              </button>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.6)', textAlign: 'center', marginTop: '10px', letterSpacing: '0.04em' }}>VAT calculated at checkout</div>
            </div>

          </div>

          <div ref={addReveal(12)} style={{ ...reveal(12), textAlign: 'center', marginTop: '48px' }}>
            <Link href="/login" className="l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', textDecoration: 'none', letterSpacing: '0.05em', display: 'inline-block' }}>
              Already have an account? Sign in →
            </Link>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.5)', marginTop: '14px', lineHeight: 1.7, letterSpacing: '0.04em' }}>
              EU consumers: 14-day right of withdrawal applies from date of purchase.{' '}
              <Link href="/terms#right-of-withdrawal" style={{ color: 'rgba(201,162,39,0.55)', textDecoration: 'none' }}>Terms of Service</Link>
              {' '}· Prices shown exclude VAT where applicable.
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section id="faq" style={{ position: 'relative', zIndex: 5, padding: '88px 28px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div ref={addReveal(16)} style={{ ...reveal(0), textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A227', marginBottom: '14px' }}>FAQ</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 3.8vw, 48px)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.08, color: '#E8E4D8', margin: 0 }}>
                Common questions.
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                {
                  q: 'Can I cancel my subscription at any time?',
                  a: 'Yes. Cancel from your account settings at any time. Access continues until the end of the current billing period — no pro-rated refunds for unused time, unless required by EU consumer law.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Not currently. The monthly plan at $9.99 offers the lowest-commitment way to try the full platform. EU residents also have a 14-day right of withdrawal from the date of purchase.',
                },
                {
                  q: 'What if I want a refund?',
                  a: 'EU consumers have a statutory 14-day right of withdrawal. Contact support@disapline.eu within that window. After day 14, refunds are issued only where we have materially failed to deliver the service.',
                },
                {
                  q: 'Which brokers can I import from?',
                  a: 'MetaTrader 4/5, Tradovate, Interactive Brokers (IBKR), NinjaTrader, and ThinkOrSwim — all via CSV export. The broker is auto-detected; just drop your file in.',
                },
                {
                  q: 'Is my trading data secure?',
                  a: 'Yes. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Row-level security ensures each user can only ever access their own data. We never sell, share, or use your trading data to train AI models.',
                },
                {
                  q: 'Does DISApline provide financial advice?',
                  a: 'No. DISApline is a personal journaling and analytics tool. Nothing on the platform constitutes financial advice, investment recommendations, or trading signals. ZB Capital S.R.L. is not a regulated investment firm under Italian TUF or EU MiFID II.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'Credit and debit cards (Visa, Mastercard, Amex) via Stripe. Apple Pay and Google Pay where available. VAT is calculated and added at checkout in accordance with EU tax law.',
                },
                {
                  q: 'What happens to my data if I cancel?',
                  a: 'Your data is retained for 30 days after the subscription ends, giving you time to reconsider. After that it is permanently deleted. You can request immediate deletion by emailing support@disapline.eu.',
                },
              ].map(({ q, a }, i) => (
                <details key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <summary style={{
                    fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 400,
                    color: '#E8E4D8', padding: '20px 0', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    letterSpacing: '-0.01em', userSelect: 'none',
                  }}>
                    {q}
                    <span style={{ position: 'relative', width: '18px', height: '18px', flexShrink: 0, marginLeft: '20px' }}>
                      <span className="faq-plus" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '16px', color: 'rgba(201,162,39,0.55)', lineHeight: 1 }}>+</span>
                      <span className="faq-minus" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '16px', color: 'rgba(201,162,39,0.55)', lineHeight: 1 }}>−</span>
                    </span>
                  </summary>
                  <p style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 300,
                    color: '#8A8578', lineHeight: 1.88, margin: '0 0 22px',
                    paddingRight: '40px', letterSpacing: '0.02em',
                  }}>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT STRIP ────────────────────────────────── */}
        <section style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'linear-gradient(180deg, rgba(201,162,39,0.025) 0%, transparent 100%)', padding: '72px 28px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(201,162,39,0.05), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A227', marginBottom: '18px', opacity: 0.7 }}>Get in touch</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#E8E4D8', marginBottom: '20px' }}>
              Questions? We&apos;re here.
            </h2>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#8A8578', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.8, letterSpacing: '0.02em' }}>
              Reach us for support, billing, or anything else.<br />We respond within 1–2 business days.
            </p>
            <a
              href="mailto:support@disapline.eu"
              className="l-magnetic"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', fontWeight: 400,
                color: '#C9A227', letterSpacing: '0.04em', textDecoration: 'none',
                border: '1px solid rgba(201,162,39,0.28)', borderRadius: '7px',
                padding: '14px 28px',
                background: 'rgba(201,162,39,0.05)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <span style={{ opacity: 0.7, fontSize: '11px' }}>✉</span>
              support@disapline.eu
            </a>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 400, color: '#E8E4D8' }}>
              DIS<span style={{ color: '#C9A227' }}>A</span>pline
            </span>
            <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
              <Link href="/login" className="l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#4A4640', textDecoration: 'none', display: 'inline-block' }}>Sign in</Link>
              <Link href="/signup" className="l-magnetic" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#4A4640', textDecoration: 'none', display: 'inline-block' }}>Sign up</Link>
              <a href="mailto:support@disapline.eu" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: 'rgba(201,162,39,0.55)', textDecoration: 'none', display: 'inline-block', letterSpacing: '0.02em' }}>support@disapline.eu</a>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.5)', letterSpacing: '0.06em' }}>© 2026 ZB Capital S.R.L.</span>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Disclosures', href: '/disclosures' },
              { label: 'Cookies', href: '/cookies' },
            ].map(({ label, href }) => (
              <Link key={href} href={href} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', letterSpacing: '0.06em', color: 'rgba(74,70,64,0.55)', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.4)', letterSpacing: '0.04em', lineHeight: 1.8, margin: 0 }}>
              ZB Capital S.R.L. · C.F. / P.IVA / N. iscr. Registro Imprese: 18314361009 · Data atto di costituzione: 20/11/2025 · Data iscrizione RI: 02/02/2016
            </p>
          </div>
        </footer>

      </div>
    </>
  )
}
