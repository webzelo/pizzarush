"use client"

import { useState } from "react"
import { Check, Eye, EyeOff } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import type { FormFieldProps } from "@/components/auth/form-field"
import { FormField } from "@/components/auth/form-field"
import type { PasswordCheck } from "@/lib/auth/password"

type PasswordFieldProps = Omit<FormFieldProps, "type" | "endSlot"> & {
  checks?: PasswordCheck[]
}

export function PasswordField({ checks, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <FormField
        {...props}
        type={visible ? "text" : "password"}
        endSlot={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        }
      />

      {checks ? <PasswordRules checks={checks} /> : null}
    </div>
  )
}

export function PasswordRules({ checks }: { checks: PasswordCheck[] }) {
  return (
    <ul className="grid gap-1">
      {checks.map((rule) => (
        <li
          key={rule.id}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            rule.passed ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {rule.passed ? (
            <Check className="size-3.5 text-primary" aria-hidden="true" />
          ) : (
            <span
              className="size-3.5 rounded-full border border-muted-foreground/40"
              aria-hidden="true"
            />
          )}
          {rule.label}
          <span className="sr-only">{rule.passed ? "(met)" : "(not met)"}</span>
        </li>
      ))}
    </ul>
  )
}
