import type { Metadata } from "next"

import { UserProfileForm } from "@/components/auth/user-profile-form"
import { PageHeader } from "@/components/dashboard/page-header"
import { requireRole } from "@/lib/dal/session"

export const metadata: Metadata = {
  title: "Profile settings",
}

export default async function CustomerProfilePage() {
  const session = await requireRole("customer")

  return (
    <>
      <PageHeader
        title="Profile settings"
        description="Update your account details and profile photo."
      />

      <UserProfileForm
        user={{ name: session.user.name, image: session.user.image }}
      />
    </>
  )
}
