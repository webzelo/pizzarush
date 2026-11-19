"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"

import { FormField } from "@/components/auth/form-field"
import { isHttpUrl } from "@/lib/auth/validation"

type ProfileImageFieldProps = {
  name?: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export function ProfileImageField({
  name = "image",
  label = "Profile image (optional)",
  value,
  onChange,
  error,
}: ProfileImageFieldProps) {
  const [brokenFor, setBrokenFor] = useState<string | null>(null)
  const preview = isHttpUrl(value) && brokenFor !== value

  return (
    <div className="flex items-end gap-3">
      <FormField
        containerClassName="flex-1"
        name={name}
        label={label}
        type="url"
        inputMode="url"
        placeholder="https://example.com/me.jpg"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        hint="Paste an image link, or skip this step."
        startIcon={<ImageIcon className="size-4" aria-hidden="true" />}
      />

      <div className="mb-6 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
        {preview ? (
          // Remote URLs are user-provided, so a plain img avoids next/image
          // remotePatterns configuration.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.trim()}
            alt="Profile preview"
            className="size-full object-cover"
            onError={() => setBrokenFor(value)}
          />
        ) : (
          <ImageIcon
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
