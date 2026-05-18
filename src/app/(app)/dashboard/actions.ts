'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetPsychologyData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('check_ins').delete().eq('user_id', user.id)
  await supabase.from('patterns').delete().eq('user_id', user.id)
  await supabase.from('psych_scores').delete().eq('user_id', user.id)
}
