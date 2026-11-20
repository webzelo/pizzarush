"use client"

import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

type UserAvatarProps = {
  name: string
  image?: string | null
  className?: string
  /**
   * Decorative by default. The link or button around the avatar should carry
   * the accessible name.
   */
  alt?: string
}

/** "Jane Doe" -> "JD", "PizzaHub" -> "P" */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""

  return `${first}${last}`.toUpperCase()
}

/**
 * Renders the user's profile image with an initials fallback, including when
 * the image URL is missing or fails to load.
 */
export function UserAvatar({
  name,
  image,
  className,
  alt = "",
}: UserAvatarProps) {
  const [brokenFor, setBrokenFor] = useState<string | null>(null)
  const src = image?.trim() ?? ""
  const showImage = src !== "" && brokenFor !== src

  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xs font-semibold text-muted-foreground",
        className
      )}
    >
      {showImage ? (
        // Profile images are user-provided, so a plain img avoids
        // next/image remotePatterns configuration.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setBrokenFor(src)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}
