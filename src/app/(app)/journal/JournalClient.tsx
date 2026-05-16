'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Plus, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import type { JournalEntry } from '@/types'

const MOODS = ['😤 Frustrated', '😰 Anxious', '😐 Neutral', '😌 Calm', '😊 Confident', '🎯 Focused', '😴 Tired', '🔥 Energized']
const TAGS = ['discipline', 'mindset', 'strategy', 'risk management', 'review', 'goals', 'lesson']

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

export default function JournalClient({ entries: initialEntries }: { entries: JournalEntry[] }) {
  const supabase = createClient()
  const [entries, setEntries] = useState(initialEntries)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function saveEntry() {
    if (!content.trim()) { setError('Write something first'); return }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: err } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      date,
      content: content.trim(),
      mood: selectedMood || null,
      tags: selectedTags.length > 0 ? selectedTags : null,
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }
    if (data) {
      setEntries(prev => [data as JournalEntry, ...prev])
      setContent('')
      setSelectedMood('')
      setSelectedTags([])
      setDate(new Date().toISOString().slice(0, 10))
      setShowForm(false)
    }
    setLoading(false)
  }

  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300,
    padding: '5px 11px', borderRadius: '20px', cursor: 'pointer', border: 'none',
    background: active ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.04)',
    color: active ? 'var(--gold)' : 'var(--smoke)', transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: '40px 48px', maxWidth: '760px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>
            Journal
          </h1>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
            {entries.length} entries · Your trading mind diary
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--gold)', color: '#06060A',
          fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '10px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
        }}>
          <Plus size={14} />
          New Entry
        </button>
      </div>

      {/* New entry form */}
      {showForm && (
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr-g)', borderRadius: '10px', padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '24px' }}>New Entry</h2>

          {error && (
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', color: 'var(--red)', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={lbl}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...input, maxWidth: '200px' }} />
            </div>

            <div>
              <label style={{ ...lbl, marginBottom: '10px' }}>Mood</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {MOODS.map(m => (
                  <button key={m} onClick={() => setSelectedMood(selectedMood === m ? '' : m)} style={chip(selectedMood === m)}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={lbl}>Content *</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={8}
                placeholder="What happened today? How did you trade? What did you learn? What patterns are you noticing in your behavior?"
                style={{ ...input, resize: 'vertical', lineHeight: 1.7 }}
              />
            </div>

            <div>
              <label style={{ ...lbl, marginBottom: '10px' }}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} style={chip(selectedTags.includes(tag))}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', color: 'var(--smoke)',
                fontFamily: "'Martian Mono', monospace", fontSize: '10px', padding: '12px',
                borderRadius: '6px', border: '1px solid var(--bdr)', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={saveEntry} disabled={loading} style={{
                flex: 2, background: 'var(--gold)', color: '#06060A',
                fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Saving…' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries list */}
      {entries.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <BookOpen size={40} color="var(--smoke)" style={{ display: 'block', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '6px' }}>
            Your journal is empty.
          </p>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)' }}>
            Reflect on your trading sessions to build self-awareness.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map(entry => {
            const isExpanded = expandedId === entry.id
            const preview = entry.content.slice(0, 160)
            const hasMore = entry.content.length > 160
            return (
              <div key={entry.id} style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 400, color: 'var(--chalk)' }}>
                      {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                    {entry.mood && (
                      <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--smoke)', marginLeft: '12px' }}>{entry.mood}</span>
                    )}
                  </div>
                  {hasMore && (
                    <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--smoke)', display: 'flex', alignItems: 'center' }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {isExpanded ? entry.content : preview}
                  {!isExpanded && hasMore && (
                    <button onClick={() => setExpandedId(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--gold)', padding: 0, marginLeft: '4px' }}>
                      read more
                    </button>
                  )}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                    {entry.tags.map(tag => (
                      <span key={tag} style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bdr)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
