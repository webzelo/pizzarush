import { useCallback } from "react"

import { useToastManager } from "@workspace/ui/components/toast"

import type { ActionResult, FormState } from "@/lib/action-state"

type ToastMessages = {
  success?: string
  error?: string
}

/** Shared toast layer for server actions and form state. */
export function useActionToast() {
  const toast = useToastManager()

  const actionResult = useCallback(
    (
      result: ActionResult,
      messages: ToastMessages & {
        successTitle?: string
        errorTitle?: string
      } = {}
    ) => {
      toast.add({
        title: result.ok
          ? (messages.successTitle ?? "Done")
          : (messages.errorTitle ?? "Action failed"),
        description: result.message,
        type: result.ok ? "success" : "error",
      })
    },
    [toast]
  )

  const formState = useCallback(
    (state: FormState, messages: ToastMessages = {}) => {
      if (state.status === "success") {
        toast.add({
          title: messages.success ?? "Saved",
          description: state.message,
          type: "success",
        })
      }

      if (state.status === "error") {
        toast.add({
          title: messages.error ?? "Action failed",
          description: state.message,
          type: "error",
        })
      }
    },
    [toast]
  )

  return { actionResult, formState }
}
