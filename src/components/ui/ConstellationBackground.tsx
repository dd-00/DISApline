'use client'

import { useEffect, useRef } from 'react'

interface Star { x: number; y: number; r: number; phase: number; speed: number; driftX: number; driftY: number; driftSpeed: number }

export default function ConstellationBackground() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const starsRef    = useRef<Star[]>([])
  const mouseConst  = useRef({ x: -2000, y: -2000 })

  useEffect(() => {
    const W = window.innerWidth
    const H = window.innerHeight

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
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    const LINK_DIST = 145
    const GLOW_DIST = 190

    let raf: number
    function draw() {
      const now  = performance.now() / 1000
      const mx   = mouseConst.current.x
      const my   = mouseConst.current.y
      const stars = starsRef.current
      ctx.clearRect(0, 0, W, H)

      const px = stars.map(s => s.x + Math.sin(now * s.driftSpeed + s.driftX) * 14)
      const py = stars.map(s => s.y + Math.cos(now * s.driftSpeed * 0.8 + s.driftY) * 10)

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dist = Math.hypot(px[i] - px[j], py[i] - py[j])
          if (dist > LINK_DIST) continue
          const midX = (px[i] + px[j]) / 2
          const midY = (py[i] + py[j]) / 2
          const prox = Math.max(0, 1 - Math.hypot(midX - mx, midY - my) / GLOW_DIST)
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

      for (let k = 0; k < stars.length; k++) {
        const s = stars[k]
        const sx = px[k], sy = py[k]
        const prox = Math.max(0, 1 - Math.hypot(sx - mx, sy - my) / GLOW_DIST)
        const twinkle = Math.sin(now * s.speed + s.phase) * 0.5 + 0.5

        if (prox > 0) {
          const glowR = s.r + prox * 8
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR)
          g.addColorStop(0, `rgba(201,162,39,${prox * 0.14})`)
          g.addColorStop(1, 'rgba(201,162,39,0)')
          ctx.beginPath()
          ctx.arc(sx, sy, glowR, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()
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
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onMove = (e: MouseEvent) => { mouseConst.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
