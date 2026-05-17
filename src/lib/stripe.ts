import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  monthly:  { priceId: 'price_1TY0qkCQucchmjoSBbXM1cIu', mode: 'subscription' as const },
  yearly:   { priceId: 'price_1TY0szCQucchmjoSzb6rLJnl', mode: 'subscription' as const },
  lifetime: { priceId: 'price_1TY0uiCQucchmjoSsGsrLeBj', mode: 'payment'       as const },
}
