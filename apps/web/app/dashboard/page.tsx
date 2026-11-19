import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { dashboardPathForRole } from "@/lib/auth/roles"

export const dynamic = "force-dynamic"

/**
 * Single landing point after email or Google authentication. Keeps the OAuth
 * callbackURL static while still routing each role to the right place.
 */
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/sign-in")
  }

  redirect(dashboardPathForRole(session.user.role))
}
