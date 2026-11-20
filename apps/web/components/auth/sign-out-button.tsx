"use client"

import type { VariantProps } from "class-variance-authority"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button, buttonVariants } from "@workspace/ui/components/button"

import { authClient } from "@/lib/auth-client"

type SignOutButtonProps = VariantProps<typeof buttonVariants> & {
  className?: string
  /** Called after the session is cleared, e.g. to close a mobile menu. */
  onSignedOut?: () => void
}

export function SignOutButton({
  variant = "outline",
  size,
  className,
  onSignedOut,
}: SignOutButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleSignOut = async () => {
    setPending(true)
    await authClient.signOut()
    onSignedOut?.()
    router.push("/")
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={pending}
    >
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  )
}
