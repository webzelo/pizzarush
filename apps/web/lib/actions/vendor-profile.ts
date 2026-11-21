"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  formDataObject,
  formStateFromError,
  type FormState,
} from "@/lib/action-state"
import { vendorsCollection } from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { vendorProfileInputSchema } from "@/lib/validation"

export async function saveVendorProfile(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("vendor")
  const parsed = vendorProfileInputSchema.safeParse(formDataObject(formData))

  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  const now = new Date()

  await vendorsCollection.updateOne(
    { userId: session.user.id },
    {
      $set: { ...parsed.data, updatedAt: now },
      $setOnInsert: {
        userId: session.user.id,
        plan: "free",
        planExpiresAt: null,
        createdAt: now,
      },
    },
    { upsert: true }
  )

  revalidatePath("/vendor")
  revalidatePath("/vendor/profile")
  revalidatePath("/menu")

  redirect("/vendor/profile?saved=1")
}
