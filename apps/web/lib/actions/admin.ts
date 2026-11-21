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
  sessionsCollection,
  usersCollection,
  type MenuItemStatus,
} from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { toObjectId } from "@/lib/object-id"
import { moderationSchema } from "@/lib/validation"

function revalidateAdminSurfaces() {
  revalidatePath("/admin")
  revalidatePath("/admin/users")
  revalidatePath("/admin/menu")
  revalidatePath("/vendor")
  revalidatePath("/vendor/menu")
  revalidatePath("/menu")
  revalidatePath("/")
}

export async function setUserBlocked(
  userId: string,
  blocked: boolean
): Promise<ActionResult> {
  const session = await requireRole("admin")

  if (userId === session.user.id) {
    return actionResult(false, "You cannot block your own account.")
  }

  const target = await usersCollection.findOne({ _id: userId })

  if (!target) {
    return actionResult(false, "User not found.")
  }

  if (target.role === "admin") {
    return actionResult(false, "Admin accounts cannot be blocked.")
  }

  await usersCollection.updateOne(
    { _id: userId },
    {
      $set: {
        banned: blocked,
        banReason: blocked ? "Blocked by an administrator" : null,
        updatedAt: new Date(),
      },
    }
  )

  if (blocked) {
    // Revoke every active session immediately.
    await sessionsCollection.deleteMany({ userId })
  }

  revalidateAdminSurfaces()

  return actionResult(
    true,
    blocked
      ? `${target.name} has been blocked.`
      : `${target.name} can use the platform again.`
  )
}

export async function setMenuItemStatus(
  itemId: string,
  status: MenuItemStatus,
  reason = ""
): Promise<ActionResult> {
  await requireRole("admin")
  const objectId = toObjectId(itemId)

  if (!objectId) {
    return actionResult(false, "Menu item not found.")
  }

  const result = await menuItemsCollection.updateOne(
    { _id: objectId },
    {
      $set: {
        status,
        rejectionReason:
          status === "rejected"
            ? reason.trim() || "Rejected by an administrator"
            : null,
        updatedAt: new Date(),
      },
    }
  )

  if (result.matchedCount === 0) {
    return actionResult(false, "Menu item not found.")
  }

  revalidateAdminSurfaces()

  return actionResult(true, `Item marked as ${status}.`)
}

export async function rejectMenuItem(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("admin")
  const parsed = moderationSchema.safeParse({
    ...formDataObject(formData),
    status: "rejected",
  })

  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  const result = await setMenuItemStatus(
    parsed.data.itemId,
    "rejected",
    parsed.data.reason
  )

  return result.ok
    ? { status: "success", message: result.message }
    : { status: "error", message: result.message }
}

export async function deleteMenuItemAsAdmin(
  itemId: string
): Promise<ActionResult> {
  await requireRole("admin")
  const objectId = toObjectId(itemId)

  if (!objectId) {
    return actionResult(false, "Menu item not found.")
  }

  const result = await menuItemsCollection.deleteOne({ _id: objectId })

  if (result.deletedCount === 0) {
    return actionResult(false, "Menu item not found.")
  }

  revalidateAdminSurfaces()

  return actionResult(true, "Menu item deleted.")
}
