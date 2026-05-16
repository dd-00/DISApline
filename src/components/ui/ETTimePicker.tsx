'use client'

import React from 'react'

interface ETTimePickerProps {
  value: string       // "YYYY-MM-DDTHH:MM" in ET
  onChange: (v: string) => void
}

function parse(value: string) {
  if (!value) return { date: '', hour: '12', minute: '00', ampm: 'AM' as 'AM' | 'PM' }
  const [datePart, timePart = '00:00'] = value.split('T')
  const [h24Str = '0', mStr = '0'] = timePart.split(':')
  const h24 = parseInt(h24Str, 10)
  const m = parseInt(mStr, 10)
  const ampm: 'AM' | 'PM' = h24 < 12 ? 'AM' : 'PM'
  const hour12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
  return { date: datePart, hour: String(hour12), minute: String(m).padStart(2, '0'), ampm }
}

function serialize(date: string, hour: string, minute: string, ampm: 'AM' | 'PM'): string {
  if (!date) return ''
  let h = parseInt(hour, 10)
  if (ampm === 'AM' && h === 12) h = 0
  if (ampm === 'PM' && h !== 12) h += 12
  return `${date}T${String(h).padStart(2, '0')}:${minute}`
}

const sel: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bdr)',
  color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace",
  fontSize: '11px', fontWeight: 300, padding: '11px 8px',
  borderRadius: '6px', outline: 'none', cursor: 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
}

export function ETTimePicker({ value, onChange }: ETTimePickerProps) {
  const { date, hour, minute, ampm } = parse(value)

  const update = (d: string, h: string, m: string, a: 'AM' | 'PM') => {
    const next = serialize(d, h, m, a)
    if (next) onChange(next)
  }

  const dateInput: React.CSSProperties = {
    ...sel, padding: '11px 14px', flex: 1,
    appearance: 'none', WebkitAppearance: 'none',
  }

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
      <input
        type="date"
        value={date}
        onChange={e => update(e.target.value, hour, minute, ampm)}
        style={dateInput}
      />
      <select value={hour} onChange={e => update(date, e.target.value, minute, ampm)} style={{ ...sel, minWidth: '52px' }}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
          <option key={h} value={String(h)}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>
      <select value={minute} onChange={e => update(date, hour, e.target.value, ampm)} style={{ ...sel, minWidth: '52px' }}>
        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select value={ampm} onChange={e => update(date, hour, minute, e.target.value as 'AM' | 'PM')} style={{ ...sel, minWidth: '56px' }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}
