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
import {
  menuItemsCollection,
  type MenuItemStatus,
} from "@/lib/collections"
import { FREE_ACTIVE_ITEM_LIMIT } from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"
import {
  activeItemLimitFilter,
  countActiveItemsForLimit,
} from "@/lib/data/menu"
import { toObjectId } from "@/lib/object-id"
import { isPremiumActive } from "@/lib/plans"
import { menuItemInputSchema } from "@/lib/validation"

async function activeLimitReached(
  vendorId: string,
  excludeItemId?: ObjectId
) {
  const vendor = await getVendorByUserId(vendorId)
  if (isPremiumActive(vendor)) return false

  if (!excludeItemId) {
    return (await countActiveItemsForLimit(vendorId)) >= FREE_ACTIVE_ITEM_LIMIT
  }

  const filter = activeItemLimitFilter(vendorId)
  filter._id = { $ne: excludeItemId }
  const count = await menuItemsCollection.countDocuments(filter)

  return count >= FREE_ACTIVE_ITEM_LIMIT
}

function limitMessage() {
  return `The Free plan allows ${FREE_ACTIVE_ITEM_LIMIT} active menu items. Upgrade to Premium for unlimited items.`
}

function revalidateMenuSurfaces() {
  revalidatePath("/vendor")
  revalidatePath("/vendor/menu")
  revalidatePath("/admin")
  revalidatePath("/admin/menu")
  revalidatePath("/menu")
  revalidatePath("/")
}

export async function createMenuItem(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("vendor")
  const vendor = await getVendorByUserId(session.user.id)

  if (!vendor) {
    return {
      status: "error",
      message: "Create your restaurant profile before adding menu items.",
    }
  }

  const parsed = menuItemInputSchema.safeParse(formDataObject(formData))
  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  if (parsed.data.isActive && (await activeLimitReached(session.user.id))) {
    return { status: "error", message: limitMessage() }
  }

  const now = new Date()

  await menuItemsCollection.insertOne({
    _id: new ObjectId(),
    vendorId: session.user.id,
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description,
    price: parsed.data.price,
    area: parsed.data.area,
    city: parsed.data.city,
    imageUrl: parsed.data.imageUrl,
    status: "pending",
    isActive: parsed.data.isActive,
    rejectionReason: null,
    createdAt: now,
    updatedAt: now,
  })

  revalidateMenuSurfaces()
  redirect("/vendor/menu?created=1")
}

export async function updateMenuItem(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("vendor")
  const itemId = String(formData.get("itemId") ?? "")
  const objectId = toObjectId(itemId)

  if (!objectId) {
    return { status: "error", message: "Menu item not found." }
  }

  const existing = await menuItemsCollection.findOne({
    _id: objectId,
    vendorId: session.user.id,
  })

  if (!existing) {
    return { status: "error", message: "Menu item not found." }
  }

  const parsed = menuItemInputSchema.safeParse(formDataObject(formData))
  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  if (
    parsed.data.isActive &&
    !existing.isActive &&
    (await activeLimitReached(session.user.id, objectId))
  ) {
    return { status: "error", message: limitMessage() }
  }

  // Editing a rejected item sends it back for review.
  const status: MenuItemStatus =
    existing.status === "rejected" ? "pending" : existing.status

  await menuItemsCollection.updateOne(
    { _id: objectId, vendorId: session.user.id },
    {
      $set: {
        name: parsed.data.name,
        category: parsed.data.category,
        description: parsed.data.description,
        price: parsed.data.price,
        area: parsed.data.area,
        city: parsed.data.city,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive,
        status,
        rejectionReason: status === "pending" ? null : existing.rejectionReason,
        updatedAt: new Date(),
      },
    }
  )

  revalidateMenuSurfaces()
  revalidatePath(`/vendor/menu/${itemId}`)
  redirect("/vendor/menu?updated=1")
}

export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  const session = await requireRole("vendor")
  const objectId = toObjectId(itemId)

  if (!objectId) {
    return actionResult(false, "Menu item not found.")
  }

  const result = await menuItemsCollection.deleteOne({
    _id: objectId,
    vendorId: session.user.id,
  })

  if (result.deletedCount === 0) {
    return actionResult(false, "Menu item not found.")
  }

  revalidateMenuSurfaces()
  return actionResult(true, "Menu item deleted.")
}

export async function toggleMenuItemAvailability(
  itemId: string
): Promise<ActionResult> {
  const session = await requireRole("vendor")
  const objectId = toObjectId(itemId)

  if (!objectId) {
    return actionResult(false, "Menu item not found.")
  }

  const item = await menuItemsCollection.findOne({
    _id: objectId,
    vendorId: session.user.id,
  })

  if (!item) {
    return actionResult(false, "Menu item not found.")
  }

  if (!item.isActive && (await activeLimitReached(session.user.id, objectId))) {
    return actionResult(false, limitMessage())
  }

  await menuItemsCollection.updateOne(
    { _id: objectId, vendorId: session.user.id },
    { $set: { isActive: !item.isActive, updatedAt: new Date() } }
  )

  revalidateMenuSurfaces()
  revalidatePath(`/vendor/menu/${itemId}`)

  return actionResult(
    true,
    item.isActive
      ? "Item is now hidden from customers."
      : "Item is now available to customers."
  )
}
