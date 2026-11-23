"use server"

import { revalidatePath } from "next/cache"

import { actionResult, type ActionResult } from "@/lib/action-state"
import { ordersCollection } from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { statusChangeUpdate } from "@/lib/data/orders"
import { sendOrderStatusEmail } from "@/lib/email"
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

  // Read first so the notification can use the order snapshot, but only after
  // the guarded update proves the order is still pending for this vendor.
  const order = await ordersCollection.findOne({
    _id: objectId,
    vendorId,
    status: "pending",
  })
  if (!order) {
    return actionResult(
      false,
      "This order is no longer pending or does not belong to your restaurant."
    )
  }

  const result = await ordersCollection.updateOne(
    { _id: objectId, vendorId, status: "pending" },
    statusChangeUpdate(status)
  )

  if (result.matchedCount === 0) {
    return actionResult(
      false,
      "This order is no longer pending or does not belong to your restaurant."
    )
  }

  revalidateOrderSurfaces()

  // A mail failure must not undo a successful status change.
  await sendOrderStatusEmail({
    to: order.customerEmail,
    customerName: order.customerName,
    orderId: order._id.toString(),
    itemName: order.itemName,
    status,
  })

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
