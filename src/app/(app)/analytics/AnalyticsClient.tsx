'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, AreaChart, Area, ReferenceLine, LineChart, Line } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DayStat { day: string; pnl: number; count: number; winRate: number }
interface SessionStat { session: string; pnl: number; count: number; winRate: number }
interface Metrics {
  winRate: number; avgWin: number; avgLoss: number; avgRR: number
  profitFactor: number; totalScore: number; grossProfit: number; grossLoss: number; tradeCount: number
}
interface PsychScores { emotion: number; discipline: number; bias: number; overall: number }
interface EquityPoint { date: string; equity: number; pnl: number; symbol: string }
interface PsychTrendPoint { date: string; mood: number | null; confidence: number | null; stress: number | null; focus: number | null }
interface CorrelationData { metric: string; winAvg: number; lossAvg: number; winCount: number; lossCount: number }
interface Props {
  dayStats: DayStat[]
  sessionStats: SessionStat[]
  calendarData: Record<string, { pnl: number; count: number; wins: number; losses: number }>
  metrics: Metrics
  psychScores: PsychScores
  equityCurve: EquityPoint[]
  maxDrawdown: number
  psychTrends: PsychTrendPoint[]
  correlations: CorrelationData[]
}

const card: React.CSSProperties = { background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '12px' }
const secLabel: React.CSSProperties = {
  fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300,
  color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0E0E16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontFamily: 'Martian Mono', fontSize: '10px', color: 'var(--chalk)' },
}

