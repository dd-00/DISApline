'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatET } from '@/lib/et'
import { TrendingUp, TrendingDown, Plus, Search, Upload, Camera, Trash2 } from 'lucide-react'
import type { Trade } from '@/types'
import ImportModal from '@/components/trades/ImportModal'
import { createClient } from '@/lib/supabase/client'

const input: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)',
  color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace",
  fontSize: '11px', fontWeight: 300, padding: '9px 12px',
  borderRadius: '6px', outline: 'none',
}

const mono: React.CSSProperties = { fontFamily: "'Martian Mono', monospace" }

export default function TradesClient({ trades: initialTrades, userId }: { trades: Trade[]; userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [trades, setTrades]           = useState<Trade[]>(initialTrades)
  const [search, setSearch]           = useState('')
  const [direction, setDirection]     = useState<'all' | 'long' | 'short'>('all')
  const [status, setStatus]           = useState<'all' | 'open' | 'closed'>('all')
  const [showImport, setShowImport]   = useState(false)
  const [confirmId, setConfirmId]     = useState<string | null>(null)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearInput, setClearInput]   = useState('')
  const [clearLoading, setClearLoading] = useState(false)

  const filtered = trades.filter(t => {
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false
    if (direction !== 'all' && t.direction !== direction) return false
    if (status !== 'all' && t.status !== status) return false
    return true
  })

  const totalPnl = filtered.reduce((s, t) => s + (t.pnl ?? 0), 0)

  const pill = (active: boolean): React.CSSProperties => ({
    ...mono, fontSize: '9.5px', fontWeight: 300,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none',
    background: active ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
    color: active ? 'var(--gold)' : 'var(--smoke)',
    transition: 'background 0.2s',
  })

  async function deleteTrade(id: string) {
    await supabase.from('trades').delete().eq('id', id).eq('user_id', userId)
    setTrades(prev => prev.filter(t => t.id !== id))
    setConfirmId(null)
    router.refresh()
  }

  async function clearAllTrades() {
    if (clearInput !== 'DELETE') return
    setClearLoading(true)
    await supabase.from('trades').delete().eq('user_id', userId)
    await supabase.from('psych_scores').delete().eq('user_id', userId)
    setTrades([])
    setClearLoading(false)
    setShowClearModal(false)
    setClearInput('')
    router.refresh()
  }

  const COLS = '2fr 1fr 1fr 1fr 1fr 1.2fr 40px'

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px' }} onClick={() => setConfirmId(null)}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>Trades</h1>
          <p style={{ ...mono, fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
            {filtered.length} trades · P&L{' '}
            <span style={{ color: totalPnl >= 0 ? '#5DB87A' : '#E05C5C' }}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {trades.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setShowClearModal(true) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'transparent', color: '#E05C5C',
                ...mono, fontSize: '10.5px', fontWeight: 400,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '10px 16px', borderRadius: '7px',
                border: '1px solid rgba(224,92,92,0.25)', cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              Clear all
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); setShowImport(true) }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'transparent', color: 'var(--smoke)',
              ...mono, fontSize: '10.5px', fontWeight: 400,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '10px 16px', borderRadius: '7px', border: '1px solid var(--bdr)', cursor: 'pointer',
            }}
          >
            <Upload size={14} />
            Import
          </button>
          <Link href="/trades/new" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--gold)', color: '#06060A',
            ...mono, fontSize: '10.5px', fontWeight: 500,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '10px 18px', borderRadius: '7px', textDecoration: 'none',
          }}>
            <Plus size={14} />
            New Trade
          </Link>
        </div>

        {showImport && (
          <ImportModal
            userId={userId}
            onClose={() => setShowImport(false)}
            onImported={() => { setShowImport(false); window.location.reload() }}
          />
        )}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
          <Search size={13} color="var(--smoke)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbol…" style={{ ...input, paddingLeft: '32px', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'long', 'short'] as const).map(d => (
            <button key={d} onClick={() => setDirection(d)} style={pill(direction === d)}>{d}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'open', 'closed'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)} style={pill(status === s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '12px 20px', borderBottom: '1px solid var(--bdr)' }}>
          {['Symbol', 'Direction', 'Asset', 'Entry', 'Status', 'P&L', ''].map(h => (
            <span key={h} style={{ ...mono, fontSize: '9px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ ...mono, fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '16px' }}>No trades found.</p>
            <Link href="/trades/new" style={{ ...mono, fontSize: '10px', color: 'var(--gold)', textDecoration: 'none' }}>
              Log your first trade →
            </Link>
          </div>
        ) : filtered.map((t, i) => {
          const pnl       = t.pnl ?? 0
          const isConfirm = confirmId === t.id

          return (
            <div
              key={t.id}
              style={{
                display: 'grid', gridTemplateColumns: COLS,
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--bdr)' : 'none',
                transition: 'background 0.15s',
                background: isConfirm ? 'rgba(224,92,92,0.04)' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!isConfirm) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              onMouseLeave={e => { if (!isConfirm) e.currentTarget.style.background = 'transparent' }}
              onClick={() => { if (!isConfirm) router.push(`/trades/${t.id}`) }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {pnl >= 0 ? <TrendingUp size={13} color="#5DB87A" /> : <TrendingDown size={13} color="#E05C5C" />}
                <span style={{ ...mono, fontSize: '10.5px', fontWeight: 400, color: 'var(--chalk)' }}>{t.symbol}</span>
                {t.screenshot_url && <Camera size={10} color="var(--smoke)" />}
              </div>
              <span style={{ ...mono, fontSize: '10px', fontWeight: 300, color: t.direction === 'long' ? '#5DB87A' : '#E05C5C', alignSelf: 'center' }}>{t.direction}</span>
              <span style={{ ...mono, fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', alignSelf: 'center' }}>{t.asset_class}</span>
              <span style={{ ...mono, fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', alignSelf: 'center' }}>
                {t.entry_at ? formatET(t.entry_at, 'short') : '—'}
              </span>
              <span style={{ ...mono, fontSize: '9.5px', fontWeight: 300, alignSelf: 'center', color: t.status === 'open' ? 'var(--gold)' : 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.status}
              </span>
              <span style={{ ...mono, fontSize: '10.5px', fontWeight: 400, alignSelf: 'center', color: pnl >= 0 ? '#5DB87A' : '#E05C5C' }}>
                {t.status === 'open' ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)}`}
              </span>

              {/* Delete column */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                {isConfirm ? (
                  <button
                    onClick={() => deleteTrade(t.id)}
                    title="Confirm delete"
                    style={{
                      background: '#E05C5C', border: 'none', borderRadius: '4px',
                      color: '#fff', ...mono, fontSize: '9px', fontWeight: 500,
                      padding: '3px 7px', cursor: 'pointer', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Delete?
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmId(t.id)}
                    title="Delete trade"
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'rgba(224,92,92,0)', cursor: 'pointer', padding: '4px',
                      borderRadius: '4px', display: 'flex', alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(224,92,92,0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(224,92,92,0)')}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Clear All Modal ── */}
      {showClearModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => { setShowClearModal(false); setClearInput('') }}
        >
          <div
            style={{ background: 'var(--bg-el)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '440px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(224,92,92,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={16} color="#E05C5C" />
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: 'var(--chalk)', margin: 0 }}>Erase all trade history</h2>
            </div>

            <p style={{ ...mono, fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', lineHeight: 1.8, marginBottom: '8px' }}>
              This will permanently delete <strong style={{ color: 'var(--chalk)' }}>all {trades.length} trades</strong> and their associated check-ins, psychology scores, and patterns. This cannot be undone.
            </p>
            <p style={{ ...mono, fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', lineHeight: 1.8, marginBottom: '20px' }}>
              All metrics — equity curve, win rate, psychology scores — will reset to zero.
            </p>

            <label style={{ ...mono, fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Type <strong style={{ color: '#E05C5C' }}>DELETE</strong> to confirm
            </label>
            <input
              value={clearInput}
              onChange={e => setClearInput(e.target.value)}
              placeholder="DELETE"
              style={{ ...input, width: '100%', marginBottom: '20px', borderColor: clearInput === 'DELETE' ? 'rgba(224,92,92,0.5)' : 'var(--bdr)' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowClearModal(false); setClearInput('') }}
                style={{ flex: 1, ...mono, fontSize: '10.5px', color: 'var(--smoke)', background: 'transparent', border: '1px solid var(--bdr)', borderRadius: '6px', padding: '11px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={clearAllTrades}
                disabled={clearInput !== 'DELETE' || clearLoading}
                style={{
                  flex: 2, ...mono, fontSize: '10.5px', fontWeight: 500,
                  color: '#fff', background: clearInput === 'DELETE' ? '#E05C5C' : 'rgba(224,92,92,0.2)',
                  border: 'none', borderRadius: '6px', padding: '11px',
                  cursor: clearInput === 'DELETE' ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                }}
              >
                {clearLoading ? 'Deleting…' : 'Erase all trades'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
