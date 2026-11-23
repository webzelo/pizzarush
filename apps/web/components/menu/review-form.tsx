"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import { SubmitButton } from "@/components/dashboard/submit-button"
import { initialFormState } from "@/lib/action-state"
import { submitMenuReview } from "@/lib/actions/reviews"

/** Customer review form. One review per item; resubmitting updates it. */
export function ReviewForm({ itemId }: { itemId: string }) {
  const [rating, setRating] = useState(5)
  const [state, formAction, pending] = useActionState(
    submitMenuReview.bind(null, itemId),
    initialFormState
  )
  const router = useRouter()

  useEffect(() => {
    if (state.status === "success") router.refresh()
  }, [state.status, router])

  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`rating-${itemId}`}>Your rating</FieldLabel>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Your rating"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="cursor-pointer">
                <input
                  id={value === 1 ? `rating-${itemId}` : undefined}
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  disabled={pending}
                  className="sr-only"
                />
                <Star
                  className={cn(
                    "size-7",
                    value <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  )}
                  aria-hidden="true"
                />
                <span className="sr-only">{value} stars</span>
              </label>
            ))}
          </div>
          <FieldError>{errors.rating}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor={`comment-${itemId}`}>Your review</FieldLabel>
          <Textarea
            id={`comment-${itemId}`}
            name="comment"
            rows={3}
            maxLength={500}
            placeholder="What did you like about this dish?"
          />
          <FieldError>{errors.comment}</FieldError>
        </Field>
      </FieldGroup>

      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Publishing…">Publish review</SubmitButton>
    </form>
  )
}
