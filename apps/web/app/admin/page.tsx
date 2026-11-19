import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { PagePlaceholder } from "@/components/page-placeholder"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * Admin access is never granted through public registration: the role is
 * normalized on every user creation path and the field validator rejects it.
 * This page only guards rendering for accounts promoted out-of-band.
 */
export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <PagePlaceholder
      title="Admin"
      description="Admin tools are not built yet. This area is restricted to accounts promoted outside the public sign-up flow."
    />
  )
}