// ── Performance 3D Score Map ──────────────────────────────────────────
function PerformanceMap({ metrics }: { metrics: Metrics }) {
  const score = metrics.totalScore
  const scoreColor = score >= 70 ? '#5DB87A' : score >= 45 ? '#C9A227' : '#E05C5C'

  const pillars = [
    { label: 'Win Rate', value: `${metrics.winRate}%`, score: metrics.winRate, color: '#7EB8E8' },
    { label: 'Avg Win/Loss', value: metrics.avgLoss > 0 ? `${metrics.avgRR.toFixed(2)}R` : '—', score: Math.min(metrics.avgRR / 3 * 100, 100), color: '#5DB87A' },
    { label: 'Profit Factor', value: metrics.profitFactor >= 99 ? '∞' : metrics.profitFactor.toFixed(2), score: Math.min(metrics.profitFactor / 3 * 100, 100), color: '#C9A227' },
  ]

  return (
    <div style={{ ...card, padding: '0', overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(201,162,39,0.06) 0%, transparent 60%)',
        borderBottom: '1px solid var(--bdr)',
        padding: '28px 28px 0',
      }}>
        <div style={secLabel}>Performance Score</div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,162,39,0.05), rgba(93,184,122,0.03), rgba(126,184,232,0.03))',
          border: `1px solid ${scoreColor}25`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          {/* Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '64px', fontWeight: 400, color: scoreColor, lineHeight: 1 }}>
                {metrics.tradeCount === 0 ? '—' : score}
              </div>
              <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                Total Score
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)', marginBottom: '4px' }}>{metrics.tradeCount} trades</div>
              <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: metrics.grossProfit - metrics.grossLoss >= 0 ? '#5DB87A' : '#E05C5C' }}>
                {metrics.grossProfit - metrics.grossLoss >= 0 ? '+' : ''}${(metrics.grossProfit - metrics.grossLoss).toFixed(0)} net
              </div>
            </div>
          </div>

          {/* Pillar bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pillars.map(({ label, value, score: s, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--smoke)', letterSpacing: '0.06em' }}>{label}</span>
                  <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: 'var(--chalk)', fontWeight: 400 }}>{value}</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${s}%`, background: color, borderRadius: '2px', boxShadow: `0 0 6px ${color}80`, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats below card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--bdr)' }}>
        {[
          { label: 'Gross Profit', value: `$${metrics.grossProfit.toFixed(0)}`, color: '#5DB87A' },
          { label: 'Gross Loss', value: `$${metrics.grossLoss.toFixed(0)}`, color: '#E05C5C' },
          { label: 'Avg Win', value: metrics.avgWin > 0 ? `$${metrics.avgWin.toFixed(0)}` : '—', color: 'var(--chalk)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-el)', padding: '14px 16px' }}>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '12px', fontWeight: 400, color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Psychology 3D Map ─────────────────────────────────────────────────
function PsychMap({ scores }: { scores: PsychScores }) {
  const radarData = [
    { subject: 'Emotion', value: scores.emotion, fullMark: 100 },
    { subject: 'Discipline', value: scores.discipline, fullMark: 100 },
    { subject: 'Bias Res.', value: scores.bias, fullMark: 100 },
    { subject: 'Consistency', value: Math.min(scores.discipline, 80), fullMark: 100 },
    { subject: 'Focus', value: Math.round((scores.emotion + scores.discipline) / 2), fullMark: 100 },
  ]

  const overallColor = scores.overall >= 70 ? '#5DB87A' : scores.overall >= 40 ? '#C9A227' : '#E05C5C'

  return (
    <div style={{ ...card, padding: '28px', overflow: 'hidden' }}>
      <div style={secLabel}>Psychology Score · Radar Map</div>

      <div style={{
        background: 'linear-gradient(180deg, rgba(201,162,39,0.03) 0%, transparent 100%)',
        borderRadius: '12px',
        border: `1px solid ${overallColor}20`,
        padding: '8px',
      }}>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="var(--bdr)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} />
              <Radar
                dataKey="value"
                stroke={overallColor}
                fill={overallColor}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      {/* Score pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '20px' }}>
        {[
          { label: 'Overall', value: scores.overall, color: overallColor },
          { label: 'Emotion', value: scores.emotion, color: '#7EB8E8' },
          { label: 'Discipline', value: scores.discipline, color: '#C9A227' },
          { label: 'Bias Res.', value: scores.bias, color: '#5DB87A' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color, marginBottom: '2px' }}>{value}</div>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8px', color: 'var(--smoke)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Equity Curve ─────────────────────────────────────────────────────
function EquityCurve({ data, maxDrawdown }: { data: EquityPoint[]; maxDrawdown: number }) {
  const hasData = data.length > 1
  const finalEquity = data[data.length - 1]?.equity ?? 0
  const color = finalEquity >= 0 ? '#5DB87A' : '#E05C5C'

  return (
    <div style={{ ...card, padding: '24px 28px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={secLabel}>Equity Curve</div>
        {hasData && (
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Net P&L', value: `${finalEquity >= 0 ? '+' : ''}$${finalEquity.toFixed(0)}`, color: finalEquity >= 0 ? '#5DB87A' : '#E05C5C' },
              { label: 'Max Drawdown', value: `$${maxDrawdown.toFixed(0)}`, color: '#E05C5C' },
              { label: 'Trades', value: String(data.length - 1), color: 'var(--chalk)' },
            ].map(({ label, value, color: c }) => (
              <div key={label} style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: c }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)' }}>No closed trades yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 8 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v, _, props: { payload?: EquityPoint }) => {
                const p = props.payload
                const num = Number(v)
                return [
                  `$${num.toFixed(2)}`,
                  p?.symbol ? `${p.symbol} (${p.pnl >= 0 ? '+' : ''}$${p.pnl.toFixed(0)})` : 'Equity',
                ]
              }}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="equity" stroke={color} strokeWidth={2} fill="url(#eqGrad)" dot={false} activeDot={{ r: 4, fill: color }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── Psychology Trends ─────────────────────────────────────────────────
function PsychTrends({ data }: { data: PsychTrendPoint[] }) {
  return (
    <div style={{ ...card, padding: '24px 28px' }}>
      <div style={secLabel}>Psychology Trends · Daily Averages (1–5)</div>
      {data.length === 0 ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)' }}>
            Complete pre/post trade check-ins to see trends.
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 8 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="mood" stroke="#7EB8E8" strokeWidth={1.5} dot={false} name="Mood" connectNulls />
              <Line type="monotone" dataKey="confidence" stroke="#C9A227" strokeWidth={1.5} dot={false} name="Confidence" connectNulls />
              <Line type="monotone" dataKey="stress" stroke="#E05C5C" strokeWidth={1.5} dot={false} name="Stress" connectNulls />
              <Line type="monotone" dataKey="focus" stroke="#5DB87A" strokeWidth={1.5} dot={false} name="Focus" connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--bdr)' }}>
            {[['#7EB8E8', 'Mood'], ['#C9A227', 'Confidence'], ['#E05C5C', 'Stress'], ['#5DB87A', 'Focus']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '20px', height: '2px', background: c, borderRadius: '1px' }} />
                <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)' }}>{l}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Correlation Insights ──────────────────────────────────────────────
function CorrelationInsights({ data }: { data: CorrelationData[] }) {
  const hasData = data.some(d => d.winCount > 0 || d.lossCount > 0)
  const LABELS: Record<string, string> = { mood: 'Mood', confidence: 'Confidence', stress: 'Stress Level', focus: 'Focus' }

  return (
    <div style={{ ...card, padding: '24px 28px' }}>
      <div style={secLabel}>Correlation Insights · Psychology vs Outcomes</div>
      {!hasData ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)' }}>
            Need post-trade check-ins to detect correlations.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {data.map(d => {
            const diff = d.winAvg - d.lossAvg
            const isStress = d.metric === 'stress'
            const positive = isStress ? diff < -0.2 : diff > 0.2
            const insight = d.winCount === 0 && d.lossCount === 0 ? null
              : isStress
                ? diff < -0.2 ? 'Lower stress on winning trades' : diff > 0.2 ? 'Higher stress on winning trades — investigate' : 'No clear pattern'
                : diff > 0.2 ? `Higher ${d.metric} correlates with wins` : diff < -0.2 ? `Lower ${d.metric} when winning — note this` : 'No clear pattern'
            return (
              <div key={d.metric} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)', borderRadius: '8px' }}>
                <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {LABELS[d.metric]}
                </div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                  {[{ label: `Wins (${d.winCount})`, value: d.winAvg, color: '#5DB87A' }, { label: `Losses (${d.lossCount})`, value: d.lossAvg, color: '#E05C5C' }].map(({ label, value, color }) => (
                    <div key={label}>
                      <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8px', color: 'var(--smoke)', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color }}>{value > 0 ? value.toFixed(1) : '—'}</div>
                    </div>
                  ))}
                </div>
                {insight && (
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', lineHeight: 1.5, color: positive ? '#5DB87A' : Math.abs(diff) < 0.2 ? 'var(--smoke)' : '#C9A227' }}>
                    {insight}
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

// ── Calendar ──────────────────────────────────────────────────────────
function CalendarView({ data }: { data: Record<string, { pnl: number; count: number; wins: number; losses: number }> }) {
  const [month, setMonth] = useState(new Date())
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })
  const firstDow = getDay(start)

  return (
    <div style={{ ...card, padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={secLabel as any}>
          <div style={secLabel}>Trade Calendar</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setMonth(subMonths(month, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--smoke)', display: 'flex' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', color: 'var(--chalk)', minWidth: '100px', textAlign: 'center' }}>
            {format(month, 'MMMM yyyy')}
          </span>
          <button onClick={() => setMonth(addMonths(month, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--smoke)', display: 'flex' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', textAlign: 'center', padding: '4px', letterSpacing: '0.08em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {/* Empty cells before first day */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} style={{ aspectRatio: '1', minHeight: '64px' }} />
        ))}

        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const d = data[key]
          const hasTrades = !!d && d.count > 0
          const pnlColor = d && d.pnl > 0 ? '#5DB87A' : d && d.pnl < 0 ? '#E05C5C' : 'var(--smoke)'
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          return (
            <div key={key} style={{
              minHeight: '72px', borderRadius: '8px', padding: '8px',
              background: hasTrades ? (d.pnl > 0 ? 'rgba(93,184,122,0.05)' : 'rgba(224,92,92,0.05)') : 'rgba(255,255,255,0.01)',
              border: isToday ? '1px solid rgba(201,162,39,0.4)' : `1px solid ${hasTrades ? (d.pnl > 0 ? 'rgba(93,184,122,0.15)' : 'rgba(224,92,92,0.15)') : 'var(--bdr)'}`,
              transition: 'border-color 0.15s',
            }}>
              <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: isToday ? 'var(--gold)' : hasTrades ? 'var(--chalk)' : 'var(--smoke)', marginBottom: '6px', fontWeight: isToday ? 500 : 300 }}>
                {format(day, 'd')}
              </div>
              {hasTrades && (
                <>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 400, color: pnlColor, marginBottom: '2px' }}>
                    {d.pnl >= 0 ? '+' : ''}${d.pnl.toFixed(0)}
                  </div>
                  <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8px', color: 'var(--smoke)' }}>
                    {d.count} trades
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--bdr)' }}>
        {[['#5DB87A', 'Profitable day'], ['#E05C5C', 'Loss day'], ['rgba(201,162,39,0.4)', 'Today']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />
            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────
export default function AnalyticsClient({ dayStats, sessionStats, calendarData, metrics, psychScores, equityCurve, maxDrawdown, psychTrends, correlations }: Props) {
  return (
    <div style={{ padding: '40px 48px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '4px' }}>
          Analytics
        </h1>
        <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)' }}>
          Performance breakdown · {metrics.tradeCount} closed trades analyzed
        </p>
      </div>

      {/* Equity Curve — full width */}
      <EquityCurve data={equityCurve} maxDrawdown={maxDrawdown} />

      {/* Row 1: Calendar + Performance Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <CalendarView data={calendarData} />
        <PerformanceMap metrics={metrics} />
      </div>

      {/* Row 2: Day of week + Session */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Day of week */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <div style={secLabel}>P&L by Day of Week</div>
          {metrics.tradeCount === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)' }}>No closed trades yet.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dayStats} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                  <XAxis dataKey="day" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`$${Number(v ?? 0).toFixed(0)}`, 'P&L']} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]} fill="#5DB87A"
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '12px' }}>
                {dayStats.filter(d => d.count > 0).map(d => (
                  <div key={d.day} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)' }}>{d.day}</div>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: d.winRate >= 50 ? '#5DB87A' : '#E05C5C' }}>{d.winRate}%</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Session */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <div style={secLabel}>P&L by Trading Session</div>
          {metrics.tradeCount === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', color: 'var(--smoke)' }}>No closed trades yet.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sessionStats} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                  <XAxis dataKey="session" tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--smoke)', fontFamily: 'Martian Mono', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`$${Number(v ?? 0).toFixed(0)}`, 'P&L']} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]} fill="#C9A227" />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' }}>
                {sessionStats.map(s => (
                  <div key={s.session} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--bdr)' }}>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8.5px', color: 'var(--smoke)', marginBottom: '2px' }}>{s.session}</div>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', color: s.pnl >= 0 ? '#5DB87A' : '#E05C5C', fontWeight: 400 }}>
                      {s.count > 0 ? `${s.winRate}%` : '—'}
                    </div>
                    <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8px', color: 'var(--smoke)' }}>{s.count}t</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 3: Psych Trends + Correlations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <PsychTrends data={psychTrends} />
        <CorrelationInsights data={correlations} />
      </div>

      {/* Row 4: Psychology 3D Map */}
      <PsychMap scores={psychScores} />
    </div>
  )
}
