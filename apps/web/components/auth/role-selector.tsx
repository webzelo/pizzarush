import { cn } from "@workspace/ui/lib/utils"

import type { PublicRole, RoleOption } from "@/lib/auth/roles"

type RoleSelectorProps = {
  options: RoleOption[]
  value: PublicRole
  onChange: (value: PublicRole) => void
  name?: string
  legend?: string
  error?: string
}

export function RoleSelector({
  options,
  value,
  onChange,
  name = "role",
  legend = "Account type",
  error,
}: RoleSelectorProps) {
  const errorId = error ? `${name}-error` : undefined

  return (
    <fieldset aria-describedby={errorId}>
      <legend className="text-sm font-medium">{legend}</legend>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon
          const selected = option.value === value

          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-describedby={errorId}
                className="sr-only"
              />

              <Icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  selected ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />

              <span className="space-y-1">
                <span className="block text-sm font-medium">
                  {option.label}
                </span>
                <span className="block text-xs leading-5 text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          )
        })}
      </div>

      {error ? (
        <p id={errorId} className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
