import type { Metadata } from "next"
import Link from "next/link"
import { UtensilsCrossed } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"

import { Container } from "@/components/container"
import { EmptyState } from "@/components/dashboard/empty-state"
import { FilterBar, type FilterDefinition } from "@/components/dashboard/filter-bar"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { MenuCard } from "@/components/menu/menu-card"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { getMenuFilterOptions, listPublicMenu } from "@/lib/data/menu"

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
  const [menu, options] = await Promise.all([
    listPublicMenu({
      q: params.q,
      category: params.category,
      area: params.area,
      city: params.city,
      page: pageNumber(params.page),
    }),
    getMenuFilterOptions(),
  ])

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
      label: "Area",
      allLabel: "All areas",
      options: options.areas.map((area) => ({ label: area, value: area })),
    })
  }

  if (options.cities.length > 0) {
    filters.push({
      key: "city",
      label: "City",
      allLabel: "All cities",
      options: options.cities.map((city) => ({ label: city, value: city })),
    })
  }

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
        <FilterBar
          searchPlaceholder="Search dishes…"
          filters={filters}
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {menu.total} {menu.total === 1 ? "item" : "items"} found
      </p>

      {menu.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={UtensilsCrossed}
            title="No dishes match your search"
            description="Try a different keyword or clear the filters to see everything."
            action={
              <Link href="/menu" className={buttonVariants({ variant: "outline" })}>
                Clear filters
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menu.items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
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
