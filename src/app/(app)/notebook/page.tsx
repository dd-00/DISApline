export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import NotebookClient from './NotebookClient'

export default async function NotebookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('notebook_pages')
    .select('*')
    .eq('user_id', user!.id)

  const pages = data ?? []
  const getContent = (type: string) => pages.find(p => p.type === type)?.content ?? ''

  return (
    <NotebookClient
      plan={getContent('plan')}
      goals={getContent('goals')}
      action={getContent('action')}
    />
  )
}
