"use server"

import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  actionResult,
  formDataObject,
  formStateFromError,
  type ActionResult,
  type FormState,
} from "@/lib/action-state"
import { CURRENCY } from "@/lib/constants"
import {
  menuItemsCollection,
  ordersCollection,
  usersCollection,
  vendorsCollection,
} from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { toObjectId } from "@/lib/object-id"
import { orderInputSchema } from "@/lib/validation"

export async function placeOrder(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = orderInputSchema.safeParse(formDataObject(formData))

  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  const itemId = toObjectId(parsed.data.menuItemId)
  if (!itemId) {
    return { status: "error", message: "Menu item not found." }
  }

  // Logged-out users who reach this action are sent to sign in, then back to
  // the dish they were trying to order.
  const session = await requireRole("customer", `/menu/${itemId.toString()}`)

  const item = await menuItemsCollection.findOne({
    _id: itemId,
    status: "approved",
    isActive: true,
  })

  if (!item) {
    return {
      status: "error",
      message: "This item is no longer available.",
    }
  }

  const [vendor, blockedVendor] = await Promise.all([
    vendorsCollection.findOne({ userId: item.vendorId }),
    usersCollection.findOne({ _id: item.vendorId, banned: true }),
  ])

  if (!vendor || blockedVendor) {
    return { status: "error", message: "This vendor is not available." }
  }

  const now = new Date()

  await ordersCollection.insertOne({
    _id: new ObjectId(),
    customerId: session.user.id,
    customerName: session.user.name,
    customerEmail: session.user.email,
    vendorId: item.vendorId,
    vendorName: vendor.restaurantName,
    menuItemId: item._id.toString(),
    itemName: item.name,
    itemImageUrl: item.imageUrl,
    itemPrice: item.price,
    quantity: parsed.data.quantity,
    amount: item.price * parsed.data.quantity,
    currency: CURRENCY,
    paymentStatus: "pending",
    paymentReference: null,
    deliveryDate: parsed.data.deliveryDate,
    deliveryAddress: parsed.data.deliveryAddress,
    customerMessage: parsed.data.customerMessage,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath("/customer")
  revalidatePath("/customer/orders")
  revalidatePath("/vendor")
  revalidatePath("/vendor/orders")

  redirect("/customer/orders?placed=1")
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const session = await requireRole("customer")
  const objectId = toObjectId(orderId)

  if (!objectId) {
    return actionResult(false, "Order not found.")
  }

  const result = await ordersCollection.updateOne(
    { _id: objectId, customerId: session.user.id, status: "pending" },
    { $set: { status: "cancelled", updatedAt: new Date() } }
  )

  if (result.matchedCount === 0) {
    return actionResult(
      false,
      "Only your own pending orders can be cancelled."
    )
  }

  revalidatePath("/customer")
  revalidatePath("/customer/orders")
  revalidatePath(`/customer/orders/${orderId}`)
  revalidatePath("/vendor")
  revalidatePath("/vendor/orders")

  return actionResult(true, "Order cancelled.")
}
