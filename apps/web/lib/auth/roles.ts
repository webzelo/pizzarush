import type { LucideIcon } from "lucide-react"
import { ShoppingBag, Store } from "lucide-react"

/**
 * Roles a user is allowed to pick during public registration.
 * `admin` is intentionally excluded: it can only be assigned out-of-band.
 */
export const publicRoles = ["customer", "vendor"] as const

export type PublicRole = (typeof publicRoles)[number]

export type AccountRole = PublicRole | "admin"

export type RoleOption = {
  value: PublicRole
  label: string
  description: string
  icon: LucideIcon
}

export const roleOptions: RoleOption[] = [
  {
    value: "customer",
    label: "Customer",
    description: "Browse the menu, place orders, and track delivery.",
    icon: ShoppingBag,
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "Run a restaurant and manage your menu and orders.",
    icon: Store,
  },
]

export function isPublicRole(value: unknown): value is PublicRole {
  return (
    typeof value === "string" &&
    (publicRoles as readonly string[]).includes(value)
  )
}

export function isAccountRole(value: unknown): value is AccountRole {
  return value === "admin" || isPublicRole(value)
}

/** Where a signed-in user should land, based on their role. */
export function dashboardPathForRole(role?: string | null) {
  if (role === "admin") return "/admin"
  if (role === "vendor") return "/vendor"
  return "/customer"
}

/** Profile/settings destination that exists for each role. */
export function profilePathForRole(role?: string | null) {
  if (role === "vendor") return "/vendor/profile"
  if (role === "admin") return "/admin"
  return "/customer/profile"
}
