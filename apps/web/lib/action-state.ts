import type { z } from "zod"

export type FormState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Record<string, string>
}

export const initialFormState: FormState = { status: "idle" }

export type ActionResult = {
  ok: boolean
  message: string
  url?: string
}

export function actionResult(
  ok: boolean,
  message: string,
  url?: string
): ActionResult {
  return url ? { ok, message, url } : { ok, message }
}

/** Maps Zod issues to the flat field key used by the form components. */
export function formStateFromError(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form"
    fieldErrors[key] ??= issue.message
  }

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  }
}

export function formDataObject(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  )
}
