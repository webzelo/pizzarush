"use client"

import { useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

import { UserAvatar } from "@/components/auth/user-avatar"
import { authClient, useSession } from "@/lib/auth-client"
import { dashboardPathForRole, profilePathForRole } from "@/lib/auth/roles"
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
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const user = session?.user

  if (isPending) {
    return <AccountNavSkeleton variant={variant} />
  }

  if (!user) {
    return <SignedOutLinks variant={variant} onNavigate={onNavigate} />
  }

  const dashboardHref = dashboardPathForRole(user.role)
  const profileHref = profilePathForRole(user.role)
  const profileLabel =
    user.role === "admin" ? "Admin settings" : "Profile settings"

  const handleSignOut = async () => {
    setSigningOut(true)

    try {
      await authClient.signOut()
      onNavigate?.()
      router.push("/")
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        openOnHover
        delay={150}
        closeDelay={150}
        aria-label={`Open account menu for ${user.name}`}
        className={cn(
          "flex items-center gap-2 rounded-md text-sm font-medium transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          variant === "inline" && "px-1 py-1",
          variant === "compact" && "rounded-full",
          variant === "menu" &&
            "w-full rounded-md px-3 py-2 text-foreground hover:bg-muted"
        )}
      >
        <UserAvatar name={user.name} image={user.image} />
        {variant !== "compact" ? (
          <span
            className={cn(
              "truncate",
              variant === "menu" ? "max-w-40" : "max-w-32"
            )}
          >
            {user.name}
          </span>
        ) : null}
        {variant !== "compact" ? (
          <ChevronDown className="ml-auto size-4 text-muted-foreground" />
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={variant === "menu" ? "start" : "end"}
        sideOffset={8}
        className="w-60"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 py-2">
            <UserAvatar
              name={user.name}
              image={user.image}
              className="size-8"
            />
            <span className="grid min-w-0 flex-1">
              <span className="truncate text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href={dashboardHref} onClick={onNavigate} />}
        >
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={profileHref} onClick={onNavigate} />}
        >
          <UserRound />
          {profileLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signingOut}
          variant="destructive"
        >
          <LogOut />
          {signingOut ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
