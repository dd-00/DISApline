import { createClient } from '@/lib/supabase/server'
import type { JournalEntry } from '@/types'
import JournalClient from './JournalClient'

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })

  return <JournalClient entries={(data ?? []) as JournalEntry[]} />
}
