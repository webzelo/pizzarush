import type { Metadata } from "next"
import { Heart } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { MenuGrid } from "@/components/menu/menu-grid"
import { fetchPublicMenuItem } from "@/lib/api/menu"
import { requireRole } from "@/lib/dal/session"
import { getFavoriteItemIds } from "@/lib/data/favorites"

export const metadata: Metadata = {
  title: "Favourites",
}

export default async function CustomerFavoritesPage() {
  const session = await requireRole("customer")
  const itemIds = await getFavoriteItemIds(session.user.id)

  const items = (
    await Promise.all(
      itemIds.map((id) => fetchPublicMenuItem(id).catch(() => null))
    )
  ).filter((item) => item !== null)

  return (
    <>
      <PageHeader
        title="Favourites"
        description="Dishes you saved from the public menu. Tap the heart again to remove one."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Browse the menu and save dishes you want to order later."
        />
      ) : (
        <MenuGrid items={items} favoriteItemIds={itemIds} />
      )}
    </>
  )
}
