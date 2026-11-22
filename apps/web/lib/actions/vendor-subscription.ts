"use server"

import { headers } from "next/headers"

import { actionResult, type ActionResult } from "@/lib/action-state"
import { CURRENCY, PREMIUM_DURATION_DAYS, PREMIUM_PRICE } from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"
import { isPremiumActive } from "@/lib/plans"
import { activatePremiumFromCheckout } from "@/lib/subscriptions"
import { getStripe } from "@/lib/stripe"

async function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    return new URL(configured).origin
  }

  const requestHeaders = await headers()
  const host = requestHeaders.get("host")

  if (!host) {
    throw new Error("Unable to determine the site URL.")
  }

  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
  const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(host)
  const protocol = forwardedProtocol || (isLocal ? "http" : "https")

  return `${protocol}://${host}`
}

/**
 * Creates a Stripe Checkout Session for the signed-in vendor only.
 * Stripe confirms the payment later via webhook, so this never changes the
 * subscription or writes a transaction by itself.
 */
export async function startPremiumUpgrade(): Promise<ActionResult> {
  const session = await requireRole("vendor")
  const vendor = await getVendorByUserId(session.user.id)

  if (!vendor) {
    return actionResult(
      false,
      "Create your restaurant profile before upgrading."
    )
  }

  if (isPremiumActive(vendor)) {
    return actionResult(true, "You are already on the Premium plan.")
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return actionResult(false, "Payments are not configured yet.")
  }

  try {
    const siteUrl = await getSiteUrl()
    const stripe = getStripe()
    const metadata = {
      userId: session.user.id,
      vendorId: vendor.userId,
      vendorDocId: vendor._id.toString(),
      plan: "premium",
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY.toLowerCase(),
            unit_amount: Math.round(PREMIUM_PRICE * 100),
            product_data: {
              name: "Pizzarush Premium",
              description: `${PREMIUM_DURATION_DAYS} days of unlimited active menu items and featured placement.`,
            },
          },
        },
      ],
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${siteUrl}/vendor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/vendor/subscription/cancel`,
    })

    if (!checkoutSession.url) {
      return actionResult(
        false,
        "Stripe did not return a checkout URL. Please try again."
      )
    }

    return actionResult(
      true,
      "Redirecting to secure Stripe checkout…",
      checkoutSession.url
    )
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session", error)
    return actionResult(false, "Could not start checkout. Please try again.")
  }
}

/**
 * Fallback reconciliation for local development when the webhook has not run.
 * It still verifies the session directly with Stripe and only applies the
 * signed-in vendor's own session. The webhook remains the production source
 * of truth.
 */
export async function syncPremiumPayment(
  sessionId: string
): Promise<ActionResult> {
  const session = await requireRole("vendor")

  if (!/^cs_(test|live)_/.test(sessionId)) {
    return actionResult(false, "Invalid checkout session.")
  }

  try {
    const checkoutSession =
      await getStripe().checkout.sessions.retrieve(sessionId)

    const belongsToUser =
      checkoutSession.client_reference_id === session.user.id ||
      checkoutSession.metadata?.userId === session.user.id

    if (!belongsToUser) {
      return actionResult(
        false,
        "This checkout session does not belong to your account."
      )
    }

    if (checkoutSession.payment_status !== "paid") {
      return actionResult(true, "Payment is not confirmed yet.")
    }

    await activatePremiumFromCheckout(
      checkoutSession,
      `reconcile_${checkoutSession.id}`
    )

    return actionResult(true, "Payment status updated.")
  } catch (error) {
    console.error("Failed to reconcile Stripe payment", error)
    return actionResult(false, "Could not refresh payment status. Try again.")
  }
}
