'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { Pattern, Trade } from '@/types'

interface Props {
  scores: { emotion: number; discipline: number; bias: number; overall: number }
  patterns: Pattern[]
  revengeTradeIds: string[]
  trades: Trade[]
  flagCounts: Record<string, number>
  avgMoodWin: number
  avgMoodLoss: number
  checkInCount: number
}

const SEVERITY_COLOR: Record<string, string> = { low: 'var(--smoke)', medium: '#C9A227', high: '#E05C5C' }

const card: React.CSSProperties = {
  background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '10px', padding: '24px 28px',
}

const secTitle: React.CSSProperties = {
  fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300,
  color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
}

export default function InsightsClient({ scores, patterns, revengeTradeIds, flagCounts, avgMoodWin, avgMoodLoss, checkInCount }: Props) {
  const radarData = [
    { subject: 'Emotion', value: Math.round(scores.emotion) },
    { subject: 'Discipline', value: Math.round(scores.discipline) },
    { subject: 'Bias Res.', value: Math.round(scores.bias) },
    { subject: 'Consistency', value: checkInCount > 0 ? Math.min(100, checkInCount * 5) : 0 },
    { subject: 'Rule Follow', value: Math.round(scores.discipline) },
  ]

  const flagData = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))

  const overallColor = scores.overall >= 70 ? '#5DB87A' : scores.overall >= 40 ? '#C9A227' : '#E05C5C'

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>
          Insights
        </h1>
        <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
          Behavioral patterns and psychological analysis · {checkInCount} check-ins analyzed
        </p>
      </div>

      {/* Overall score banner */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '20px', background: `linear-gradient(135deg, rgba(201,162,39,0.04), transparent)`, borderColor: 'rgba(201,162,39,0.15)' }}>
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '52px', fontWeight: 400, color: overallColor, lineHeight: 1 }}>
            {Math.round(scores.overall)}
          </div>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>Overall</div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7 }}>
            {scores.overall >= 80
              ? 'Excellent psychological performance. You are trading with high emotional intelligence and strong discipline.'
              : scores.overall >= 60
              ? 'Good psychological performance with room for improvement. Focus on your lowest scoring pillar.'
              : scores.overall >= 40
              ? 'Moderate psychological performance. Your trading behavior shows notable biases and emotional patterns.'
              : checkInCount === 0
              ? 'No check-in data yet. Complete trade check-ins to unlock your psychological profile.'
              : 'Low psychological score. Review the patterns below and work on rule adherence and emotional management.'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
          {[
            { label: 'Emotion', value: scores.emotion, color: '#7EB8E8' },
            { label: 'Discipline', value: scores.discipline, color: '#C9A227' },
            { label: 'Bias Resistance', value: scores.bias, color: '#5DB87A' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--chalk)' }}>{Math.round(value)}</span>
              </div>
              <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }}>
                <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '1px', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={card}>
          <div style={secTitle}>Psychological Radar</div>
          {checkInCount > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} />
                <Radar dataKey="value" stroke="var(--gold)" fill="rgba(201,162,39,0.15)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)', textAlign: 'center' }}>
                Complete post-trade check-ins<br />to see your radar profile.
              </p>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={secTitle}>Most Common Bias Flags</div>
          {flagData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={flagData} layout="vertical">
                <XAxis type="number" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '6px', fontFamily: 'Martian Mono', fontSize: '10px', color: 'var(--chalk)' }} />
                <Bar dataKey="count" fill="rgba(201,162,39,0.6)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)', textAlign: 'center' }}>
                No bias flags recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mood vs outcome */}
      {(avgMoodWin > 0 || avgMoodLoss > 0) && (
        <div style={{ ...card, marginBottom: '20px' }}>
          <div style={secTitle}>Mood vs Trade Outcome</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: '#5DB87A', letterSpacing: '0.06em', marginBottom: '8px' }}>Avg mood on winning trades</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', color: '#5DB87A' }}>{avgMoodWin.toFixed(1)}<span style={{ fontSize: '16px', color: 'var(--smoke)' }}>/5</span></div>
            </div>
            <div>
              <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: '#E05C5C', letterSpacing: '0.06em', marginBottom: '8px' }}>Avg mood on losing trades</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', color: '#E05C5C' }}>{avgMoodLoss.toFixed(1)}<span style={{ fontSize: '16px', color: 'var(--smoke)' }}>/5</span></div>
            </div>
          </div>
          {Math.abs(avgMoodWin - avgMoodLoss) > 0.3 && (
            <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7, borderTop: '1px solid var(--bdr)', paddingTop: '16px', marginTop: '16px' }}>
              {avgMoodWin > avgMoodLoss
                ? `You tend to win when your mood is higher (${avgMoodWin.toFixed(1)} vs ${avgMoodLoss.toFixed(1)}). Consider pausing when your mood drops below 3.`
                : `Your mood alone isn't predictive of outcomes — which may indicate other factors like setup quality are more important.`}
            </p>
          )}
        </div>
      )}

      {/* Revenge trades */}
      {revengeTradeIds.length > 0 && (
        <div style={{ ...card, marginBottom: '20px', borderColor: 'rgba(224,92,92,0.25)', background: 'rgba(224,92,92,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle size={16} color="#E05C5C" />
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 400, color: '#E05C5C', letterSpacing: '0.06em' }}>
              Revenge Trading Detected
            </span>
          </div>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', lineHeight: 1.7 }}>
            {revengeTradeIds.length} trade{revengeTradeIds.length > 1 ? 's' : ''} entered within 10 minutes of a losing trade. This is a strong indicator of revenge trading — emotional decisions made to recover losses quickly.
          </p>
        </div>
      )}

      {/* Detected patterns */}
      <div style={card}>
        <div style={secTitle}>All Detected Patterns</div>
        {patterns.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={16} color="#5DB87A" />
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
              No behavioral patterns detected yet. Keep logging trades.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {patterns.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)', borderRadius: '8px' }}>
                <AlertTriangle size={15} color={SEVERITY_COLOR[p.severity]} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 400, color: 'var(--chalk)' }}>
                      {p.type.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: SEVERITY_COLOR[p.severity], textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {p.severity}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', lineHeight: 1.7 }}>
                    {p.description}
                  </p>
                  {p.pnl_impact != null && (
                    <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: p.pnl_impact < 0 ? '#E05C5C' : '#5DB87A', marginTop: '4px', display: 'block' }}>
                      P&L impact: {p.pnl_impact >= 0 ? '+' : ''}${p.pnl_impact.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
