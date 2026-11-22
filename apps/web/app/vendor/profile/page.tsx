import type { Metadata } from "next"

import { UserProfileForm } from "@/components/auth/user-profile-form"
import { PageHeader } from "@/components/dashboard/page-header"
import { VendorProfileForm } from "@/components/vendor/vendor-profile-form"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"

export const metadata: Metadata = {
  title: "Profile settings",
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

  // Pass only plain fields: MongoDB ObjectIds and Dates are not serializable
  // across the Server → Client Component boundary.
  const profileValues = vendor
    ? {
        restaurantName: vendor.restaurantName,
        cuisine: vendor.cuisine,
        description: vendor.description,
        phone: vendor.phone,
        address: vendor.address,
        area: vendor.area,
        city: vendor.city,
        logoUrl: vendor.logoUrl,
        coverUrl: vendor.coverUrl,
      }
    : null

  return (
    <>
      <PageHeader
        title="Profile settings"
        description="Manage your account details and your restaurant profile."
      />

      {params.saved ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          Restaurant profile saved.
        </p>
      ) : null}

      {!vendor && params.setup ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          Create your restaurant profile first. It is required before adding
          menu items.
        </p>
      ) : null}

      <section id="account" className="mt-6 grid scroll-mt-20 gap-4">
        <div>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">
            Your personal details and photo.
          </p>
        </div>
        <UserProfileForm
          user={{ name: session.user.name, image: session.user.image }}
        />
      </section>

      <section className="mt-12 grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Restaurant</h2>
          <p className="text-sm text-muted-foreground">
            This information appears on your public menu items and customer
            orders.
          </p>
        </div>
        <VendorProfileForm vendor={profileValues} />
      </section>
    </>
  )
}
