import type { Metadata } from "next"

import { PageHeader } from "@/components/dashboard/page-header"
import { VendorProfileForm } from "@/components/vendor/vendor-profile-form"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"

export const metadata: Metadata = {
  title: "Restaurant profile",
}

type ProfileSearchParams = {
  saved?: string
  setup?: string
}

export default async function VendorProfilePage({
  searchParams,
}: {
  searchParams: Promise<ProfileSearchParams>
}) {
  const session = await requireRole("vendor")
  const [vendor, params] = await Promise.all([
    getVendorByUserId(session.user.id),
    searchParams,
  ])

  // Convert MongoDB document into a plain JSON-compatible object.
  const serializedVendor = vendor
    ? JSON.parse(JSON.stringify(vendor))
    : null

  return (
    <>
      <PageHeader
        title={vendor ? "Restaurant profile" : "Create your restaurant profile"}
        description="This information appears on your public menu items and customer orders."
      />

      {params.saved ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          Restaurant profile saved.
        </p>
      ) : null}

      {!vendor && params.setup ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          Create your profile first. It is required before adding menu items.
        </p>
      ) : null}

      <VendorProfileForm
        vendor={JSON.parse(JSON.stringify(vendor))}
      />
    </>
  )
}
