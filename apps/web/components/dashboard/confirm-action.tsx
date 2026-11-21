"use client"

import type { ComponentProps } from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { useToastManager } from "@workspace/ui/components/toast"

import type { ActionResult } from "@/lib/action-state"

type ConfirmActionProps = {
  action: () => Promise<ActionResult>
  triggerLabel: string
  title: string
  description: string
  confirmLabel?: string
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
  icon?: LucideIcon
}

/** Confirmation dialog for one-off status changes (accept, reject, delete…). */
export function ConfirmAction({
  action,
  triggerLabel,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  size = "sm",
  icon: Icon,
}: ConfirmActionProps) {
  const router = useRouter()
  const toast = useToastManager()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await action()

      toast.add({
        title: result.ok ? "Done" : "Action failed",
        description: result.message,
        type: result.ok ? "success" : "error",
      })

      if (result.ok) {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant={variant} size={size} />}>
        {Icon ? <Icon /> : null}
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? <Spinner /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
