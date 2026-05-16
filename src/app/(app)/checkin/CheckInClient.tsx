'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DailyCheckIn } from '@/types'
import { CheckCircle2, Activity } from 'lucide-react'

interface Props {
  today: string
  existing: DailyCheckIn | null
  history: DailyCheckIn[]
  userId: string
}

const lbl: React.CSSProperties = {
  display: 'block', fontFamily: "'Martian Mono', monospace",
  fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)',
  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px',
}

const input: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)',
  color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace",
  fontSize: '11.5px', fontWeight: 300, padding: '11px 14px',
  borderRadius: '6px', outline: 'none',
}

const METRIC_COLORS: Record<string, string> = {
  overall_state: '#C9A227',
  sleep_quality: '#7EB8E8',
  stress: '#E05C5C',
  focus: '#5DB87A',
}

function SliderField({ label, value, set, color }: { label: string; value: number; set: (v: number) => void; color: string }) {
  const dots = [1, 2, 3, 4, 5]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={lbl}>{label}</label>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color }}>{value}<span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)' }}>/5</span></span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {dots.map(d => (
          <button key={d} onClick={() => set(d)} style={{
            flex: 1, height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: d <= value ? color + '33' : 'rgba(255,255,255,0.04)',
            outline: d === value ? `1px solid ${color}` : '1px solid var(--bdr)',
            transition: 'all 0.15s',
            fontFamily: "'Martian Mono', monospace", fontSize: '10px',
            color: d === value ? color : 'var(--smoke)',
          }}>{d}</button>
        ))}
      </div>
    </div>
  )
}

function MiniHistory({ history }: { history: DailyCheckIn[] }) {
  if (history.length === 0) return null
  return (
    <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px' }}>
      <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Recent Check-Ins
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map(h => {
          const overall = h.overall_state ?? 0
          const color = overall >= 4 ? '#5DB87A' : overall >= 3 ? '#C9A227' : '#E05C5C'
          return (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)', borderRadius: '7px' }}>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)', minWidth: '72px' }}>
                {h.date}
              </span>
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                {[
                  { label: 'State', value: h.overall_state, color: '#C9A227' },
                  { label: 'Sleep', value: h.sleep_quality, color: '#7EB8E8' },
                  { label: 'Stress', value: h.stress, color: '#E05C5C' },
                  { label: 'Focus', value: h.focus, color: '#5DB87A' },
                ].map(({ label, value, color: c }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '7.5px', color: 'var(--smoke)', marginBottom: '2px' }}>{label}</div>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', color: value != null ? c : 'var(--smoke)' }}>{value ?? '—'}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: h.ready_to_trade ? '#5DB87A' : '#E05C5C' }}>
                  {h.ready_to_trade ? 'Ready' : 'Not ready'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CheckInClient({ today, existing, history, userId }: Props) {
  const supabase = createClient()

  const [overallState, setOverallState] = useState(existing?.overall_state ?? 3)
  const [sleepQuality, setSleepQuality] = useState(existing?.sleep_quality ?? 3)
  const [stress, setStress] = useState(existing?.stress ?? 3)
  const [focus, setFocus] = useState(existing?.focus ?? 3)
  const [readyToTrade, setReadyToTrade] = useState(existing?.ready_to_trade ?? false)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setLoading(true)
    setSaved(false)
    setError('')
    const { error: err } = await supabase.from('daily_check_ins').upsert({
      user_id: userId,
      date: today,
      overall_state: overallState,
      sleep_quality: sleepQuality,
      stress,
      focus,
      ready_to_trade: readyToTrade,
      notes: notes.trim() || null,
    }, { onConflict: 'user_id,date' })
    if (err) setError(err.message)
    else setSaved(true)
    setLoading(false)
  }

  const overallScore = Math.round((overallState + sleepQuality + (6 - stress) + focus) / 4)
  const scoreColor = overallScore >= 4 ? '#5DB87A' : overallScore >= 3 ? '#C9A227' : '#E05C5C'

  return (
    <div style={{ padding: '40px 48px', maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Activity size={18} color="var(--gold)" />
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)' }}>
              Daily Check-In
            </h1>
          </div>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)' }}>
            {today} · How are you trading today?
          </p>
        </div>
        {existing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: 'rgba(93,184,122,0.08)', border: '1px solid rgba(93,184,122,0.2)' }}>
            <CheckCircle2 size={12} color="#5DB87A" />
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: '#5DB87A' }}>Saved today</span>
          </div>
        )}
      </div>

      {/* Score preview */}
      <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'center', minWidth: '64px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 400, color: scoreColor, lineHeight: 1 }}>{overallScore}</div>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8px', color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>Readiness</div>
        </div>
        <div style={{ flex: 1 }}>
          {[
            { label: 'Overall State', value: overallState, max: 5, color: '#C9A227' },
            { label: 'Sleep Quality', value: sleepQuality, max: 5, color: '#7EB8E8' },
            { label: 'Stress (inv.)', value: 6 - stress, max: 5, color: '#E05C5C' },
            { label: 'Focus', value: focus, max: 5, color: '#5DB87A' },
          ].map(({ label, value, color: c }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8px', color: 'var(--smoke)', minWidth: '90px' }}>{label}</span>
              <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${(value / 5) * 100}%`, background: c, borderRadius: '2px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '24px 28px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SliderField label="Overall State" value={overallState} set={setOverallState} color={METRIC_COLORS.overall_state} />
          <SliderField label="Sleep Quality" value={sleepQuality} set={setSleepQuality} color={METRIC_COLORS.sleep_quality} />
          <SliderField label="Stress Level" value={stress} set={setStress} color={METRIC_COLORS.stress} />
          <SliderField label="Focus" value={focus} set={setFocus} color={METRIC_COLORS.focus} />

          {/* Ready to trade toggle */}
          <div>
            <label style={{ ...lbl, marginBottom: '10px' }}>Ready to Trade?</label>
            <button
              onClick={() => setReadyToTrade(r => !r)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                background: readyToTrade ? 'rgba(93,184,122,0.1)' : 'rgba(255,255,255,0.03)',
                outline: readyToTrade ? '1px solid rgba(93,184,122,0.35)' : '1px solid var(--bdr)',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 400, color: readyToTrade ? '#5DB87A' : 'var(--smoke)' }}>
                {readyToTrade ? "Yes — I'm mentally ready" : "Not ready to trade today"}
              </span>
              <div style={{ width: '36px', height: '20px', borderRadius: '10px', position: 'relative', background: readyToTrade ? '#5DB87A' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: readyToTrade ? '19px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </button>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="How are you feeling? Anything affecting your trading mindset today?"
              style={{ ...input, resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: '#E05C5C', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(93,184,122,0.08)', border: '1px solid rgba(93,184,122,0.2)', borderRadius: '7px', marginBottom: '12px' }}>
          <CheckCircle2 size={13} color="#5DB87A" />
          <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: '#5DB87A' }}>Check-in saved for {today}</span>
        </div>
      )}

      <button onClick={save} disabled={loading} style={{
        width: '100%', background: 'var(--gold)', color: '#06060A',
        fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        padding: '14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
        opacity: loading ? 0.7 : 1, marginBottom: '24px',
      }}>
        {loading ? 'Saving…' : existing ? 'Update Check-In' : 'Save Check-In'}
      </button>

      <MiniHistory history={history} />
    </div>
  )
}
