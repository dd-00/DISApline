import { createClient } from '@/lib/supabase/server'
import type { Trade, CheckIn, Pattern } from '@/types'
import { calcEmotionScore, calcDisciplineScore, calcBiasScore, calcOverallScore, detectRevengeTrade } from '@/lib/scoring'
import InsightsClient from './InsightsClient'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tradesRes, checkInsRes, patternsRes] = await Promise.all([
    supabase.from('trades').select('*').eq('user_id', user!.id).order('entry_time', { ascending: false }),
    supabase.from('check_ins').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('patterns').select('*').eq('user_id', user!.id).order('detected_at', { ascending: false }),
  ])

  const trades = (tradesRes.data ?? []) as Trade[]
  const checkIns = (checkInsRes.data ?? []) as CheckIn[]
  const patterns = (patternsRes.data ?? []) as Pattern[]

  const postCheckIns = checkIns.filter(c => c.type === 'post')
  const emotion = calcEmotionScore(postCheckIns)
  const discipline = calcDisciplineScore(postCheckIns)
  const bias = calcBiasScore(postCheckIns)
  const overall = calcOverallScore(emotion, discipline, bias)

  const revengeTradeIds = detectRevengeTrade(trades)

  // Flag frequency analysis
  const allFlags = postCheckIns.flatMap(c => c.flags ?? [])
  const flagCounts: Record<string, number> = {}
  for (const f of allFlags) { flagCounts[f] = (flagCounts[f] ?? 0) + 1 }

  // P&L by emotion state
  const winningCheckIns = postCheckIns.filter(c => {
    const trade = trades.find(t => t.id === c.trade_id)
    return (trade?.pnl ?? 0) > 0
  })
  const losingCheckIns = postCheckIns.filter(c => {
    const trade = trades.find(t => t.id === c.trade_id)
    return (trade?.pnl ?? 0) < 0
  })

  const avgMoodWin = winningCheckIns.length ? winningCheckIns.reduce((s, c) => s + (c.mood ?? 3), 0) / winningCheckIns.length : 0
  const avgMoodLoss = losingCheckIns.length ? losingCheckIns.reduce((s, c) => s + (c.mood ?? 3), 0) / losingCheckIns.length : 0

  return (
    <InsightsClient
      scores={{ emotion, discipline, bias, overall }}
      patterns={patterns}
      revengeTradeIds={revengeTradeIds}
      trades={trades}
      flagCounts={flagCounts}
      avgMoodWin={avgMoodWin}
      avgMoodLoss={avgMoodLoss}
      checkInCount={postCheckIns.length}
    />
  )
}
