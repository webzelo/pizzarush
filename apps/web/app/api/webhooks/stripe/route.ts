import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { activatePremiumFromCheckout } from "@/lib/subscriptions"
import { getStripe } from "@/lib/stripe"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature header." },
      { status: 400 }
    )
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    )
  }

  const payload = await request.text()
  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error("Invalid Stripe webhook signature", error)
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session
        await activatePremiumFromCheckout(session, event.id)
        break
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        // No paid transaction exists yet, so there is nothing to reverse.
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler failed", error)
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    )
  }
}
