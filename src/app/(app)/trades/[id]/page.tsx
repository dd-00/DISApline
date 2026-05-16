import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Trade, CheckIn } from '@/types'
import TradeDetailClient from './TradeDetailClient'

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tradeRes, checkInsRes] = await Promise.all([
    supabase.from('trades').select('*').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('check_ins').select('*').eq('trade_id', id).order('created_at'),
  ])

  if (!tradeRes.data) notFound()

  return (
    <TradeDetailClient
      trade={tradeRes.data as Trade}
      checkIns={(checkInsRes.data ?? []) as CheckIn[]}
    />
  )
}
