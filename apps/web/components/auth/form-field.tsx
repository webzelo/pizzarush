import type { ComponentProps, ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

export const fieldInputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30"

export type FormFieldProps = Omit<ComponentProps<"input">, "name"> & {
  name: string
  label: string
  hint?: string
  error?: string
  startIcon?: ReactNode
  endSlot?: ReactNode
  containerClassName?: string
}

export function FormField({
  name,
  id,
  label,
  hint,
  error,
  startIcon,
  endSlot,
  className,
  containerClassName,
  ...props
}: FormFieldProps) {
  const fieldId = id ?? name
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        {startIcon ? (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
            {startIcon}
          </span>
        ) : null}

        <input
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldInputClassName,
            startIcon && "pl-9",
            endSlot && "pr-11",
            className
          )}
          {...props}
        />

        {endSlot ? (
          <span className="absolute top-1/2 right-1 -translate-y-1/2">
            {endSlot}
          </span>
        ) : null}
      </div>

      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
