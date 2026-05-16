'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '36px' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '6px' }}>Welcome back</h1>
      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.04em', marginBottom: '28px' }}>
        Sign in to your DISApline account
      </p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        <div>
          <label style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="••••••••"
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
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', textAlign: 'center', marginTop: '20px' }}>
        No account?{' '}
        <Link href="/signup" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
          Create one free
        </Link>
      </p>
    </div>
  )
}
