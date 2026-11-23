import type { Metadata } from "next"
import Link from "next/link"
import { UtensilsCrossed } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"

import { Container } from "@/components/container"
import { EmptyState } from "@/components/dashboard/empty-state"
import {
  FilterBar,
  type FilterDefinition,
} from "@/components/dashboard/filter-bar"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { MenuGrid } from "@/components/menu/menu-grid"
import { fetchMenuFilterOptions, fetchPublicMenu } from "@/lib/api/menu"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { getCurrentSession } from "@/lib/dal/session"
import { getFavoriteItemIds } from "@/lib/data/favorites"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Browse Menu",
  description: "Browse approved dishes from PizzaHub restaurants.",
}

type MenuSearchParams = {
  q?: string
  category?: string
  area?: string
  city?: string
  page?: string
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value ?? "1")
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<MenuSearchParams>
}) {
  const params = await searchParams
  const [menu, options, session] = await Promise.all([
    fetchPublicMenu({
      q: params.q,
      category: params.category,
      area: params.area,
      city: params.city,
      page: pageNumber(params.page),
    }),
    fetchMenuFilterOptions(),
    getCurrentSession(),
  ])

  const favoriteItemIds =
    session?.user.role === "customer"
      ? await getFavoriteItemIds(session.user.id)
      : undefined

  const filters: FilterDefinition[] = [
    {
      key: "category",
      label: "Category",
      allLabel: "All categories",
      options: CATEGORY_OPTIONS,
    },
  ]

  if (options.areas.length > 0) {
    filters.push({
      key: "area",
      label: "Location",
      allLabel: "All locations",
      options: options.areas.map((area) => ({ label: area, value: area })),
    })
  }

  // Only offer a city filter when the data actually spans several cities.
  if (options.cities.length > 1) {
    filters.push({
      key: "city",
      label: "City",
      allLabel: "All cities",
      options: options.cities.map((city) => ({ label: city, value: city })),
    })
  }

  const hasFilters = Boolean(
    params.q || params.category || params.area || params.city
  )

  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">Browse menu</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Find your next slice
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every dish below is approved by our team and available from its
          restaurant.
        </p>
      </div>

      <div className="mt-8">
        <FilterBar searchPlaceholder="Search dishes…" filters={filters} />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {menu.total} {menu.total === 1 ? "item" : "items"} found
      </p>

      {menu.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={UtensilsCrossed}
            title={
              hasFilters
                ? "No dishes match your search"
                : "No dishes available yet"
            }
            description={
              hasFilters
                ? "Try a different keyword or clear the filters to see everything."
                : "Approved dishes will appear here as soon as restaurants add them."
            }
            action={
              hasFilters ? (
                <Link
                  href="/menu"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-6">
          <MenuGrid items={menu.items} favoriteItemIds={favoriteItemIds} />
        </div>
      )}

      <div className="mt-8">
        <TablePagination
          page={menu.page}
          pageCount={menu.pageCount}
          total={menu.total}
          basePath="/menu"
          searchParams={params}
        />
      </div>
    </Container>
  )
}
