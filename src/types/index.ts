export type Direction = 'long' | 'short'
export type AssetClass = 'stocks' | 'futures' | 'forex' | 'crypto' | 'options' | 'other'
export type TradeStatus = 'open' | 'closed'
export type CheckInType = 'pre' | 'post'
export type RuleCategory = 'entry' | 'exit' | 'risk' | 'psychology' | 'other'
export type PatternType =
  | 'revenge_trade'
  | 'fomo'
  | 'loss_aversion'
  | 'anchoring'
  | 'overtrading'
  | 'recency_bias'
  | 'cut_winners_early'
  | 'hold_losers'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
}

export interface Rule {
  id: string
  user_id: string
  title: string
  description: string | null
  category: RuleCategory
  is_active: boolean
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  symbol: string
  direction: Direction
  asset_class: AssetClass
  entry_price: number
  exit_price: number | null
  quantity: number
  entry_at: string
  exit_at: string | null
  pnl: number | null
  pnl_percent: number | null
  commission: number
  setup: string | null
  timeframe: string | null
  notes: string | null
  screenshot_url: string | null
  stop_loss: number | null
  point_value: number
  status: TradeStatus
  broker_id: string | null
  broker_trade_id: string | null
  created_at: string
  updated_at: string
  // joined
  pre_checkin?: CheckIn | null
  post_checkin?: CheckIn | null
}

export interface CheckIn {
  id: string
  trade_id: string
  user_id: string
  type: CheckInType
  mood: number | null
  confidence: number | null
  stress: number | null
  focus: number | null
  followed_rules: boolean | null
  broken_rule_ids: string[] | null
  rule_break_note: string | null
  flags: string[] | null
  reason: string | null
  lesson: string | null
  what_worked: string | null
  what_to_improve: string | null
  biggest_distraction: string | null
  created_at: string
}

export interface DailyCheckIn {
  id: string
  user_id: string
  date: string
  overall_state: number | null
  sleep_quality: number | null
  stress: number | null
  focus: number | null
  ready_to_trade: boolean
  notes: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  date: string
  content: string
  mood: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface PsychScore {
  id: string
  user_id: string
  date: string
  emotion_score: number | null
  discipline_score: number | null
  bias_score: number | null
  overall_score: number | null
  trade_count: number
  created_at: string
}

export interface Pattern {
  id: string
  user_id: string
  type: PatternType
  severity: 'low' | 'medium' | 'high'
  trade_ids: string[]
  description: string
  pnl_impact: number | null
  detected_at: string
  is_active: boolean
}

// Computed / UI types
export interface DashboardStats {
  overall_score: number
  emotion_score: number
  discipline_score: number
  bias_score: number
  score_delta: number        // vs last week
  total_trades: number
  win_rate: number
  total_pnl: number
  rule_adherence: number     // %
  active_patterns: Pattern[]
  score_history: PsychScore[]
}
