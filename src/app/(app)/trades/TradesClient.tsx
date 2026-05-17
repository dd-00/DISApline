'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatET } from '@/lib/et'
import { TrendingUp, TrendingDown, Plus, Search, Upload, Camera } from 'lucide-react'
import type { Trade } from '@/types'
import ImportModal from '@/components/trades/ImportModal'

const input: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)',
  color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace",
  fontSize: '11px', fontWeight: 300, padding: '9px 12px',
  borderRadius: '6px', outline: 'none',
}

export default function TradesClient({ trades: initialTrades, userId }: { trades: Trade[]; userId: string }) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState<'all' | 'long' | 'short'>('all')
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all')
  const [showImport, setShowImport] = useState(false)

  const filtered = trades.filter(t => {
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false
    if (direction !== 'all' && t.direction !== direction) return false
    if (status !== 'all' && t.status !== status) return false
    return true
  })

  const totalPnl = filtered.reduce((s, t) => s + (t.pnl ?? 0), 0)

  const pill = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none',
    background: active ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
    color: active ? 'var(--gold)' : 'var(--smoke)',
    transition: 'background 0.2s',
  })

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>Trades</h1>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
            {filtered.length} trades · P&L{' '}
            <span style={{ color: totalPnl >= 0 ? '#5DB87A' : '#E05C5C' }}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowImport(true)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'transparent', color: 'var(--smoke)',
            fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 400,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '10px 16px', borderRadius: '7px', border: '1px solid var(--bdr)', cursor: 'pointer',
          }}>
            <Upload size={14} />
            Import
          </button>
          <Link href="/trades/new" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--gold)', color: '#06060A',
            fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
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

      {/* Filters */}
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

      {/* Table */}
      <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr', padding: '12px 20px', borderBottom: '1px solid var(--bdr)' }}>
          {['Symbol', 'Direction', 'Asset', 'Entry', 'Status', 'P&L'].map(h => (
            <span key={h} style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '16px' }}>No trades found.</p>
            <Link href="/trades/new" style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--gold)', textDecoration: 'none' }}>
              Log your first trade →
            </Link>
          </div>
        ) : filtered.map((t, i) => {
          const pnl = t.pnl ?? 0
          return (
            <Link key={t.id} href={`/trades/${t.id}`} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
              padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--bdr)' : 'none',
              textDecoration: 'none', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {pnl >= 0 ? <TrendingUp size={13} color="#5DB87A" /> : <TrendingDown size={13} color="#E05C5C" />}
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 400, color: 'var(--chalk)' }}>{t.symbol}</span>
                {t.screenshot_url && <Camera size={10} color="var(--smoke)" />}
              </div>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: t.direction === 'long' ? '#5DB87A' : '#E05C5C', alignSelf: 'center' }}>{t.direction}</span>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', alignSelf: 'center' }}>{t.asset_class}</span>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', alignSelf: 'center' }}>
                {t.entry_at ? formatET(t.entry_at, 'short') : '—'}
              </span>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, alignSelf: 'center', color: t.status === 'open' ? 'var(--gold)' : 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.status}
              </span>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 400, alignSelf: 'center', color: pnl >= 0 ? '#5DB87A' : '#E05C5C' }}>
                {t.status === 'open' ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)}`}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
