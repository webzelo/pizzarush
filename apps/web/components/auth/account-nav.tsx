"use client"

import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { UserAvatar } from "@/components/auth/user-avatar"
import { useSession } from "@/lib/auth-client"
import { authNav } from "@/lib/site-config"

type AccountNavVariant = "inline" | "compact" | "menu"

type AccountNavProps = {
  variant?: AccountNavVariant
  /** Lets the mobile menu close itself when an item is used. */
  onNavigate?: () => void
}

const menuItemClassName =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

/**
 * Session-aware account area for the navbar. Better Auth refreshes its session
 * store after sign-in, sign-up and sign-out, so this updates without a reload.
 */
export function AccountNav({
  variant = "inline",
  onNavigate,
}: AccountNavProps) {
  const { data: session, isPending } = useSession()
  const user = session?.user

  if (isPending) {
    return <AccountNavSkeleton variant={variant} />
  }

  if (!user) {
    return <SignedOutLinks variant={variant} onNavigate={onNavigate} />
  }

  if (variant === "compact") {
    return (
      <Link
        href="/dashboard"
        onClick={onNavigate}
        aria-label={`Your account (${user.name})`}
        className="rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <UserAvatar name={user.name} image={user.image} />
      </Link>
    )
  }

  if (variant === "menu") {
    return (
      <div className="flex flex-col gap-1 border-t pt-3">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(menuItemClassName, "text-foreground")}
        >
          <UserAvatar name={user.name} image={user.image} />
          <span className="truncate">{user.name}</span>
        </Link>
        <SignOutButton
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onSignedOut={onNavigate}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        aria-label={`Your account (${user.name})`}
        className="flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium transition-colors hover:text-foreground"
      >
        <UserAvatar name={user.name} image={user.image} />
        <span className="max-w-32 truncate">{user.name}</span>
      </Link>
      <SignOutButton variant="ghost" size="sm" />
    </div>
  )
}

function SignedOutLinks({
  variant,
  onNavigate,
}: {
  variant: AccountNavVariant
  onNavigate?: () => void
}) {
  if (variant === "compact") {
    return (
      <Link
        href={authNav.signUp.href}
        onClick={onNavigate}
        className={buttonVariants({ size: "sm" })}
      >
        {authNav.signUp.label}
      </Link>
    )
  }

  if (variant === "menu") {
    return (
      <div className="flex flex-col gap-1 border-t pt-3">
        <Link
          href={authNav.signIn.href}
          onClick={onNavigate}
          className={menuItemClassName}
        >
          {authNav.signIn.label}
        </Link>
        <Link
          href={authNav.signUp.href}
          onClick={onNavigate}
          className={menuItemClassName}
        >
          {authNav.signUp.label}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={authNav.signIn.href}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-muted-foreground"
        )}
      >
        {authNav.signIn.label}
      </Link>
      <Link
        href={authNav.signUp.href}
        className={buttonVariants({ size: "sm" })}
      >
        {authNav.signUp.label}
      </Link>
    </div>
  )
}

function AccountNavSkeleton({ variant }: { variant: AccountNavVariant }) {
  if (variant === "compact") {
    return (
      <span
        className="size-8 animate-pulse rounded-full bg-muted"
        aria-hidden="true"
      />
    )
  }

  if (variant === "menu") {
    return (
      <span
        className="h-9 animate-pulse rounded-md bg-muted"
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <span className="size-8 animate-pulse rounded-full bg-muted" />
      <span className="h-7 w-20 animate-pulse rounded-md bg-muted" />
    </div>
  )
}
