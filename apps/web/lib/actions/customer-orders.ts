"use server"

import { MongoServerError } from "mongodb"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  formDataObject,
  formStateFromError,
  type FormState,
} from "@/lib/action-state"
import { fetchPublicMenuItem } from "@/lib/api/menu"
import { vendorsCollection } from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { activeOrderExists, createCustomerOrder } from "@/lib/data/orders"
import { orderInputSchema } from "@/lib/validation"

const DUPLICATE_ORDER_MESSAGE =
  "You already have an active order for this item on that date."

function errorState(message: string): FormState {
  return { status: "error", message }
}

function revalidateOrderSurfaces() {
  revalidatePath("/customer")
  revalidatePath("/customer/orders")
  revalidatePath("/vendor")
  revalidatePath("/vendor/orders")
  revalidatePath("/admin")
  revalidatePath("/admin/menu")
}

async function ownsVendorForItem(userId: string, vendorId: string) {
  const vendor = await vendorsCollection.findOne({ userId })

  return (
    vendorId === userId || (vendor ? vendorId === vendor._id.toString() : false)
  )
}

/**
 * Places an order for the signed-in customer. The item id is bound by the
 * details page, and the vendor/item snapshot is re-read on the server so the
 * form cannot supply another restaurant, price or customer identity.
 */
export async function placeCustomerOrder(
  menuItemId: string,
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("customer")
  const parsed = orderInputSchema.safeParse({
    ...formDataObject(formData),
    menuItemId,
  })

  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  let item
  try {
    item = await fetchPublicMenuItem(menuItemId)
  } catch (error) {
    console.error("Failed to load menu item for order", error)
    return errorState("We could not load that menu item. Please try again.")
  }

  if (!item) {
    return errorState("This menu item is no longer available.")
  }

  try {
    if (await ownsVendorForItem(session.user.id, item.vendorId)) {
      return errorState("You cannot order from your own restaurant.")
    }

    if (
      await activeOrderExists(
        session.user.id,
        parsed.data.menuItemId,
        parsed.data.deliveryDate
      )
    ) {
      return errorState(DUPLICATE_ORDER_MESSAGE)
    }

    await createCustomerOrder({
      customerId: session.user.id,
      customerName: session.user.name,
      customerEmail: session.user.email,
      item: {
        id: item.id,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
      },
      quantity: parsed.data.quantity,
      deliveryDate: parsed.data.deliveryDate,
      deliveryAddress: parsed.data.deliveryAddress,
      customerMessage: parsed.data.customerMessage,
    })
  } catch (error) {
    // The unique partial index is the race-safe backstop for the check above.
    if (error instanceof MongoServerError && error.code === 11000) {
      return errorState(DUPLICATE_ORDER_MESSAGE)
    }

    console.error("Failed to place order", error)
    return errorState("Could not place your order. Please try again.")
  }

  revalidateOrderSurfaces()
  redirect("/customer/orders?placed=1")
}
