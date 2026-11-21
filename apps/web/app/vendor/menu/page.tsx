import type { Metadata } from "next"
import Link from "next/link"
import { PlusCircle, Store, UtensilsCrossed } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { FilterBar, type FilterDefinition } from "@/components/dashboard/filter-bar"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { deleteMenuItem, toggleMenuItemAvailability } from "@/lib/actions/vendor-menu"
import { FREE_ACTIVE_ITEM_LIMIT, MENU_STATUSES } from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"
import {
  countActiveItemsForLimit,
  listVendorMenu,
} from "@/lib/data/menu"
import { formatCurrency } from "@/lib/format"
import type { MenuItemStatus } from "@/lib/collections"
import { isPremiumActive } from "@/lib/plans"

export const metadata: Metadata = {
  title: "My menu items",
}

type MenuSearchParams = {
  status?: string
  page?: string
  created?: string
  updated?: string
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value ?? "1")
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

function statusFilter(value: string | undefined) {
  return MENU_STATUSES.find((status) => status === value)
}

const statusOptions: FilterDefinition = {
  key: "status",
  label: "Status",
  allLabel: "All statuses",
  options: [
    { label: "Pending review", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ],
}

export default async function VendorMenuPage({
  searchParams,
}: {
  searchParams: Promise<MenuSearchParams>
}) {
  const session = await requireRole("vendor")
  const params = await searchParams
  const vendor = await getVendorByUserId(session.user.id)

  const [menu, activeCount] = await Promise.all([
    listVendorMenu(session.user.id, {
      status: statusFilter(params.status) as MenuItemStatus | undefined,
      page: pageNumber(params.page),
    }),
    countActiveItemsForLimit(session.user.id),
  ])

  const premium = isPremiumActive(vendor)

  return (
    <>
      <PageHeader
        title="My menu items"
        description="Only approved and available items are visible to customers."
        actions={
          <Button render={<Link href="/vendor/menu/new" />}>
            <PlusCircle />
            Add menu item
          </Button>
        }
      />

      {params.created ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          Menu item submitted. An admin will review it before it goes live.
        </p>
      ) : null}

      {params.updated ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          Menu item updated.
        </p>
      ) : null}

      {!premium ? (
        <p className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <span>
            Free plan: {activeCount} of {FREE_ACTIVE_ITEM_LIMIT} active slots
            used.
          </span>
          <Link href="/vendor/subscription" className="font-medium underline">
            Upgrade to Premium
          </Link>
          <span>for unlimited items.</span>
        </p>
      ) : null}

      <FilterBar filters={[statusOptions]} />

      {menu.items.length === 0 ? (
        <EmptyState
          icon={vendor ? UtensilsCrossed : Store}
          title={vendor ? "No menu items yet" : "Create your profile first"}
          description={
            vendor
              ? "Add your first dish. It will be reviewed by an admin before customers see it."
              : "Your restaurant profile is required before you can add menu items."
          }
          action={
            <Button
              render={
                <Link href={vendor ? "/vendor/menu/new" : "/vendor/profile"} />
              }
            >
              {vendor ? "Add menu item" : "Set up profile"}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {menu.items.map((item) => (
            <Card key={item.id} className="gap-0 overflow-hidden pt-0">
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                {/* Uploaded images are user-provided, so a plain img avoids remotePatterns. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-full object-cover"
                />
              </div>
              <CardContent className="flex flex-1 flex-col gap-3 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.category} · {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={item.status} />
                    <Badge variant="outline">
                      {item.isActive ? "Available" : "Hidden"}
                    </Badge>
                  </div>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.area}, {item.city}
                </p>

                {item.status === "rejected" && item.rejectionReason ? (
                  <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                    Rejected: {item.rejectionReason}
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/vendor/menu/${item.id}`} />}
                  >
                    Edit
                  </Button>
                  <ConfirmAction
                    action={toggleMenuItemAvailability.bind(null, item.id)}
                    triggerLabel={item.isActive ? "Hide" : "Show"}
                    title={
                      item.isActive
                        ? "Hide this item?"
                        : "Make this item available?"
                    }
                    description={
                      item.isActive
                        ? "Customers will no longer see or order this item."
                        : "Customers will be able to see and order this item once it is approved."
                    }
                    confirmLabel={item.isActive ? "Hide item" : "Show item"}
                    variant="outline"
                  />
                  <ConfirmAction
                    action={deleteMenuItem.bind(null, item.id)}
                    triggerLabel="Delete"
                    title="Delete this menu item?"
                    description="This cannot be undone. Existing orders keep their item details."
                    confirmLabel="Delete item"
                    variant="destructive"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TablePagination
        page={menu.page}
        pageCount={menu.pageCount}
        total={menu.total}
        basePath="/vendor/menu"
        searchParams={params}
      />
    </>
  )
}
