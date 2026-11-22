import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { dashboardPathForRole, type AccountRole } from "@/lib/auth/roles"
import { signInHref } from "@/lib/redirects"

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() })
}

/**
 * Secure check used by every dashboard layout and server action. Proxy-level
 * checks are optimistic only; this is the source of truth.
 *
 * `nextPath` is where the user should land after signing in (for example the
 * menu item they clicked while logged out).
 */
export async function requireUser(nextPath?: string) {
  const session = await getCurrentSession()

  if (!session) {
    redirect(signInHref(nextPath))
  }

  if (session.user.banned) {
    redirect("/blocked")
  }

  return session
}

export async function requireRole(role: AccountRole, nextPath?: string) {
  const session = await requireUser(nextPath)

  if (session.user.role !== role) {
    redirect(dashboardPathForRole(session.user.role))
  }

  return session
}
