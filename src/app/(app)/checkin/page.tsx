export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { dateToETInput } from '@/lib/et'
import type { DailyCheckIn } from '@/types'
import CheckInClient from './CheckInClient'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = dateToETInput(new Date()).slice(0, 10)

  const [todayRes, historyRes] = await Promise.all([
    supabase.from('daily_check_ins').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('daily_check_ins').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(8),
  ])

  return (
    <CheckInClient
      today={today}
      existing={todayRes.data as DailyCheckIn | null}
      history={(historyRes.data ?? []) as DailyCheckIn[]}
      userId={user.id}
    />
  )
}
