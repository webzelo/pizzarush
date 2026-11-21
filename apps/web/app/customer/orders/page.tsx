import type { Metadata } from "next"
import { ShoppingBag } from "lucide-react"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { OrderCard } from "@/components/dashboard/order-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { cancelOrder } from "@/lib/actions/customer-orders"
import { ORDER_STATUSES } from "@/lib/constants"
import type { OrderStatus } from "@/lib/collections"
import { requireRole } from "@/lib/dal/session"
import { listCustomerOrders } from "@/lib/data/orders"

export const metadata: Metadata = {
  title: "My orders",
}

type OrdersSearchParams = {
  status?: string
  page?: string
  placed?: string
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value ?? "1")
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

function statusFilter(value: string | undefined) {
  return ORDER_STATUSES.find((status) => status === value)
}

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrdersSearchParams>
}) {
  const session = await requireRole("customer")
  const params = await searchParams
  const orders = await listCustomerOrders(session.user.id, {
    status: statusFilter(params.status) as OrderStatus | undefined,
    page: pageNumber(params.page),
  })

  return (
    <>
      <PageHeader
        title="My orders"
        description="View the details of each request and cancel while it is still pending."
      />

      {params.placed ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          Order placed. The restaurant will accept or reject it soon.
        </p>
      ) : null}

      <FilterBar
        showSearch={false}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All statuses",
            options: [
              { label: "Pending", value: "pending" },
              { label: "Accepted", value: "accepted" },
              { label: "Rejected", value: "rejected" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
        ]}
      />

      {orders.orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="Orders you place will appear here with their current status."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              perspective="customer"
              detailsHref={`/customer/orders/${order.id}`}
              actions={
                order.status === "pending" ? (
                  <ConfirmAction
                    action={cancelOrder.bind(null, order.id)}
                    triggerLabel="Cancel order"
                    title="Cancel this order?"
                    description="Only pending orders can be cancelled. This cannot be undone."
                    confirmLabel="Cancel order"
                    variant="destructive"
                  />
                ) : null
              }
            />
          ))}
        </div>
      )}

      <TablePagination
        page={orders.page}
        pageCount={orders.pageCount}
        total={orders.total}
        basePath="/customer/orders"
        searchParams={params}
      />
    </>
  )
}
