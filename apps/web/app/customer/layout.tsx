import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireRole } from "@/lib/dal/session"

export const dynamic = "force-dynamic"

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireRole("customer")

  return (
    <DashboardShell
      role="customer"
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardShell>
  )
}
