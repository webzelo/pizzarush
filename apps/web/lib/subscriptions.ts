import "server-only"

import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import type Stripe from "stripe"

import {
  transactionsCollection,
  usersCollection,
  vendorsCollection,
  type TransactionDoc,
} from "@/lib/collections"
import { CURRENCY, PREMIUM_DURATION_DAYS, PREMIUM_PRICE } from "@/lib/constants"
import { getVendorByUserId } from "@/lib/dal/vendor"

const expectedAmount = Math.round(PREMIUM_PRICE * 100)
const millisPerDay = 24 * 60 * 60 * 1000

function revalidatePremiumPaths() {
  revalidatePath("/")
  revalidatePath("/menu")
  revalidatePath("/vendor")
  revalidatePath("/vendor/subscription")
  revalidatePath("/admin")
  revalidatePath("/admin/transactions")
}

/**
 * Applies a verified Stripe Checkout result exactly once.
 * The webhook verifies the event before calling this function.
 */
export async function activatePremiumFromCheckout(
  session: Stripe.Checkout.Session,
  eventId: string
) {
  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return
  }

  const userId = session.client_reference_id ?? session.metadata?.userId

  if (!userId) {
    throw new Error("Checkout session is missing a vendor reference.")
  }

  if (session.metadata?.userId && session.metadata.userId !== userId) {
    throw new Error("Checkout session vendor references do not match.")
  }

  if (session.metadata?.vendorId && session.metadata.vendorId !== userId) {
    throw new Error("Checkout session vendor ID does not match the account.")
  }

  if (session.metadata?.plan && session.metadata.plan !== "premium") {
    throw new Error("Checkout session is not for the Premium plan.")
  }

  if (
    session.amount_total !== expectedAmount ||
    session.currency?.toLowerCase() !== CURRENCY.toLowerCase()
  ) {
    throw new Error("Checkout session amount does not match the Premium plan.")
  }

  const vendor = await getVendorByUserId(userId)

  if (!vendor) {
    throw new Error("No restaurant profile found for this checkout session.")
  }

  if (
    session.metadata?.vendorDocId &&
    session.metadata.vendorDocId !== vendor._id.toString()
  ) {
    throw new Error("Checkout session restaurant profile does not match.")
  }

  const user = await usersCollection.findOne({ _id: userId })
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id

  const transaction: TransactionDoc = {
    _id: new ObjectId(),
    vendorId: vendor.userId,
    vendorName: vendor.restaurantName,
    vendorEmail:
      session.customer_details?.email ??
      session.customer_email ??
      user?.email ??
      "",
    plan: "premium",
    amount: expectedAmount / 100,
    currency: CURRENCY,
    paymentStatus: "paid",
    reference: session.id,
    checkoutSessionId: session.id,
    stripeEventId: eventId,
    createdAt: session.created ? new Date(session.created * 1000) : new Date(),
  }

  if (paymentIntentId) {
    transaction.paymentIntentId = paymentIntentId
  }

  const result = await transactionsCollection.updateOne(
    { checkoutSessionId: session.id },
    { $setOnInsert: transaction },
    { upsert: true }
  )

  // A repeated or delayed webhook delivery must not extend Premium twice.
  if (result.upsertedCount === 0) {
    return
  }

  const now = new Date()
  await vendorsCollection.updateOne(
    { userId: vendor.userId },
    {
      $set: {
        plan: "premium",
        planExpiresAt: new Date(
          now.getTime() + PREMIUM_DURATION_DAYS * millisPerDay
        ),
        updatedAt: now,
      },
    }
  )

  revalidatePremiumPaths()
}
