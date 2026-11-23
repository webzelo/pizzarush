import { Skeleton } from "@workspace/ui/components/skeleton"

import { MenuCard } from "@/components/menu/menu-card"
import type { PublicMenuItem } from "@/lib/data/menu"

/** Shared so the real grid and its loading skeleton can never drift apart. */
export const MENU_GRID_CLASS = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"

export function MenuGrid({
  items,
  favoriteItemIds,
}: {
  items: PublicMenuItem[]
  /** Omit for logged-out visitors so the save button is not rendered. */
  favoriteItemIds?: string[]
}) {
  const favorites = new Set(favoriteItemIds)

  return (
    <div className={MENU_GRID_CLASS}>
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          isFavorite={favoriteItemIds ? favorites.has(item.id) : undefined}
        />
      ))}
    </div>
  )
}

export function MenuGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={MENU_GRID_CLASS} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <MenuCardSkeleton key={index} />
      ))}
    </div>
  )
}

function MenuCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-14 shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="mt-1 h-8 w-full" />
      </div>
    </div>
  )
}
