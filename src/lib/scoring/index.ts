import type { CheckIn, Trade } from '@/types'

// Emotion score: average of mood, confidence (inverse stress), focus — scaled 0-100
export function calcEmotionScore(checkIns: CheckIn[]): number {
  const pre = checkIns.filter(c => c.type === 'pre')
  if (pre.length === 0) return 50

  const scores = pre.map(c => {
    const mood       = ((c.mood       ?? 3) / 5) * 100
    const confidence = ((c.confidence ?? 3) / 5) * 100
    const calmness   = ((6 - (c.stress ?? 3)) / 5) * 100
    const focus      = ((c.focus      ?? 3) / 5) * 100
    return (mood + confidence + calmness + focus) / 4
  })

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// Discipline score: % of trades where all rules were followed
export function calcDisciplineScore(checkIns: CheckIn[]): number {
  const relevant = checkIns.filter(c => c.followed_rules !== null)
  if (relevant.length === 0) return 50
  const followed = relevant.filter(c => c.followed_rules === true).length
  return Math.round((followed / relevant.length) * 100)
}

// Bias score: 100 minus deduction per flag detected
export function calcBiasScore(checkIns: CheckIn[]): number {
  const allFlags = checkIns.flatMap(c => c.flags ?? [])
  if (allFlags.length === 0) return 85

  const flagCounts: Record<string, number> = {}
  allFlags.forEach(f => { flagCounts[f] = (flagCounts[f] ?? 0) + 1 })

  // Deduct per-flag per occurrence (capped)
  let deduction = 0
  const WEIGHTS: Record<string, number> = {
    revenge_trade:  8,
    fomo:           6,
    oversize:       7,
    loss_aversion:  5,
    anchoring:      4,
  }
  Object.entries(flagCounts).forEach(([flag, count]) => {
    deduction += Math.min((WEIGHTS[flag] ?? 4) * count, 30)
  })

  return Math.max(0, Math.round(100 - deduction))
}

export function calcOverallScore(emotion: number, discipline: number, bias: number): number {
  return Math.round(emotion * 0.3 + discipline * 0.4 + bias * 0.3)
}

// Detect potential revenge trade: trade entered within 10 min of a losing exit
export function detectRevengeTrade(trades: Trade[]): string[] {
  const sorted = [...trades]
    .filter(t => t.status === 'closed' && t.exit_at)
    .sort((a, b) => new Date(a.exit_at!).getTime() - new Date(b.exit_at!).getTime())

  const flags: string[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const prev = sorted[i]
    const next = sorted[i + 1]
    if ((prev.pnl ?? 0) < 0) {
      const gap = new Date(next.entry_at).getTime() - new Date(prev.exit_at!).getTime()
      if (gap < 10 * 60 * 1000) flags.push(next.id)
    }
  }
  return flags
}
