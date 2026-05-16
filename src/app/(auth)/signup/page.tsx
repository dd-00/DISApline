'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr-g)', borderRadius: '12px', padding: '36px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '10px' }}>Check your email</h2>
        <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', lineHeight: 1.7 }}>
          We sent a confirmation link to <strong style={{ color: 'var(--chalk)' }}>{email}</strong>.<br />
          Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '36px' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '6px' }}>Start your journey</h1>
      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.04em', marginBottom: '28px' }}>
        Free during beta · No credit card required
      </p>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { label: 'Full Name', type: 'text', val: name, set: setName, ph: 'Jane Doe' },
          { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@email.com' },
          { label: 'Password', type: 'password', val: password, set: setPassword, ph: '••••••••' },
        ].map(({ label, type, val, set, ph }) => (
          <div key={label}>
            <label style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{label}</label>
            <input
              type={type} value={val} onChange={e => set(e.target.value)} required placeholder={ph}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)', color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace", fontSize: '12px', fontWeight: 300, padding: '11px 14px', borderRadius: '6px', outline: 'none' }}
            />
          </div>
        ))}

        {error && (
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', color: 'var(--red)', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px' }}>
            {error}
          </p>
        )}

        <button
          type="submit" disabled={loading}
          style={{ background: 'var(--gold)', color: '#06060A', fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', textAlign: 'center', marginTop: '20px' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )
}
