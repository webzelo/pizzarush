import type { Metadata } from "next"
import { Check, ListChecks, RotateCcw, Trash2 } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { RejectMenuItemDialog } from "@/components/admin/reject-menu-item-dialog"
import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { FilterBar, type FilterDefinition } from "@/components/dashboard/filter-bar"
import { PageHeader } from "@/components/dashboard/page-header"
import { PremiumBadge } from "@/components/dashboard/premium-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { TablePagination } from "@/components/dashboard/table-pagination"
import {
  deleteMenuItemAsAdmin,
  setMenuItemStatus,
} from "@/lib/actions/admin"
import { MENU_STATUSES } from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { listAdminMenuItems } from "@/lib/data/admin"
import { formatCurrency, formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Manage menu items",
}

type MenuSearchParams = {
  q?: string
  status?: string
  page?: string
}

const statusFilter: FilterDefinition = {
  key: "status",
  label: "Status",
  allLabel: "All statuses",
  options: [
    { label: "Pending review", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ],
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value ?? "1")
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<MenuSearchParams>
}) {
  await requireRole("admin")
  const params = await searchParams
  const menu = await listAdminMenuItems({
    q: params.q,
    status: MENU_STATUSES.find((status) => status === params.status),
    page: pageNumber(params.page),
  })

  return (
    <>
      <PageHeader
        title="Manage menu items"
        description="Approve, reject, reset or remove items from any restaurant. Customers only see approved and available items."
      />

      <FilterBar searchPlaceholder="Search items…" filters={[statusFilter]} />

      {menu.items.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No menu items found"
          description="Try a different search term or clear the status filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menu.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Uploaded images are user-provided, so a plain img avoids remotePatterns. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="size-11 shrink-0 rounded-lg border object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.category}
                          {item.isActive ? "" : " · Hidden"}
                        </p>
                        {item.status === "rejected" && item.rejectionReason ? (
                          <p className="mt-0.5 truncate text-xs text-destructive">
                            {item.rejectionReason}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{item.vendorName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.vendorEmail}
                      </span>
                      {item.premium ? <PremiumBadge /> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={item.status} />
                      <Badge variant="outline">
                        {item.isActive ? "Available" : "Hidden"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      {item.status !== "approved" ? (
                        <ConfirmAction
                          action={setMenuItemStatus.bind(
                            null,
                            item.id,
                            "approved"
                          )}
                          triggerLabel="Approve"
                          title={`Approve ${item.name}?`}
                          description="The item becomes visible to customers as soon as the vendor marks it available."
                          confirmLabel="Approve item"
                          icon={Check}
                        />
                      ) : null}

                      {item.status !== "rejected" ? (
                        <RejectMenuItemDialog
                          itemId={item.id}
                          itemName={item.name}
                        />
                      ) : null}

                      {item.status !== "pending" ? (
                        <ConfirmAction
                          action={setMenuItemStatus.bind(
                            null,
                            item.id,
                            "pending"
                          )}
                          triggerLabel="Reset"
                          title={`Send ${item.name} back for review?`}
                          description="The item returns to the pending queue and is hidden from customers."
                          confirmLabel="Reset to pending"
                          variant="outline"
                          icon={RotateCcw}
                        />
                      ) : null}

                      <ConfirmAction
                        action={deleteMenuItemAsAdmin.bind(null, item.id)}
                        triggerLabel="Delete"
                        title={`Delete ${item.name}?`}
                        description="This permanently removes the item. Existing orders keep their snapshot details."
                        confirmLabel="Delete item"
                        variant="destructive"
                        icon={Trash2}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination
        page={menu.page}
        pageCount={menu.pageCount}
        total={menu.total}
        basePath="/admin/menu"
        searchParams={params}
      />
    </>
  )
}
