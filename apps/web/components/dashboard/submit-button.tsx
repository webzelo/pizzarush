"use client"

import type { ComponentProps } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string
}

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? <Spinner /> : null}
      {pending ? pendingLabel : children}
    </Button>
  )
}
