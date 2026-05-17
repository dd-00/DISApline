'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

async function checkout(plan: string, setLoading: (p: string | null) => void) {
  setLoading(plan)
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  if (res.status === 401) { window.location.href = '/signup?redirect=pricing'; return }
  const { url } = await res.json()
  if (url) window.location.href = url
  setLoading(null)
}

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    dollars: '$9',
    cents: '.99',
    period: '/month',
    note: 'Billed monthly — cancel any time',
    noteColor: '#4A4640',
    features: ['Full journal & analytics', 'Psychology scoring', 'Pattern detection', 'Unlimited trade entries'],
    gold: false,
    badge: null,
  },
  {
    key: 'yearly',
    label: 'Yearly',
    dollars: '$99',
    cents: '.99',
    period: '/year',
    note: 'Billed every 12 months — save 17%',
    noteColor: 'rgba(201,162,39,0.55)',
    features: ['Everything in Monthly', 'Priority support', 'Early access to new features', 'Annual performance report'],
    gold: true,
    badge: 'Most popular',
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    dollars: '$199',
    cents: '.99',
    period: 'one-time',
    note: 'Pay once, use forever',
    noteColor: '#4A4640',
    features: ['Everything in Yearly', 'All future features included', 'Lifetime priority support', 'No renewal, no surprises'],
    gold: false,
    badge: null,
  },
]

async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/'
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090B; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#09090B', color: '#E8E4D8' }}>

        {/* Nav */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(9,9,11,0.88)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 28px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 400, color: '#E8E4D8' }}>
                DIS<span style={{ color: '#C9A227' }}>A</span>pline
              </span>
            </Link>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link href="/dashboard" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#4A4640', textDecoration: 'none', letterSpacing: '0.06em' }}>
                Dashboard
              </Link>
              <button onClick={signOut} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#4A4640', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', padding: 0 }}>
                Sign out
              </button>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header style={{ textAlign: 'center', padding: '80px 28px 64px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(201,162,39,0.65)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Simple pricing
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 300, color: '#E8E4D8', lineHeight: 1.04, letterSpacing: '-0.025em', marginBottom: '16px' }}>
            Your edge is<br /><em style={{ color: '#C9A227' }}>already inside you.</em>
          </h1>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 300, color: '#4A4640', letterSpacing: '0.04em' }}>
            One tool. No fluff. Built for traders who take the inner game seriously.
          </p>
        </header>

        {/* Cards */}
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 28px 96px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                style={{
                  borderRadius: '12px',
                  background: plan.gold ? 'rgba(201,162,39,0.04)' : '#111113',
                  border: plan.gold ? '1px solid rgba(201,162,39,0.28)' : '1px solid rgba(255,255,255,0.06)',
                  padding: '36px 32px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: '#C9A227', color: '#09090B', fontFamily: "'IBM Plex Mono', monospace", fontSize: '8.5px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 14px', borderRadius: '0 0 8px 8px' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: plan.gold ? 'rgba(201,162,39,0.7)' : '#4A4640', marginBottom: '20px' }}>
                  {plan.label}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '54px', fontWeight: 300, color: '#E8E4D8', lineHeight: 1, letterSpacing: '-0.03em' }}>{plan.dollars}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 300, color: '#8A8578' }}>{plan.cents}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', marginLeft: '4px' }}>{plan.period}</span>
                </div>

                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: plan.noteColor, marginBottom: '28px', letterSpacing: '0.04em' }}>
                  {plan.note}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10.5px', color: '#8A8578', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#C9A227', fontSize: '8px' }}>✦</span>{f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => checkout(plan.key, setLoadingPlan)}
                  disabled={loadingPlan === plan.key}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: plan.gold ? '#09090B' : '#8A8578',
                    padding: plan.gold ? '13px 0' : '12px 0',
                    borderRadius: '6px',
                    border: plan.gold ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    background: plan.gold ? '#C9A227' : 'transparent',
                    textAlign: 'center',
                    display: 'block',
                    width: '100%',
                    cursor: loadingPlan === plan.key ? 'not-allowed' : 'pointer',
                    opacity: loadingPlan === plan.key ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loadingPlan === plan.key ? 'Redirecting…' : 'Add to cart'}
                </button>

                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'rgba(74,70,64,0.6)', textAlign: 'center', marginTop: '10px', letterSpacing: '0.04em' }}>
                  VAT calculated at checkout
                </div>
              </div>
            ))}
          </div>

          {/* Already subscribed link */}
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/dashboard" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#4A4640', textDecoration: 'none', letterSpacing: '0.05em' }}>
              Already subscribed? Go to dashboard →
            </Link>
          </div>
        </main>

      </div>
    </>
  )
}
