import type { Metadata } from "next"
import Link from "next/link"
import { Store } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { MenuItemForm } from "@/components/vendor/menu-item-form"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"

export const metadata: Metadata = {
  title: "Add menu item",
}

export default async function NewMenuItemPage() {
  const session = await requireRole("vendor")
  const vendor = await getVendorByUserId(session.user.id)

  return (
    <>
      <PageHeader
        title="Add menu item"
        description="New items start as Pending until an admin approves them."
      />

      {!vendor ? (
        <EmptyState
          icon={Store}
          title="Create your restaurant profile first"
          description="We need your restaurant details before you can publish a menu item."
          action={
            <Button render={<Link href="/vendor/profile" />}>
              Set up profile
            </Button>
          }
        />
      ) : (
        <MenuItemForm />
      )}
    </>
  )
}
