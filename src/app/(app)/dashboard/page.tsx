export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { calcEmotionScore, calcDisciplineScore, calcBiasScore, calcOverallScore, detectRevengeTrade } from '@/lib/scoring'
import type { Trade, CheckIn, Pattern } from '@/types'
import DashboardClient from './DashboardClient'
import { dateToETInput } from '@/lib/et'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tradesRes, checkInsRes, scoresRes, patternsRes] = await Promise.all([
    supabase.from('trades').select('*').eq('user_id', user!.id).order('entry_at', { ascending: false }).limit(50),
    supabase.from('check_ins').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('psych_scores').select('*').eq('user_id', user!.id).order('date', { ascending: false }).limit(30),
    supabase.from('patterns').select('*').eq('user_id', user!.id).order('detected_at', { ascending: false }).limit(10),
  ])

  const trades = (tradesRes.data ?? []) as Trade[]
  const checkIns = (checkInsRes.data ?? []) as CheckIn[]
  const scores = scoresRes.data ?? []
  const patterns = (patternsRes.data ?? []) as Pattern[]

  const postCheckIns = checkIns.filter(c => c.type === 'post')
  const emotion = calcEmotionScore(checkIns)
  const discipline = calcDisciplineScore(postCheckIns)
  const bias = calcBiasScore(postCheckIns)
  const overall = calcOverallScore(emotion, discipline, bias)

  const revengeTradeIds = detectRevengeTrade(trades)

  const closedTrades = trades.filter(t => t.status === 'closed')
  const winningTrades = closedTrades.filter(t => (t.pnl ?? 0) > 0)
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const winRate = closedTrades.length > 0 ? Math.round((winningTrades.length / closedTrades.length) * 100) : 0

  // Upsert today's psych score
  const today = dateToETInput(new Date()).slice(0, 10)
  if (postCheckIns.length > 0) {
    await supabase.from('psych_scores').upsert({
      user_id: user!.id,
      date: today,
      emotion_score: Math.round(emotion),
      discipline_score: Math.round(discipline),
      bias_score: Math.round(bias),
      overall_score: Math.round(overall),
      trade_count: closedTrades.filter(t => t.exit_at && dateToETInput(new Date(t.exit_at)).startsWith(today)).length,
    }, { onConflict: 'user_id,date' })
  }

  // ── Streak computation ────────────────────────────────────
  const sortedClosed = [...closedTrades]
    .filter(t => t.exit_at && t.pnl != null)
    .sort((a, b) => new Date(a.exit_at!).getTime() - new Date(b.exit_at!).getTime())

  let streakCount = 0
  let streakType: 'win' | 'loss' = 'win'
  if (sortedClosed.length > 0) {
    streakType = (sortedClosed[sortedClosed.length - 1].pnl ?? 0) > 0 ? 'win' : 'loss'
    for (let i = sortedClosed.length - 1; i >= 0; i--) {
      const isWin = (sortedClosed[i].pnl ?? 0) > 0
      if ((streakType === 'win') === isWin) streakCount++
      else break
    }
  }

  // ── Today's P&L ───────────────────────────────────────────
  const todayTrades = closedTrades.filter(t => t.exit_at && dateToETInput(new Date(t.exit_at)).slice(0, 10) === today)
  const todayPnl = todayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)

  return (
    <DashboardClient
      scores={{ emotion, discipline, bias, overall }}
      scoreHistory={scores}
      recentTrades={trades.slice(0, 10)}
      patterns={patterns}
      revengeTradeIds={revengeTradeIds}
      stats={{ totalPnl, winRate, tradeCount: trades.length }}
      streak={{ type: streakType, count: streakCount }}
      todayPnl={{ amount: todayPnl, tradeCount: todayTrades.length }}
    />
  )
}
