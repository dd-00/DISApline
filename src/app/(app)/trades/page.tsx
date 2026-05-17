export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Trade } from '@/types'
import TradesClient from './TradesClient'

export default async function TradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user!.id)
    .order('entry_at', { ascending: false })

  return <TradesClient trades={(data ?? []) as Trade[]} userId={user!.id} />
}
