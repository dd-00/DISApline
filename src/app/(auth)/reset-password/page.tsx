'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '36px' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '6px' }}>
        New password
      </h1>
      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.04em', marginBottom: '28px' }}>
        Choose a new password for your account
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            New password
          </label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="••••••••"
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)', color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace", fontSize: '12px', fontWeight: 300, padding: '11px 14px', borderRadius: '6px', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Confirm password
          </label>
          <input
            type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
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
          {loading ? 'Updating…' : 'Set new password'}
        </button>
      </form>
    </div>
  )
}
