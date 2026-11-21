import type { LucideIcon } from "lucide-react"
import {
  ClipboardList,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  ShoppingBag,
  Store,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react"

import type { AccountRole } from "@/lib/auth/roles"

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
  /** Overview links should not stay active on nested routes. */
  exact?: boolean
}

export type DashboardNavSection = {
  label: string
  items: DashboardNavItem[]
}

export const dashboardRoleLabel: Record<AccountRole, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
}

export const dashboardNav: Record<AccountRole, DashboardNavSection[]> = {
  customer: [
    {
      label: "Orders",
      items: [
        {
          label: "Overview",
          href: "/customer",
          icon: LayoutDashboard,
          exact: true,
        },
        { label: "My Orders", href: "/customer/orders", icon: ShoppingBag },
      ],
    },
    {
      label: "Discover",
      items: [{ label: "Browse Menu", href: "/menu", icon: UtensilsCrossed }],
    },
  ],
  vendor: [
    {
      label: "Restaurant",
      items: [
        {
          label: "Overview",
          href: "/vendor",
          icon: LayoutDashboard,
          exact: true,
        },
        { label: "Restaurant Profile", href: "/vendor/profile", icon: Store },
        { label: "Add Menu Item", href: "/vendor/menu/new", icon: PlusCircle },
        { label: "My Menu Items", href: "/vendor/menu", icon: ListChecks },
      ],
    },
    {
      label: "Business",
      items: [
        { label: "Customer Orders", href: "/vendor/orders", icon: ClipboardList },
        { label: "Subscription", href: "/vendor/subscription", icon: CreditCard },
      ],
    },
  ],
  admin: [
    {
      label: "Platform",
      items: [
        {
          label: "Overview",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
        },
        { label: "Manage Users", href: "/admin/users", icon: Users },
        { label: "Manage Menu Items", href: "/admin/menu", icon: ListChecks },
        {
          label: "Transactions",
          href: "/admin/transactions",
          icon: DollarSign,
        },
      ],
    },
    {
      label: "Account",
      items: [{ label: "My Profile", href: "/dashboard", icon: User }],
    },
  ],
}

export function allNavItems(role: AccountRole) {
  return dashboardNav[role].flatMap((section) => section.items)
}

export function matchesNavHref(
  pathname: string,
  item: Pick<DashboardNavItem, "href" | "exact">
) {
  if (item.exact) {
    return pathname === item.href
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

/** The most specific match wins, so `/vendor/menu/new` highlights "Add". */
export function activeNavHref(pathname: string, role: AccountRole) {
  const matches = allNavItems(role).filter((item) =>
    matchesNavHref(pathname, item)
  )

  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null
}

export function currentNavItem(pathname: string, role: AccountRole) {
  const href = activeNavHref(pathname, role)
  return allNavItems(role).find((item) => item.href === href) ?? null
}
