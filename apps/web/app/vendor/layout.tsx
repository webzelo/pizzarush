import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireRole } from "@/lib/dal/session"

export const dynamic = "force-dynamic"

export default async function VendorLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireRole("vendor")

  return (
    <DashboardShell
      role="vendor"
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
