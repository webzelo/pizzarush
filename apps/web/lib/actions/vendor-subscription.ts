"use server"

import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

import { actionResult, type ActionResult } from "@/lib/action-state"
import { transactionsCollection, vendorsCollection } from "@/lib/collections"
import {
  CURRENCY,
  PREMIUM_DURATION_DAYS,
  PREMIUM_PRICE,
} from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"
import { isPremiumActive } from "@/lib/plans"

/**
 * Demo checkout: records a paid transaction and activates Premium. Swap this
 * for a gateway callback when real payments are added.
 */
export async function upgradeToPremium(): Promise<ActionResult> {
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

  const now = new Date()
  const expiresAt = new Date(
    now.getTime() + PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000
  )

  await transactionsCollection.insertOne({
    _id: new ObjectId(),
    vendorId: session.user.id,
    vendorName: vendor.restaurantName,
    vendorEmail: session.user.email,
    plan: "premium",
    amount: PREMIUM_PRICE,
    currency: CURRENCY,
    paymentStatus: "paid",
    reference: `PR-${now.getTime()}`,
    createdAt: now,
  })

  await vendorsCollection.updateOne(
    { userId: session.user.id },
    {
      $set: {
        plan: "premium",
        planExpiresAt: expiresAt,
        updatedAt: now,
      },
    }
  )

  revalidatePath("/vendor")
  revalidatePath("/vendor/subscription")
  revalidatePath("/admin")
  revalidatePath("/admin/transactions")
  revalidatePath("/menu")
  revalidatePath("/")

  return actionResult(
    true,
    `Premium activated until ${expiresAt.toLocaleDateString("en-US")}.`
  )
}
