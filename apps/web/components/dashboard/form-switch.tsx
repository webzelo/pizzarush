"use client"

import { useState } from "react"

import { Switch } from "@workspace/ui/components/switch"

type FormSwitchProps = {
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}

/** Switch that always submits an explicit "true" or "false" value. */
export function FormSwitch({
  name,
  label,
  description,
  defaultChecked = true,
}: FormSwitchProps) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        aria-label={label}
      />
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
    </div>
  )
}
