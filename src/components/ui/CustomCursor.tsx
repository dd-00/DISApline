'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouseTarget = useRef({ x: -300, y: -300 })
  const ringPos     = useRef({ x: -300, y: -300 })
  const isHover     = useRef(false)

  useEffect(() => {
    let raf: number

    function moveCursor() {
      const mx   = mouseTarget.current.x
      const my   = mouseTarget.current.y
      const lerp = isHover.current ? 0.09 : 0.12

      ringPos.current.x += (mx - ringPos.current.x) * lerp
      ringPos.current.y += (my - ringPos.current.y) * lerp

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`
      }
      if (ringRef.current) {
        const size = isHover.current ? 56 : 34
        ringRef.current.style.width  = `${size}px`
        ringRef.current.style.height = `${size}px`
        ringRef.current.style.transform = `translate(${ringPos.current.x}px,${ringPos.current.y}px) translate(-50%,-50%)`
      }
      raf = requestAnimationFrame(moveCursor)
    }
    moveCursor()

    function applyMagnetic(e: MouseEvent) {
      document.querySelectorAll<HTMLElement>('.l-magnetic').forEach(el => {
        const rect   = el.getBoundingClientRect()
        const cx     = rect.left + rect.width  / 2
        const cy     = rect.top  + rect.height / 2
        const dist   = Math.hypot(e.clientX - cx, e.clientY - cy)
        const radius = 90

        if (dist < radius) {
          const pull  = 1 - dist / radius
          const dx    = (e.clientX - cx) * pull * 0.42
          const dy    = (e.clientY - cy) * pull * 0.42
          const scale = 1 + pull * 0.08
          el.style.transform  = `translate(${dx}px,${dy}px) scale(${scale})`
          el.style.boxShadow  = `0 0 ${24 + pull * 28}px rgba(201,162,39,${0.12 + pull * 0.32})`
        } else {
          el.style.transform = 'translate(0,0) scale(1)'
          el.style.boxShadow = ''
        }
      })
    }

    const onMove = (e: MouseEvent) => {
      mouseTarget.current = { x: e.clientX, y: e.clientY }
      applyMagnetic(e)
    }
    const onOver = (e: MouseEvent) => {
      isHover.current = !!(e.target as HTMLElement).closest('a, button, input, label')
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      {/* Gold dot — exact position */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#C9A227',
        pointerEvents: 'none',
        boxShadow: '0 0 6px rgba(201,162,39,0.8)',
      }} />

      {/* Ring — lerped */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        width: '34px', height: '34px', borderRadius: '50%',
        border: '1px solid rgba(201,162,39,0.55)',
        pointerEvents: 'none',
        transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
      }} />

      {/* Magnetic + gold button styles */}
      <style>{`
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
      `}</style>
    </>
  )
}
