'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Trade, Pattern } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { TrendingUp, TrendingDown, AlertTriangle, Plus, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  scores: { emotion: number; discipline: number; bias: number; overall: number }
  scoreHistory: Array<{ date: string; overall_score: number; emotion_score: number; discipline_score: number; bias_score: number }>
  recentTrades: Trade[]
  patterns: Pattern[]
  revengeTradeIds: string[]
  stats: { totalPnl: number; winRate: number; tradeCount: number }
  streak: { type: 'win' | 'loss'; count: number }
  todayPnl: { amount: number; tradeCount: number }
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const fill = (value / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(128,128,128,0.1)" strokeWidth="7" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
        <text x="64" y="70" textAnchor="middle" fill="var(--chalk)"
          style={{ fontFamily: "'Martian Mono', monospace", fontSize: '22px', fontWeight: 400 }}>
          {Math.round(value)}
        </text>
      </svg>
      <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function PsychBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 400, color: 'var(--chalk)' }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '2px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

const SEVERITY_COLOR: Record<string, string> = {
  low: 'var(--smoke)',
  medium: '#C9A227',
  high: '#E05C5C',
}

export default function DashboardClient({ userId, scores, scoreHistory, recentTrades, patterns, revengeTradeIds, stats, streak, todayPnl }: Props) {
  const router  = useRouter()
  const supabase = createClient()
  const [resetting, setResetting] = useState(false)

  async function resetPsychology() {
    setResetting(true)
    await supabase.from('check_ins').delete().eq('user_id', userId)
    await supabase.from('patterns').delete().eq('user_id', userId)
    await supabase.from('psych_scores').delete().eq('user_id', userId)
    setResetting(false)
    router.refresh()
  }

  const chartData = [...scoreHistory].reverse().map(s => ({
    date: format(new Date(s.date), 'MMM d'),
    Overall: Math.round(s.overall_score),
    Emotion: Math.round(s.emotion_score),
    Discipline: Math.round(s.discipline_score),
    Bias: Math.round(s.bias_score),
  }))

  const overallColor = scores.overall >= 70 ? '#5DB87A' : scores.overall >= 40 ? '#C9A227' : '#E05C5C'

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1200px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Loss streak alert */}
      {streak.count >= 3 && streak.type === 'loss' && (
        <div style={{
          marginBottom: '24px', padding: '14px 18px', borderRadius: '8px',
          background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.25)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <AlertTriangle size={15} color="#E05C5C" />
          <div>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 400, color: '#E05C5C', marginBottom: '2px' }}>
              {streak.count} consecutive losses
            </div>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', fontWeight: 300, color: 'var(--smoke)' }}>
              Consider pausing and reviewing your process before continuing.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
            Your trading mind, quantified
          </p>
        </div>
        <Link href="/trades/new" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--gold)', color: '#06060A',
          fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '10px 18px', borderRadius: '7px', textDecoration: 'none',
        }}>
          <Plus size={14} />
          Log Trade
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total P&L', value: `${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(0)}`, color: stats.totalPnl >= 0 ? '#5DB87A' : '#E05C5C' },
          { label: "Today's P&L", value: todayPnl.tradeCount > 0 ? `${todayPnl.amount >= 0 ? '+' : ''}$${todayPnl.amount.toFixed(0)}` : '—', color: todayPnl.amount >= 0 ? '#5DB87A' : '#E05C5C' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'var(--chalk)' },
          { label: 'Streak', value: streak.count > 0 ? `${streak.count} ${streak.type === 'win' ? '▲' : '▼'}` : '—', color: streak.type === 'win' ? '#5DB87A' : '#E05C5C' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '20px 24px' }}>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Score section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Overall score + breakdown */}
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Psychological Score
            </div>
            <button
              onClick={resetPsychology}
              disabled={resetting}
              title="Reset psychology scores"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'transparent', border: '1px solid rgba(224,92,92,0.2)',
                color: resetting ? 'var(--smoke)' : '#E05C5C',
                fontFamily: "'Martian Mono', monospace", fontSize: '9px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '5px 10px', borderRadius: '5px', cursor: resetting ? 'not-allowed' : 'pointer',
                opacity: resetting ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
            >
              <RotateCcw size={11} style={{ animation: resetting ? 'spin 0.8s linear infinite' : 'none' }} />
              {resetting ? 'Resetting…' : 'Reset'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '28px' }}>
            <ScoreRing value={scores.overall} label="Overall" color={overallColor} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <PsychBar label="Emotion" value={scores.emotion} color="#7EB8E8" />
              <PsychBar label="Discipline" value={scores.discipline} color="#C9A227" />
              <PsychBar label="Bias Resistance" value={scores.bias} color="#5DB87A" />
            </div>
          </div>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', lineHeight: 1.7, borderTop: '1px solid var(--bdr)', paddingTop: '16px' }}>
            Score is computed from your post-trade check-ins. Complete more check-ins to improve accuracy.
          </p>
        </div>

        {/* Score trend */}
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '28px 32px' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px' }}>
            Score Trend · 30 days
          </div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '8px', fontFamily: 'Martian Mono', fontSize: '10px', color: 'var(--chalk)' }}
                  itemStyle={{ color: 'var(--chalk)' }}
                />
                <Line type="monotone" dataKey="Overall" stroke={overallColor} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Emotion" stroke="#7EB8E8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="Discipline" stroke="#C9A227" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', textAlign: 'center' }}>
                No history yet.<br />Score trends appear after a few days of trading.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Active patterns */}
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '24px' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Detected Patterns
          </div>
          {patterns.length === 0 ? (
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
              No patterns detected yet. Keep logging trades.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {patterns.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)', borderRadius: '7px' }}>
                  <AlertTriangle size={14} color={SEVERITY_COLOR[p.severity]} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 400, color: 'var(--chalk)', marginBottom: '2px' }}>
                      {p.type.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)' }}>
                      {p.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/insights" style={{ display: 'block', marginTop: '16px', fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--gold)', textDecoration: 'none', letterSpacing: '0.06em' }}>
            View all insights →
          </Link>
        </div>

        {/* Recent trades */}
        <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '24px' }}>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Recent Trades
          </div>
          {recentTrades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '12px' }}>No trades yet.</p>
              <Link href="/trades/new" style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--gold)', textDecoration: 'none' }}>
                Log your first trade →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTrades.slice(0, 6).map(t => {
                const pnl = t.pnl ?? 0
                const isRevenge = revengeTradeIds.includes(t.id)
                return (
                  <Link key={t.id} href={`/trades/${t.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)', borderRadius: '7px', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {pnl >= 0 ? <TrendingUp size={13} color="#5DB87A" /> : <TrendingDown size={13} color="#E05C5C" />}
                      <div>
                        <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 400, color: 'var(--chalk)' }}>
                          {t.symbol} {isRevenge && <span style={{ color: '#E05C5C', fontSize: '9px', marginLeft: '4px' }}>⚡ revenge</span>}
                        </div>
                        <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', fontWeight: 300, color: 'var(--smoke)' }}>
                          {t.direction} · {t.asset_class}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 400, color: pnl >= 0 ? '#5DB87A' : '#E05C5C' }}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
          <Link href="/trades" style={{ display: 'block', marginTop: '16px', fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--gold)', textDecoration: 'none', letterSpacing: '0.06em' }}>
            View all trades →
          </Link>
        </div>
      </div>
    </div>
  )
}
