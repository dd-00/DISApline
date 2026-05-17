import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

// Use service role — webhooks run outside user sessions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId  = session.metadata?.user_id
      const plan    = session.metadata?.plan
      if (!userId || !plan) break

      const customerId     = session.customer as string
      const subscriptionId = session.subscription as string | null

      await supabase.from('subscriptions').upsert({
        user_id:                userId,
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
        plan,
        status:                 'active',
        current_period_end:     plan === 'lifetime' ? null : null, // set by subscription.updated
      }, { onConflict: 'user_id' })
      break
    }

    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (!userId) break

      await supabase.from('subscriptions').upsert({
        user_id:                userId,
        stripe_subscription_id: sub.id,
        status:                 sub.status === 'active' ? 'active' : sub.status,
        current_period_end:     new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })
      break
    }

    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', userId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
