'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AssetClass } from '@/types'
import { MoodPicker, type MoodKey } from '@/components/ui/MoodFace'
import { ETTimePicker } from '@/components/ui/ETTimePicker'
import { nowET, etInputToISO } from '@/lib/et'

const input: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)',
  color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace",
  fontSize: '11.5px', fontWeight: 300, padding: '11px 14px',
  borderRadius: '6px', outline: 'none',
}

const label: React.CSSProperties = {
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

export default function NewTradePage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<'trade' | 'checkin'>('trade')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Trade fields
  const [symbol, setSymbol] = useState('')
  const [direction, setDirection] = useState<'long' | 'short'>('long')
  const [assetClass, setAssetClass] = useState<AssetClass>('stocks')
  const [entryPrice, setEntryPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [pointValue, setPointValue] = useState('1')
  const [stopLoss, setStopLoss] = useState('')
  const [setup, setSetup] = useState('')
  const [entryTime, setEntryTime] = useState('')
  useEffect(() => { setEntryTime(nowET()) }, [])

  // Pre-check-in fields
  const [mood, setMood] = useState(3)
  const [confidence, setConfidence] = useState(3)
  const [stress, setStress] = useState(3)
  const [focus, setFocus] = useState(3)
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null)
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [reason, setReason] = useState('')

  async function handleSubmit() {
    if (!symbol.trim()) { setError('Symbol is required'); return }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: trade, error: tradeErr } = await supabase.from('trades').insert({
      user_id: user.id,
      symbol: symbol.trim().toUpperCase(),
      direction,
      asset_class: assetClass,
      entry_price: entryPrice ? parseFloat(entryPrice) : 0,
      quantity: quantity ? parseFloat(quantity) : 0,
      point_value: pointValue ? parseFloat(pointValue) : 1,
      stop_loss: stopLoss ? parseFloat(stopLoss) : null,
      setup: setup.trim() || null,
      entry_at: etInputToISO(entryTime),
      status: 'open',
    }).select().single()

    if (tradeErr) { setError(tradeErr.message); setLoading(false); return }

    await supabase.from('check_ins').insert({
      user_id: user.id,
      trade_id: trade.id,
      type: 'pre',
      mood,
      confidence,
      stress,
      focus,
      flags: [...selectedFlags, ...(selectedMood ? [selectedMood] : [])],
      reason: reason.trim() || null,
    })

    router.push(`/trades/${trade.id}`)
  }

  const SliderField = ({ label: l, value, set }: { label: string; value: number; set: (v: number) => void }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={label}>{l}</label>
        <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--chalk)' }}>{value}/5</span>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--gold)' }} />
    </div>
  )

  const toggleFlag = (key: string, arr: string[], set: (v: string[]) => void) => {
    set(arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key])
  }

  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300,
    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', border: 'none',
    background: active ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.04)',
    color: active ? 'var(--gold)' : 'var(--smoke)', transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: '40px 48px', maxWidth: '680px' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>
        {step === 'trade' ? 'Log Trade' : 'Pre-Trade Check-In'}
      </h1>
      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '32px' }}>
        {step === 'trade' ? 'Record your entry details' : 'How are you feeling before this trade?'}
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {['Trade Details', 'Psychology Check-In'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i === (step === 'trade' ? 0 : 1) ? 'var(--gold)' : i < (step === 'trade' ? 0 : 1) ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.06)',
              fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: i === (step === 'trade' ? 0 : 1) ? '#06060A' : 'var(--smoke)',
            }}>{i + 1}</div>
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: i === (step === 'trade' ? 0 : 1) ? 'var(--chalk)' : 'var(--smoke)' }}>{s}</span>
            {i < 1 && <span style={{ color: 'var(--smoke)', margin: '0 4px' }}>·</span>}
          </div>
        ))}
      </div>

      {error && (
        <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', color: 'var(--red)', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </p>
      )}

      {step === 'trade' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={label}>Symbol *</label>
              <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="AAPL, NQ, BTC…" style={input} required />
            </div>
            <div>
              <label style={label}>Direction</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['long', 'short'] as const).map(d => (
                  <button key={d} onClick={() => setDirection(d)} style={{
                    ...chip(direction === d), padding: '11px 20px', flex: 1, borderRadius: '6px',
                    border: direction === d ? '1px solid rgba(201,162,39,0.4)' : '1px solid var(--bdr)',
                  }}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={label}>Asset Class</label>
            <select value={assetClass} onChange={e => setAssetClass(e.target.value as AssetClass)} style={{ ...input }}>
              {(['stocks', 'futures', 'forex', 'crypto', 'options', 'other'] as AssetClass[]).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={label}>Entry Price</label>
              <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" style={input} />
            </div>
            <div>
              <label style={label}>Stop Loss</label>
              <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="0.00" style={input} />
            </div>
            <div>
              <label style={label}>Quantity</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" style={input} />
            </div>
            <div>
              <label style={label}>Point Value $</label>
              <input type="number" value={pointValue} onChange={e => setPointValue(e.target.value)} placeholder="1" style={input} />
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', marginTop: '4px', display: 'block' }}>
                Stocks=1 · NQ=20 · ES=50
              </span>
            </div>
          </div>

          <div>
            <label style={label}>Entry Time (New York ET)</label>
            <ETTimePicker value={entryTime} onChange={setEntryTime} />
          </div>

          <div>
            <label style={label}>Setup / Thesis</label>
            <textarea value={setup} onChange={e => setSetup(e.target.value)} rows={3} placeholder="Describe your trade setup or thesis…"
              style={{ ...input, resize: 'vertical' }} />
          </div>

          <button onClick={() => setStep('checkin')} style={{
            background: 'var(--gold)', color: '#06060A',
            fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer',
          }}>
            Next: Psychology Check-In →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SliderField label="Mood" value={mood} set={setMood} />
            <SliderField label="Confidence" value={confidence} set={setConfidence} />
            <SliderField label="Stress Level" value={stress} set={setStress} />
            <SliderField label="Focus" value={focus} set={setFocus} />
          </div>

          <div>
            <label style={{ ...label, marginBottom: '10px' }}>Current Emotional State</label>
            <MoodPicker value={selectedMood} onChange={setSelectedMood} />
          </div>

          <div>
            <label style={{ ...label, marginBottom: '10px' }}>Potential Bias Flags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {BIAS_FLAGS.map(f => (
                <button key={f.key} onClick={() => toggleFlag(f.key, selectedFlags, setSelectedFlags)} style={chip(selectedFlags.includes(f.key))}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={label}>Why are you taking this trade?</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Your reasoning…"
              style={{ ...input, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep('trade')} style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', color: 'var(--smoke)',
              fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300,
              letterSpacing: '0.06em', padding: '13px', borderRadius: '6px', border: '1px solid var(--bdr)', cursor: 'pointer',
            }}>← Back</button>
            <button onClick={handleSubmit} disabled={loading} style={{
              flex: 2, background: 'var(--gold)', color: '#06060A',
              fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Saving…' : 'Save Trade'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
