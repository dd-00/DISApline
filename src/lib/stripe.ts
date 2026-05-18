import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  monthly:  { priceId: 'price_1TYRVVC9ZFtQkMueBvbRuQbt', mode: 'subscription' as const },
  yearly:   { priceId: 'price_1TYRVUC9ZFtQkMuerNbtWsKm', mode: 'subscription' as const },
  lifetime: { priceId: 'price_1TYRVRC9ZFtQkMueQeUS7OHL', mode: 'payment'       as const },
}
