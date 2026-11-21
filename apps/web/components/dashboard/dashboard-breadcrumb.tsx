"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

import type { AccountRole } from "@/lib/auth/roles"
import {
  currentNavItem,
  dashboardRoleLabel,
  dashboardNav,
} from "@/lib/dashboard/nav"

export function DashboardBreadcrumb({ role }: { role: AccountRole }) {
  const pathname = usePathname()
  const item = currentNavItem(pathname, role)
  const homeHref = dashboardNav[role][0]?.items[0]?.href ?? "/"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:block">
          <BreadcrumbLink render={<Link href={homeHref} />}>
            {dashboardRoleLabel[role]}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{item?.label ?? "Overview"}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
