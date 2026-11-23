"use server"

import { revalidatePath } from "next/cache"

import {
  actionResult,
  formDataObject,
  formStateFromError,
  type ActionResult,
  type FormState,
} from "@/lib/action-state"
import {
  menuItemsCollection,
  reviewsCollection as reviews,
  vendorsCollection,
} from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { hasOrderedItem } from "@/lib/data/reviews"
import { toObjectId } from "@/lib/object-id"
import { reviewSchema } from "@/lib/validation"

function revalidateReviewSurfaces(itemId: string) {
  revalidatePath("/")
  revalidatePath("/menu")
  revalidatePath(`/menu/${itemId}`)
  revalidatePath("/admin/reviews")
  revalidatePath("/vendor")
}

/** One review per customer/item: submitting again updates their own review. */
export async function submitMenuReview(
  itemId: string,
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("customer")
  const objectId = toObjectId(itemId)

  if (!objectId) {
    return { status: "error", message: "Menu item not found." }
  }

  const parsed = reviewSchema.safeParse(formDataObject(formData))
  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  const item = await menuItemsCollection.findOne({
    _id: objectId,
    status: "approved",
    isActive: true,
  })
  if (!item) {
    return {
      status: "error",
      message: "This menu item is no longer available.",
    }
  }

  if (!(await hasOrderedItem(session.user.id, itemId))) {
    return {
      status: "error",
      message: "Place an order for this item before writing a review.",
    }
  }

  const vendor = await vendorsCollection.findOne({ userId: item.vendorId })
  const now = new Date()

  await reviews.updateOne(
    { itemId, userId: session.user.id },
    {
      $set: {
        itemName: item.name,
        vendorId: item.vendorId,
        vendorName: vendor?.restaurantName ?? item.vendorId,
        customerName: session.user.name,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  )

  revalidateReviewSurfaces(itemId)

  return { status: "success", message: "Thanks for sharing your review!" }
}

export async function deleteReviewAsAdmin(
  reviewId: string
): Promise<ActionResult> {
  await requireRole("admin")
  const objectId = toObjectId(reviewId)

  if (!objectId) {
    return actionResult(false, "Review not found.")
  }

  const result = await reviews.deleteOne({ _id: objectId })
  if (result.deletedCount === 0) {
    return actionResult(false, "This review was already removed.")
  }

  revalidatePath("/admin/reviews")
  revalidatePath("/menu")
  revalidatePath("/")

  return actionResult(true, "Review deleted.")
}
