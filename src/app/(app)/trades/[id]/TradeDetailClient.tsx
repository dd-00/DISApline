'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { nowET, etInputToISO, formatET } from '@/lib/et'
import { ETTimePicker } from '@/components/ui/ETTimePicker'
import { uploadTradeChart, removeTradeChart } from './actions'
import { ArrowLeft, Camera, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Trade, CheckIn } from '@/types'

const input: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)',
  color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace",
  fontSize: '11.5px', fontWeight: 300, padding: '11px 14px',
  borderRadius: '6px', outline: 'none',
}

const lbl: React.CSSProperties = {
  display: 'block', fontFamily: "'Martian Mono', monospace",
  fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)',
  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px',
}

const BIAS_FLAGS = [
  { key: 'revenge_trade', label: 'Revenge Trade' },
  { key: 'fomo', label: 'FOMO' },
  { key: 'oversize', label: 'Oversizing' },
  { key: 'loss_aversion', label: 'Loss Aversion' },
  { key: 'anchoring', label: 'Anchoring' },
]

export default function TradeDetailClient({ trade, checkIns }: { trade: Trade; checkIns: CheckIn[] }) {
  const router = useRouter()
  const supabase = createClient()

  const preCheckIn = checkIns.find(c => c.type === 'pre')
  const postCheckIn = checkIns.find(c => c.type === 'post')

  const [closing, setClosing] = useState(false)
  const [exitPrice, setExitPrice] = useState('')
  const [exitTime, setExitTime] = useState('')
  useEffect(() => { setExitTime(nowET()) }, [])
  const [mood, setMood] = useState(3)
  const [confidence, setConfidence] = useState(3)
  const [stress, setStress] = useState(3)
  const [focus, setFocus] = useState(3)
  const [followedRules, setFollowedRules] = useState<boolean | null>(null)
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [lesson, setLesson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [whatWorked, setWhatWorked] = useState('')
  const [whatToImprove, setWhatToImprove] = useState('')
  const [biggestDistraction, setBiggestDistraction] = useState('')
  const [slHit, setSlHit] = useState(false)
  const [manualPnl, setManualPnl] = useState(false)
  const [manualPnlAmount, setManualPnlAmount] = useState('')
  const [pnlSign, setPnlSign] = useState<'profit' | 'loss'>('profit')
  const [chartUrl, setChartUrl] = useState(trade.screenshot_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!lightbox) return
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [lightbox])

  async function uploadChart(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadTradeChart(trade.id, fd)
    if (result.error) { setError(result.error); setUploading(false); return }
    setChartUrl(result.url!)
    setUploading(false)
    e.target.value = ''
  }

  async function removeChart() {
    const result = await removeTradeChart(trade.id)
    if (result.error) { setError(result.error); return }
    setChartUrl('')
  }

  async function deleteTrade() {
    await supabase.from('trades').delete().eq('id', trade.id)
    router.push('/trades')
    router.refresh()
  }

  async function closeTrade() {
    if (manualPnl) {
      if (!manualPnlAmount) { setError('Enter a P&L amount'); return }
    } else {
      if (!exitPrice) { setError('Exit price required'); return }
    }
    setLoading(true)
    setError('')

    const pnl = manualPnl
      ? (pnlSign === 'profit' ? 1 : -1) * Math.abs(parseFloat(manualPnlAmount))
      : (() => {
          const ep = parseFloat(exitPrice)
          const qty = trade.quantity ?? 1
          const pv = trade.point_value ?? 1
          return trade.direction === 'long'
            ? (ep - trade.entry_price) * qty * pv
            : (trade.entry_price - ep) * qty * pv
        })()

    const { error: updateErr } = await supabase.from('trades').update({
      exit_price: manualPnl ? null : parseFloat(exitPrice),
      exit_at: etInputToISO(exitTime),
      pnl,
      status: 'closed',
    }).eq('id', trade.id)

    if (updateErr) { setError(updateErr.message); setLoading(false); return }

    await supabase.from('check_ins').insert({
      user_id: trade.user_id,
      trade_id: trade.id,
      type: 'post',
      mood,
      confidence,
      stress,
      focus,
      followed_rules: followedRules,
      flags: selectedFlags,
      lesson: lesson.trim() || null,
      what_worked: whatWorked.trim() || null,
      what_to_improve: whatToImprove.trim() || null,
      biggest_distraction: biggestDistraction.trim() || null,
    })

    router.push('/trades')
    router.refresh()
  }

  const toggleFlag = (key: string) => {
    setSelectedFlags(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])
  }

  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300,
    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', border: 'none',
    background: active ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.04)',
    color: active ? 'var(--gold)' : 'var(--smoke)', transition: 'all 0.15s',
  })

  const SliderField = ({ label: l, value, set }: { label: string; value: number; set: (v: number) => void }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={lbl}>{l}</label>
        <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--chalk)' }}>{value}/5</span>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--gold)' }} />
    </div>
  )

  const pnl = trade.pnl ?? 0

  return (
    <div style={{ padding: '40px 48px', maxWidth: '800px' }}>
      <Link href="/trades" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px', textDecoration: 'none', color: 'var(--smoke)', fontFamily: "'Martian Mono', monospace", fontSize: '10px' }}>
        <ArrowLeft size={13} />
        Back to Trades
      </Link>

      {/* Trade header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: 'var(--chalk)' }}>
              {trade.symbol}
            </h1>
            <span style={{
              fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300,
              color: trade.direction === 'long' ? '#5DB87A' : '#E05C5C',
              padding: '4px 10px', borderRadius: '4px',
              background: trade.direction === 'long' ? 'rgba(93,184,122,0.1)' : 'rgba(224,92,92,0.1)',
              border: `1px solid ${trade.direction === 'long' ? 'rgba(93,184,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{trade.direction}</span>
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {trade.asset_class}
            </span>
          </div>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)' }}>
            {trade.entry_at ? formatET(trade.entry_at) : '—'}
            {trade.status === 'closed' && trade.pnl !== null && (
              <span style={{ marginLeft: '16px', color: pnl >= 0 ? '#5DB87A' : '#E05C5C', fontWeight: 400 }}>
                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {trade.status === 'open' && !closing && (
            <button onClick={() => setClosing(true)} style={{
              background: 'rgba(93,184,122,0.1)', border: '1px solid rgba(93,184,122,0.25)',
              color: '#5DB87A', fontFamily: "'Martian Mono', monospace", fontSize: '10px',
              fontWeight: 300, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '9px 16px', borderRadius: '7px', cursor: 'pointer',
            }}>
              Close Trade
            </button>
          )}
          {confirmDelete ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)' }}>Sure?</span>
              <button onClick={deleteTrade} style={{
                background: '#E05C5C', border: 'none', color: '#fff',
                fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '9px 16px', borderRadius: '7px', cursor: 'pointer',
              }}>Delete</button>
              <button onClick={() => setConfirmDelete(false)} style={{
                background: 'transparent', border: '1px solid var(--bdr)', color: 'var(--smoke)',
                fontFamily: "'Martian Mono', monospace", fontSize: '10px',
                padding: '9px 12px', borderRadius: '7px', cursor: 'pointer',
              }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: '1px solid rgba(224,92,92,0.25)',
              color: '#E05C5C', fontFamily: "'Martian Mono', monospace", fontSize: '10px',
              fontWeight: 300, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '9px 14px', borderRadius: '7px', cursor: 'pointer',
            }}>
              <Trash2 size={13} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Trade details */}
      {(() => {
        const sl = trade.stop_loss
        const ep = trade.exit_price
        const rr = sl != null && ep != null
          ? (() => {
              const risk = Math.abs(trade.entry_price - sl)
              const reward = Math.abs(ep - trade.entry_price)
              return risk > 0 ? (reward / risk).toFixed(2) + 'R' : '—'
            })()
          : '—'
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Entry', value: trade.entry_price != null ? `$${trade.entry_price}` : '—' },
              { label: 'Stop Loss', value: sl != null ? `$${sl}` : '—' },
              { label: 'Exit', value: ep != null ? `$${ep}` : '—' },
              { label: 'Quantity', value: trade.quantity != null ? String(trade.quantity) : '—' },
              { label: 'R:R', value: rr },
              { label: 'Status', value: trade.status },
            ].map(({ label: l, value }) => (
              <div key={l} style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{l}</div>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '13px', fontWeight: 400, color: 'var(--chalk)' }}>{value}</div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Chart */}
      <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: chartUrl ? '16px' : '0' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Chart Screenshot
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {chartUrl && (
              <button onClick={removeChart} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)',
                color: '#E05C5C', fontFamily: "'Martian Mono', monospace", fontSize: '9px',
                padding: '5px 10px', borderRadius: '5px', cursor: 'pointer',
              }}>
                <X size={10} /> Remove
              </button>
            )}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)',
              color: 'var(--gold)', fontFamily: "'Martian Mono', monospace", fontSize: '9px',
              padding: '5px 12px', borderRadius: '5px',
            }}>
              <Camera size={11} />
              {uploading ? 'Uploading…' : chartUrl ? 'Replace' : 'Upload Chart'}
              <input type="file" accept="image/*" onChange={uploadChart} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>
        {chartUrl ? (
          <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setLightbox(true)}>
            <img src={chartUrl} alt="Trade chart" style={{ width: '100%', borderRadius: '6px', display: 'block', maxHeight: '480px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)' }} />
            <div style={{
              position: 'absolute', bottom: '10px', right: '10px',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '5px', padding: '4px 10px',
              fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.06em', pointerEvents: 'none',
            }}>
              Click to expand
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)', marginTop: '12px' }}>
            No chart attached. Upload a screenshot to study this trade later.
          </p>
        )}

        {/* Lightbox */}
        {lightbox && chartUrl && (
          <div
            onClick={() => setLightbox(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-out', padding: '24px',
            }}
          >
            <button
              onClick={() => setLightbox(false)}
              style={{
                position: 'absolute', top: '20px', right: '24px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)', borderRadius: '6px',
                padding: '6px 14px', cursor: 'pointer',
                fontFamily: "'Martian Mono', monospace", fontSize: '9px', letterSpacing: '0.06em',
              }}
            >
              ESC to close
            </button>
            <img
              src={chartUrl}
              alt="Trade chart"
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '100%', maxHeight: '90vh',
                objectFit: 'contain', borderRadius: '8px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                cursor: 'default',
              }}
            />
          </div>
        )}
      </div>

      {trade.setup && (
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Setup / Thesis</div>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7 }}>{trade.setup}</p>
        </div>
      )}

      {/* Pre check-in display */}
      {preCheckIn && (
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Pre-Trade State
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
            {[
              { label: 'Mood', value: preCheckIn.mood },
              { label: 'Confidence', value: preCheckIn.confidence },
              { label: 'Stress', value: preCheckIn.stress },
              { label: 'Focus', value: preCheckIn.focus },
            ].map(({ label: l, value }) => (
              <div key={l}>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{l}</div>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '14px', color: 'var(--chalk)' }}>{value}/5</div>
              </div>
            ))}
          </div>
          {preCheckIn.flags && preCheckIn.flags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {preCheckIn.flags.map(f => (
                <span key={f} style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(200,80,80,0.1)', color: '#E05C5C', border: '1px solid rgba(200,80,80,0.2)' }}>
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post check-in display */}
      {postCheckIn && (
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Post-Trade Reflection
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
            {[
              { label: 'Mood', value: postCheckIn.mood },
              { label: 'Confidence', value: postCheckIn.confidence },
              { label: 'Stress', value: postCheckIn.stress },
              { label: 'Focus', value: postCheckIn.focus },
            ].map(({ label: l, value }) => (
              <div key={l}>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{l}</div>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '14px', color: 'var(--chalk)' }}>{value}/5</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--smoke)', letterSpacing: '0.06em' }}>Rules followed:</span>
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: postCheckIn.followed_rules ? '#5DB87A' : '#E05C5C' }}>
              {postCheckIn.followed_rules === null ? '—' : postCheckIn.followed_rules ? 'Yes' : 'No'}
            </span>
          </div>
          {(postCheckIn.lesson || postCheckIn.what_worked || postCheckIn.what_to_improve || postCheckIn.biggest_distraction) && (
            <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {postCheckIn.lesson && (
                <div>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Lesson</div>
                  <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7, margin: 0 }}>{postCheckIn.lesson}</p>
                </div>
              )}
              {postCheckIn.what_worked && (
                <div>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: '#5DB87A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>What Worked</div>
                  <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7, margin: 0 }}>{postCheckIn.what_worked}</p>
                </div>
              )}
              {postCheckIn.what_to_improve && (
                <div>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: '#C9A227', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>To Improve</div>
                  <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7, margin: 0 }}>{postCheckIn.what_to_improve}</p>
                </div>
              )}
              {postCheckIn.biggest_distraction && (
                <div>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: '#E05C5C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Biggest Distraction</div>
                  <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7, margin: 0 }}>{postCheckIn.biggest_distraction}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Close trade form */}
      {closing && trade.status === 'open' && (
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr-g)', borderRadius: '10px', padding: '28px 32px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '24px' }}>
            Close Trade + Post-Trade Reflection
          </h2>

          {error && (
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', color: 'var(--red)', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Stop loss hit toggle — only shown if stop loss was set */}
            {trade.stop_loss != null && (
              <button
                onClick={() => {
                  const next = !slHit
                  setSlHit(next)
                  setExitPrice(next ? String(trade.stop_loss) : '')
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                  background: slHit ? 'rgba(224,92,92,0.1)' : 'rgba(255,255,255,0.03)',
                  outline: slHit ? '1px solid rgba(224,92,92,0.35)' : '1px solid var(--bdr)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 400, color: slHit ? '#E05C5C' : 'var(--chalk)', letterSpacing: '0.04em' }}>
                    Stop Loss Hit
                  </div>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', marginTop: '3px' }}>
                    Exit at SL ${trade.stop_loss} · loss auto-calculated
                  </div>
                </div>
                <div style={{
                  width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
                  background: slHit ? '#E05C5C' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: slHit ? '19px' : '3px',
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                  }} />
                </div>
              </button>
            )}

            {/* Manual P&L toggle */}
            <button
              onClick={() => {
                const next = !manualPnl
                setManualPnl(next)
                if (next) { setSlHit(false); setExitPrice('') }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                background: manualPnl ? 'rgba(126,184,232,0.08)' : 'rgba(255,255,255,0.03)',
                outline: manualPnl ? '1px solid rgba(126,184,232,0.3)' : '1px solid var(--bdr)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 400, color: manualPnl ? '#7EB8E8' : 'var(--chalk)', letterSpacing: '0.04em' }}>
                  Enter P&L Directly
                </div>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', marginTop: '3px' }}>
                  Skip exit price — type your profit or loss amount
                </div>
              </div>
              <div style={{
                width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
                background: manualPnl ? '#7EB8E8' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: manualPnl ? '19px' : '3px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </div>
            </button>

            {/* Manual P&L input */}
            {manualPnl ? (
              <div>
                <label style={lbl}>Profit / Loss Amount</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['profit', 'loss'] as const).map(s => (
                    <button key={s} onClick={() => setPnlSign(s)} style={{
                      flex: 1, padding: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none',
                      fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: pnlSign === s
                        ? s === 'profit' ? 'rgba(93,184,122,0.15)' : 'rgba(224,92,92,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      color: pnlSign === s
                        ? s === 'profit' ? '#5DB87A' : '#E05C5C'
                        : 'var(--smoke)',
                      outline: pnlSign === s
                        ? `1px solid ${s === 'profit' ? 'rgba(93,184,122,0.3)' : 'rgba(224,92,92,0.3)'}`
                        : '1px solid var(--bdr)',
                    }}>{s}</button>
                  ))}
                </div>
                <div style={{ marginTop: '8px', position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    fontFamily: "'Martian Mono', monospace", fontSize: '12px',
                    color: pnlSign === 'profit' ? '#5DB87A' : '#E05C5C',
                  }}>{pnlSign === 'profit' ? '+' : '−'}</span>
                  <input
                    type="number"
                    value={manualPnlAmount}
                    onChange={e => setManualPnlAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ ...input, paddingLeft: '28px', color: pnlSign === 'profit' ? '#5DB87A' : '#E05C5C' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={lbl}>Exit Price *{slHit ? ' — Stop Loss' : ''}</label>
                  <input
                    type="number"
                    value={exitPrice}
                    onChange={e => { if (!slHit) setExitPrice(e.target.value) }}
                    placeholder="0.00"
                    readOnly={slHit}
                    style={{ ...input, opacity: slHit ? 0.6 : 1, cursor: slHit ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div>
                  <label style={lbl}>Exit Time (New York ET)</label>
                  <ETTimePicker value={exitTime} onChange={setExitTime} />
                </div>
              </div>
            )}

            {/* Exit time when in manual P&L mode */}
            {manualPnl && (
              <div>
                <label style={lbl}>Exit Time (New York ET)</label>
                <ETTimePicker value={exitTime} onChange={setExitTime} />
              </div>
            )}

            {/* Live P&L preview */}
            {exitPrice && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)' }}>
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--smoke)', letterSpacing: '0.06em' }}>
                  Estimated P&L
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: (() => {
                  const ep = parseFloat(exitPrice)
                  const pv = trade.point_value ?? 1
                  const est = trade.direction === 'long'
                    ? (ep - trade.entry_price) * trade.quantity * pv
                    : (trade.entry_price - ep) * trade.quantity * pv
                  return est >= 0 ? '#5DB87A' : '#E05C5C'
                })() }}>
                  {(() => {
                    const ep = parseFloat(exitPrice)
                    const pv = trade.point_value ?? 1
                    const est = trade.direction === 'long'
                      ? (ep - trade.entry_price) * trade.quantity * pv
                      : (trade.entry_price - ep) * trade.quantity * pv
                    return `${est >= 0 ? '+' : ''}$${est.toFixed(2)}`
                  })()}
                </span>
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)' }}>
                  ({trade.quantity} × {trade.point_value ?? 1}pt value)
                </span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: '20px' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '16px', letterSpacing: '0.06em' }}>
                POST-TRADE PSYCHOLOGY
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <SliderField label="Mood" value={mood} set={setMood} />
                <SliderField label="Confidence" value={confidence} set={setConfidence} />
                <SliderField label="Stress Level" value={stress} set={setStress} />
                <SliderField label="Focus" value={focus} set={setFocus} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ ...lbl, marginBottom: '10px' }}>Did you follow your trading rules?</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }, { val: null, label: 'Partially' }].map(({ val, label: l }) => (
                    <button key={l} onClick={() => setFollowedRules(val as boolean | null)} style={{
                      ...chip(followedRules === val), padding: '9px 18px', borderRadius: '6px',
                      border: followedRules === val ? '1px solid rgba(201,162,39,0.4)' : '1px solid var(--bdr)',
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ ...lbl, marginBottom: '10px' }}>Bias / Emotional Flags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {BIAS_FLAGS.map(f => (
                    <button key={f.key} onClick={() => toggleFlag(f.key)} style={chip(selectedFlags.includes(f.key))}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>Lesson Learned</label>
                <textarea value={lesson} onChange={e => setLesson(e.target.value)} rows={3}
                  placeholder="What did this trade teach you?"
                  style={{ ...input, resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: '20px' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '16px', letterSpacing: '0.06em' }}>
                DEEP REFLECTION
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={lbl}>What Worked</label>
                  <textarea value={whatWorked} onChange={e => setWhatWorked(e.target.value)} rows={2}
                    placeholder="What did you execute well in this trade?"
                    style={{ ...input, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={lbl}>What to Improve</label>
                  <textarea value={whatToImprove} onChange={e => setWhatToImprove(e.target.value)} rows={2}
                    placeholder="What would you do differently next time?"
                    style={{ ...input, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={lbl}>Biggest Distraction</label>
                  <input type="text" value={biggestDistraction} onChange={e => setBiggestDistraction(e.target.value)}
                    placeholder="What pulled your focus away?"
                    style={input} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setClosing(false)} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', color: 'var(--smoke)',
                fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300,
                padding: '13px', borderRadius: '6px', border: '1px solid var(--bdr)', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={closeTrade} disabled={loading} style={{
                flex: 2, background: '#5DB87A', color: '#06060A',
                fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Closing…' : 'Close Trade & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
