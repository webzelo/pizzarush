import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { dashboardPathForRole, type AccountRole } from "@/lib/auth/roles"

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() })
}

/**
 * Secure check used by every dashboard layout and server action. Proxy-level
 * checks are optimistic only; this is the source of truth.
 */
export async function requireUser() {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/sign-in")
  }

  if (session.user.banned) {
    redirect("/blocked")
  }

  return session
}

export async function requireRole(role: AccountRole) {
  const session = await requireUser()

  if (session.user.role !== role) {
    redirect(dashboardPathForRole(session.user.role))
  }

  return session
}
