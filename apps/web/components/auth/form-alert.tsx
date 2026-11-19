import type { ReactNode } from "react"
import { CircleAlert, CircleCheck } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type FormAlertProps = {
  tone: "error" | "success"
  children: ReactNode
  className?: string
}

export function FormAlert({ tone, children, className }: FormAlertProps) {
  const isError = tone === "error"
  const Icon = isError ? CircleAlert : CircleCheck

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        isError
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-foreground",
        className
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          isError ? "text-destructive" : "text-primary"
        )}
        aria-hidden="true"
      />
      <p>{children}</p>
    </div>
  )
}
