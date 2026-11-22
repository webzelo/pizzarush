import "server-only"

import Stripe from "stripe"

let stripe: Stripe | null = null

/** Server-only Stripe client. The secret key is never sent to the browser. */
export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.")
  }

  stripe ??= new Stripe(secretKey)
  return stripe
}
