"use server"

import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

import { actionResult, type ActionResult } from "@/lib/action-state"
import { favoritesCollection, menuItemsCollection } from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { toObjectId } from "@/lib/object-id"

/** Adds or removes one saved item for the signed-in customer. */
export async function toggleFavorite(itemId: string): Promise<ActionResult> {
  const session = await requireRole("customer")
  const objectId = toObjectId(itemId)

  if (!objectId) {
    return actionResult(false, "Menu item not found.")
  }

  const item = await menuItemsCollection.findOne({
    _id: objectId,
    status: "approved",
    isActive: true,
  })
  if (!item) {
    return actionResult(false, "This menu item is no longer available.")
  }

  const existing = await favoritesCollection.findOne({
    userId: session.user.id,
    itemId,
  })

  if (existing) {
    await favoritesCollection.deleteOne({ _id: existing._id })
  } else {
    await favoritesCollection.insertOne({
      _id: new ObjectId(),
      userId: session.user.id,
      itemId,
      createdAt: new Date(),
    })
  }

  revalidatePath("/")
  revalidatePath("/menu")
  revalidatePath(`/menu/${itemId}`)
  revalidatePath("/customer/favorites")

  return actionResult(
    true,
    existing ? "Removed from your favourites." : "Saved to your favourites."
  )
}
