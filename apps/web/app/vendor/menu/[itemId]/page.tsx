import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/dashboard/page-header"
import { MenuItemForm } from "@/components/vendor/menu-item-form"
import { requireRole } from "@/lib/dal/session"
import { getVendorMenuItem } from "@/lib/data/menu"

export const metadata: Metadata = {
  title: "Edit menu item",
}

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>
}) {
  const session = await requireRole("vendor")
  const { itemId } = await params
  const item = await getVendorMenuItem(session.user.id, itemId)

  if (!item) {
    notFound()
  }

  return (
    <>
      <PageHeader
        title="Edit menu item"
        description={
          item.status === "rejected"
            ? "Saving this rejected item sends it back for admin review."
            : "Changes to approved items are visible to customers immediately."
        }
      />
      <MenuItemForm item={item} />
    </>
  )
}
