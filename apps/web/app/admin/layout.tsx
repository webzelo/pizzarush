import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireRole } from "@/lib/dal/session"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireRole("admin")

  return (
    <DashboardShell
      role="admin"
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
