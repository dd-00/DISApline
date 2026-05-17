import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: string }
  const planConfig = PLANS[plan as keyof typeof PLANS]

  if (!planConfig) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Reuse existing Stripe customer if available
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const origin = req.headers.get('origin') ?? 'http://localhost:3002'

  const session = await stripe.checkout.sessions.create({
    mode: planConfig.mode,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    customer: sub?.stripe_customer_id ?? undefined,
    customer_email: sub?.stripe_customer_id ? undefined : user.email,
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    payment_method_types: ['card'],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url:  `${origin}/#pricing`,
    metadata: { user_id: user.id, plan },
    ...(planConfig.mode === 'subscription' && {
      subscription_data: { metadata: { user_id: user.id, plan } },
    }),
  })

  return NextResponse.json({ url: session.url })
}
