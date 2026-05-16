import { createClient } from '@/lib/supabase/server'
import type { Rule } from '@/types'
import RulesClient from './RulesClient'

export default async function RulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('rules')
    .select('*')
    .eq('user_id', user!.id)
    .order('category')
    .order('created_at')

  return <RulesClient rules={(data ?? []) as Rule[]} />
}
