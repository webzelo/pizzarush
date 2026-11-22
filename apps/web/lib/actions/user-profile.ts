"use server"

import { revalidatePath } from "next/cache"

import {
  formDataObject,
  formStateFromError,
  type FormState,
} from "@/lib/action-state"
import { usersCollection } from "@/lib/collections"
import { requireUser } from "@/lib/dal/session"
import { userProfileInputSchema } from "@/lib/validation"

/**
 * Updates only the user-controlled account fields. Role, banned flags, plan and
 * subscription data are never read from the form or written by this action.
 */
export async function saveUserProfile(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireUser()
  const rawFields = formDataObject(formData)

  const currentImage = session.user.image?.trim() ?? ""
  const submittedImage = rawFields.image?.trim() ?? ""
  // OAuth avatars can use hosts outside ImgBB. Keep them unchanged without
  // allowing arbitrary hosts for newly uploaded images.
  const imageUnchanged = submittedImage === currentImage

  const parsed = userProfileInputSchema.safeParse({
    ...rawFields,
    image: imageUnchanged ? "" : submittedImage,
  })

  if (!parsed.success) {
    return formStateFromError(parsed.error)
  }

  try {
    await usersCollection.updateOne(
      { _id: session.user.id },
      {
        $set: {
          name: parsed.data.name,
          image: imageUnchanged
            ? (session.user.image ?? null)
            : parsed.data.image || null,
          updatedAt: new Date(),
        },
      }
    )
  } catch (error) {
    console.error("Failed to update user profile", error)
    return {
      status: "error",
      message: "Could not save your profile. Please try again.",
    }
  }

  revalidatePath("/")
  revalidatePath("/menu")
  revalidatePath("/customer")
  revalidatePath("/customer/profile")
  revalidatePath("/vendor")
  revalidatePath("/vendor/profile")
  revalidatePath("/admin/users")

  return {
    status: "success",
    message: "Profile updated successfully.",
  }
}
