"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Ban } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"

import { SubmitButton } from "@/components/dashboard/submit-button"
import { initialFormState } from "@/lib/action-state"
import { rejectMenuItem } from "@/lib/actions/admin"

type RejectMenuItemDialogProps = {
  itemId: string
  itemName: string
}

/** Rejection needs a reason, so it uses a small form dialog instead of a confirm. */
export function RejectMenuItemDialog({
  itemId,
  itemName,
}: RejectMenuItemDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(rejectMenuItem, initialFormState)

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Ban />
        Reject
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject “{itemName}”?</DialogTitle>
          <DialogDescription>
            Tell the vendor why this item was rejected. They can edit it and
            resubmit for review.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="itemId" value={itemId} />

          <Field>
            <FieldLabel htmlFor={`reason-${itemId}`}>Reason</FieldLabel>
            <Textarea
              id={`reason-${itemId}`}
              name="reason"
              rows={3}
              placeholder="e.g. The image does not match the dish."
            />
            <FieldError>{state.fieldErrors?.reason}</FieldError>
          </Field>

          {state.status === "error" ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton variant="destructive" pendingLabel="Rejecting…">
              Reject item
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
