"use server"

import { revalidatePath } from "next/cache"

import { actionResult, type ActionResult } from "@/lib/action-state"
import { ordersCollection } from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { toObjectId } from "@/lib/object-id"

function revalidateOrderSurfaces() {
  revalidatePath("/vendor")
  revalidatePath("/vendor/orders")
  revalidatePath("/customer")
  revalidatePath("/customer/orders")
}

async function updatePendingOrder(
  orderId: string,
  vendorId: string,
  status: "accepted" | "rejected"
): Promise<ActionResult> {
  const objectId = toObjectId(orderId)
  if (!objectId) {
    return actionResult(false, "Order not found.")
  }

  const result = await ordersCollection.updateOne(
    { _id: objectId, vendorId, status: "pending" },
    { $set: { status, updatedAt: new Date() } }
  )

  if (result.matchedCount === 0) {
    return actionResult(
      false,
      "This order is no longer pending or does not belong to your restaurant."
    )
  }

  revalidateOrderSurfaces()

  return actionResult(
    true,
    status === "accepted" ? "Order accepted." : "Order rejected."
  )
}

export async function acceptOrder(orderId: string): Promise<ActionResult> {
  const session = await requireRole("vendor")
  return updatePendingOrder(orderId, session.user.id, "accepted")
}

export async function rejectOrder(orderId: string): Promise<ActionResult> {
  const session = await requireRole("vendor")
  return updatePendingOrder(orderId, session.user.id, "rejected")
}
