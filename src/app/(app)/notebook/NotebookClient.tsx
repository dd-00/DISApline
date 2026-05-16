'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Target, Zap, Check, Loader } from 'lucide-react'

type TabKey = 'plan' | 'goals' | 'action'

const TABS: { key: TabKey; label: string; icon: typeof BookOpen; placeholder: string; description: string }[] = [
  {
    key: 'plan',
    label: 'Trading Plan',
    icon: BookOpen,
    description: 'Your complete trading system — strategies, setups, timeframes, instruments.',
    placeholder: `MY TRADING PLAN
═══════════════════════════════

STRATEGY OVERVIEW
Define your core trading approach and philosophy...

INSTRUMENTS & MARKETS
Which markets do you trade and why...

TIMEFRAMES
Primary and confirmation timeframes...

ENTRY CRITERIA
Specific conditions required to enter a trade...

EXIT CRITERIA
When and how you exit trades (both winners and losers)...

RISK MANAGEMENT
Position sizing rules, max daily loss, drawdown limits...

TRADING HOURS
Which sessions you trade and when to step away...`,
  },
  {
    key: 'goals',
    label: 'Goals',
    icon: Target,
    description: 'Your trading targets and personal growth milestones for the year.',
    placeholder: `${new Date().getFullYear()} TRADING GOALS
═══════════════════════════════

FINANCIAL GOALS
→ Monthly profit target:
→ Annual return target:
→ Max drawdown allowed:

SKILL DEVELOPMENT GOALS
→ Master:
→ Improve:
→ Stop doing:

PSYCHOLOGICAL GOALS
→ Consistency in:
→ Eliminate:
→ Build habit of:

KNOWLEDGE GOALS
→ Study:
→ Read:
→ Backtest:

REVIEW SCHEDULE
→ Daily: review trades + check-in
→ Weekly: performance review
→ Monthly: goals assessment`,
  },
  {
    key: 'action',
    label: 'Plan of Action',
    icon: Zap,
    description: 'Concrete steps and daily routines to achieve your goals.',
    placeholder: `PLAN OF ACTION
═══════════════════════════════

DAILY ROUTINE
□ Pre-market:
□ During session:
□ Post-session:

WEEKLY ACTIONS
□ Monday —
□ Friday —
□ Weekend —

THIS MONTH'S PRIORITIES
1.
2.
3.

IF/THEN PROTOCOLS
→ If I take a revenge trade, then I will...
→ If I hit my daily loss limit, then I will...
→ If I'm in drawdown, then I will...

ACCOUNTABILITY
→ Review with:
→ Track via: `,
  },
]

const TAB_COLOR: Record<TabKey, string> = {
  plan: '#7EB8E8',
  goals: '#5DB87A',
  action: '#C9A227',
}

export default function NotebookClient({ plan, goals, action }: { plan: string; goals: string; action: string }) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<TabKey>('plan')
  const [values, setValues] = useState({ plan, goals, action })
  const [saving, setSaving] = useState<TabKey | null>(null)
  const [saved, setSaved] = useState<TabKey | null>(null)
  const debounceRef = useRef<Record<TabKey, ReturnType<typeof setTimeout>>>({} as any)

  const save = useCallback(async (type: TabKey, content: string) => {
    setSaving(type)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notebook_pages').upsert({
      user_id: user.id,
      type,
      content,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,type' })
    setSaving(null)
    setSaved(type)
    setTimeout(() => setSaved(null), 2000)
  }, [supabase])

  const handleChange = (type: TabKey, value: string) => {
    setValues(prev => ({ ...prev, [type]: value }))
    clearTimeout(debounceRef.current[type])
    debounceRef.current[type] = setTimeout(() => save(type, value), 1200)
  }

  const tab = TABS.find(t => t.key === activeTab)!
  const color = TAB_COLOR[activeTab]

  return (
    <div style={{ padding: '40px 48px', maxWidth: '900px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>
          Notebook
        </h1>
        <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
          Your strategic trading documents · Auto-saved
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key
          const c = TAB_COLOR[key]
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
                background: active ? `${c}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? `${c}40` : 'var(--bdr)'}`,
                transition: 'all 0.2s',
              } as React.CSSProperties}
            >
              <Icon size={13} color={active ? c : 'var(--smoke)'} />
              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: active ? 400 : 300, color: active ? c : 'var(--smoke)', letterSpacing: '0.06em' }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-el)', border: `1px solid ${color}25`, borderRadius: '12px', overflow: 'hidden' }}>
        {/* Editor header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--bdr)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <tab.icon size={14} color={color} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: 'var(--chalk)' }}>
                {tab.label}
              </span>
            </div>
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)' }}>
              {tab.description}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving === activeTab && <Loader size={12} color="var(--smoke)" style={{ animation: 'spin 1s linear infinite' }} />}
            {saved === activeTab && <Check size={12} color="#5DB87A" />}
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: saving === activeTab ? 'var(--smoke)' : saved === activeTab ? '#5DB87A' : 'transparent' }}>
              {saving === activeTab ? 'saving…' : 'saved'}
            </span>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={values[activeTab]}
          onChange={e => handleChange(activeTab, e.target.value)}
          placeholder={tab.placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--chalk)', fontFamily: "'Martian Mono', monospace",
            fontSize: '11.5px', fontWeight: 300, lineHeight: 1.9,
            padding: '24px', resize: 'none',
            caretColor: color,
          }}
        />

        {/* Word count */}
        <div style={{ padding: '10px 24px', borderTop: '1px solid var(--bdr)', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)' }}>
            {values[activeTab].split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
