'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '36px' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '6px' }}>
        Reset password
      </h1>
      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.04em', marginBottom: '28px' }}>
        Enter your email and we'll send you a reset link
      </p>

      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '20px', lineHeight: 1.7 }}>
            Check your inbox — we sent a reset link to<br />
            <span style={{ color: 'var(--gold)' }}>{email}</span>
          </div>
          <Link href="/login" style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', color: 'var(--gold)', textDecoration: 'none' }}>
            Back to sign in →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@email.com"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)', color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace", fontSize: '12px', fontWeight: 300, padding: '11px 14px', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          {error && (
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', color: 'var(--red)', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px' }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            style={{ background: 'var(--gold)', color: '#06060A', fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', textAlign: 'center', marginTop: '4px' }}>
            Remember it?{' '}
            <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
