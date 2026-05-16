'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function uploadTradeChart(tradeId: string, formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trade } = await supabase
    .from('trades').select('id, user_id').eq('id', tradeId).single()
  if (!trade || trade.user_id !== user.id) return { error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'No file provided' }

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${user.id}/${tradeId}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: upErr } = await admin.storage
    .from('trade-charts')
    .upload(path, bytes, { upsert: true, contentType: file.type })

  if (upErr) return { error: upErr.message }

  const { data: { publicUrl } } = admin.storage.from('trade-charts').getPublicUrl(path)

  await supabase.from('trades').update({ screenshot_url: publicUrl }).eq('id', trade.id)

  return { url: publicUrl }
}

export async function removeTradeChart(tradeId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trade } = await supabase
    .from('trades').select('id, user_id, screenshot_url').eq('id', tradeId).single()
  if (!trade || trade.user_id !== user.id) return { error: 'Unauthorized' }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (trade.screenshot_url) {
    const path = new URL(trade.screenshot_url).pathname.split('/object/public/trade-charts/')[1]
    if (path) await admin.storage.from('trade-charts').remove([path])
  }

  await supabase.from('trades').update({ screenshot_url: null }).eq('id', trade.id)
  return {}
}
