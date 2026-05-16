export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Trade, CheckIn } from '@/types'
import { calcEmotionScore, calcDisciplineScore, calcBiasScore, calcOverallScore } from '@/lib/scoring'
import { getETDayOfWeek, getSession, dateToETInput, formatET } from '@/lib/et'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tradesRes, checkInsRes] = await Promise.all([
    supabase.from('trades').select('*').eq('user_id', user!.id).eq('status', 'closed').order('exit_at', { ascending: true }),
    supabase.from('check_ins').select('*').eq('user_id', user!.id).order('created_at'),
  ])

  const trades = (tradesRes.data ?? []) as Trade[]
  const checkIns = (checkInsRes.data ?? []) as CheckIn[]

  // ── Day of week stats ────────────────────────────────────
  const dayStats = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
    const dayTrades = trades.filter(t => t.exit_at && getETDayOfWeek(t.exit_at) === idx)
    const wins = dayTrades.filter(t => (t.pnl ?? 0) > 0).length
    const pnl = dayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
    return { day, pnl, wins, count: dayTrades.length, winRate: dayTrades.length > 0 ? Math.round((wins / dayTrades.length) * 100) : 0 }
  })

  // ── Session stats ────────────────────────────────────────
  const sessions = ['Asia', 'London', 'US'] as const
  const sessionStats = sessions.map(session => {
    const sessionTrades = trades.filter(t => t.exit_at && getSession(t.exit_at) === session)
    const wins = sessionTrades.filter(t => (t.pnl ?? 0) > 0).length
    const pnl = sessionTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
    return { session, pnl, wins, count: sessionTrades.length, winRate: sessionTrades.length > 0 ? Math.round((wins / sessionTrades.length) * 100) : 0 }
  })

  // ── Performance metrics ──────────────────────────────────
  const wins = trades.filter(t => (t.pnl ?? 0) > 0)
  const losses = trades.filter(t => (t.pnl ?? 0) < 0)
  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0))
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0
  const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99 : 0
  const winRate = trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0
  const avgRR = avgLoss > 0 ? parseFloat((avgWin / avgLoss).toFixed(2)) : 0

  // Total score 0-100
  const pfScore = Math.min((profitFactor / 3) * 100, 100)
  const rrScore = Math.min((avgRR / 3) * 100, 100)
  const totalScore = Math.round(winRate * 0.4 + pfScore * 0.35 + rrScore * 0.25)

  // ── Calendar data ────────────────────────────────────────
  const calendarData: Record<string, { pnl: number; count: number; wins: number; losses: number }> = {}
  for (const t of trades) {
    if (!t.exit_at) continue
    const date = dateToETInput(new Date(t.exit_at)).slice(0, 10)
    if (!calendarData[date]) calendarData[date] = { pnl: 0, count: 0, wins: 0, losses: 0 }
    calendarData[date].pnl += t.pnl ?? 0
    calendarData[date].count++
    if ((t.pnl ?? 0) > 0) calendarData[date].wins++
    else calendarData[date].losses++
  }

  // ── Equity curve ─────────────────────────────────────────
  const sorted = trades.filter(t => t.exit_at && t.pnl != null)
    .sort((a, b) => new Date(a.exit_at!).getTime() - new Date(b.exit_at!).getTime())

  let running = 0
  let peak = 0
  let maxDrawdown = 0
  const equityCurve: { date: string; equity: number; pnl: number; symbol: string }[] = [
    { date: 'Start', equity: 0, pnl: 0, symbol: '' },
  ]
  for (const t of sorted) {
    running += t.pnl ?? 0
    if (running > peak) peak = running
    const dd = peak - running
    if (dd > maxDrawdown) maxDrawdown = dd
    equityCurve.push({
      date: formatET(t.exit_at!, 'short'),
      equity: parseFloat(running.toFixed(2)),
      pnl: t.pnl ?? 0,
      symbol: t.symbol,
    })
  }

  // ── Psych scores ─────────────────────────────────────────
  const postCheckIns = checkIns.filter(c => c.type === 'post')
  const emotion = calcEmotionScore(checkIns)
  const discipline = calcDisciplineScore(postCheckIns)
  const bias = calcBiasScore(postCheckIns)
  const overall = calcOverallScore(emotion, discipline, bias)

  // ── Psychology Trends ─────────────────────────────────────
  const trendMap: Record<string, { mood: number[]; confidence: number[]; stress: number[]; focus: number[] }> = {}
  for (const ci of checkIns) {
    const date = ci.created_at.slice(0, 10)
    if (!trendMap[date]) trendMap[date] = { mood: [], confidence: [], stress: [], focus: [] }
    if (ci.mood != null) trendMap[date].mood.push(ci.mood)
    if (ci.confidence != null) trendMap[date].confidence.push(ci.confidence)
    if (ci.stress != null) trendMap[date].stress.push(ci.stress)
    if (ci.focus != null) trendMap[date].focus.push(ci.focus)
  }
  const avg = (arr: number[]) => arr.length > 0 ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null
  const psychTrends = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, vals]) => ({
      date: date.slice(5),
      mood: avg(vals.mood),
      confidence: avg(vals.confidence),
      stress: avg(vals.stress),
      focus: avg(vals.focus),
    }))

  // ── Correlations ─────────────────────────────────────────
  const postCIsWithPnl = postCheckIns
    .map(ci => ({ ci, pnl: trades.find(t => t.id === ci.trade_id)?.pnl ?? null }))
    .filter((x): x is { ci: CheckIn; pnl: number } => x.pnl !== null)

  const correlations = (['mood', 'confidence', 'stress', 'focus'] as const).map(metric => {
    const winsCI = postCIsWithPnl.filter(x => x.pnl > 0).map(x => x.ci[metric]).filter((v): v is number => v != null)
    const lossesCI = postCIsWithPnl.filter(x => x.pnl < 0).map(x => x.ci[metric]).filter((v): v is number => v != null)
    const winAvg = winsCI.length > 0 ? parseFloat((winsCI.reduce((a, b) => a + b, 0) / winsCI.length).toFixed(1)) : 0
    const lossAvg = lossesCI.length > 0 ? parseFloat((lossesCI.reduce((a, b) => a + b, 0) / lossesCI.length).toFixed(1)) : 0
    return { metric, winAvg, lossAvg, winCount: winsCI.length, lossCount: lossesCI.length }
  })

  return (
    <AnalyticsClient
      dayStats={dayStats}
      sessionStats={sessionStats}
      calendarData={calendarData}
      metrics={{ winRate, avgWin, avgLoss, avgRR, profitFactor, totalScore, grossProfit, grossLoss, tradeCount: trades.length }}
      psychScores={{ emotion: Math.round(emotion), discipline: Math.round(discipline), bias: Math.round(bias), overall: Math.round(overall) }}
      equityCurve={equityCurve}
      maxDrawdown={parseFloat(maxDrawdown.toFixed(2))}
      psychTrends={psychTrends}
      correlations={correlations}
    />
  )
}
