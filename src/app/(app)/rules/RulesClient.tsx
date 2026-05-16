'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ShieldCheck } from 'lucide-react'
import type { Rule, RuleCategory } from '@/types'

const CATEGORIES: RuleCategory[] = ['entry', 'exit', 'risk', 'psychology', 'other']
const CATEGORY_COLOR: Record<RuleCategory, string> = {
  entry: '#7EB8E8',
  exit: '#5DB87A',
  risk: '#E05C5C',
  psychology: '#C9A227',
  other: 'var(--smoke)',
}

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

export default function RulesClient({ rules: initialRules }: { rules: Rule[] }) {
  const supabase = createClient()
  const [rules, setRules] = useState(initialRules)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<RuleCategory>('entry')
  const [error, setError] = useState('')

  const grouped = CATEGORIES.reduce<Record<RuleCategory, Rule[]>>((acc, cat) => {
    acc[cat] = rules.filter(r => r.category === cat)
    return acc
  }, {} as Record<RuleCategory, Rule[]>)

  async function addRule() {
    if (!title.trim()) { setError('Title is required'); return }
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: err } = await supabase.from('rules').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      is_active: true,
    }).select().single()

    if (err) { setError(err.message); return }
    if (data) {
      setRules(prev => [...prev, data as Rule])
      setTitle('')
      setDescription('')
      setCategory('entry')
      setShowForm(false)
    }
  }

  async function deleteRule(id: string) {
    await supabase.from('rules').delete().eq('id', id)
    setRules(prev => prev.filter(r => r.id !== id))
  }

  async function toggleActive(rule: Rule) {
    await supabase.from('rules').update({ is_active: !rule.is_active }).eq('id', rule.id)
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r))
  }

  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300,
    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none',
    background: active ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
    color: active ? 'var(--gold)' : 'var(--smoke)', transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: '40px 48px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>
            Trading Rules
          </h1>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
            {rules.filter(r => r.is_active).length} active rules · Your personal trading constitution
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
          Add Rule
        </button>
      </div>

      {/* Add rule form */}
      {showForm && (
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr-g)', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '20px' }}>New Rule</h2>

          {error && (
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', color: 'var(--red)', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={lbl}>Category</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)} style={{
                    ...chip(category === c),
                    border: category === c ? `1px solid ${CATEGORY_COLOR[c]}40` : '1px solid var(--bdr)',
                    color: category === c ? CATEGORY_COLOR[c] : 'var(--smoke)',
                    background: category === c ? `${CATEGORY_COLOR[c]}15` : 'rgba(255,255,255,0.04)',
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Rule Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Never risk more than 1% per trade" style={input} />
            </div>
            <div>
              <label style={lbl}>Description (optional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="Additional context or conditions…" style={{ ...input, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', color: 'var(--smoke)',
                fontFamily: "'Martian Mono', monospace", fontSize: '10px', padding: '11px',
                borderRadius: '6px', border: '1px solid var(--bdr)', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={addRule} style={{
                flex: 2, background: 'var(--gold)', color: '#06060A',
                fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '11px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              }}>Save Rule</button>
            </div>
          </div>
        </div>
      )}

      {/* Rules by category */}
      {rules.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <ShieldCheck size={40} color="var(--smoke)" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '8px' }}>
            No rules defined yet.
          </p>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)' }}>
            Your trading rules will be tracked against every trade you log.
          </p>
        </div>
      ) : (
        CATEGORIES.map(cat => {
          const catRules = grouped[cat]
          if (catRules.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLOR[cat] }} />
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: CATEGORY_COLOR[cat], letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {cat}
                </span>
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)' }}>
                  ({catRules.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {catRules.map(rule => (
                  <div key={rule.id} style={{
                    background: 'var(--bg-el)',
                    border: `1px solid ${rule.is_active ? 'var(--bdr)' : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: '8px', padding: '16px 18px',
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    opacity: rule.is_active ? 1 : 0.5, transition: 'opacity 0.2s',
                  }}>
                    <button onClick={() => toggleActive(rule)} style={{
                      width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                      background: rule.is_active ? CATEGORY_COLOR[cat] : 'transparent',
                      border: `1.5px solid ${rule.is_active ? CATEGORY_COLOR[cat] : 'var(--smoke)'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {rule.is_active && <span style={{ color: '#06060A', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--chalk)', marginBottom: rule.description ? '4px' : 0 }}>
                        {rule.title}
                      </p>
                      {rule.description && (
                        <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', lineHeight: 1.6 }}>
                          {rule.description}
                        </p>
                      )}
                    </div>
                    <button onClick={() => deleteRule(rule.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                      <Trash2 size={13} color="var(--smoke)" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
