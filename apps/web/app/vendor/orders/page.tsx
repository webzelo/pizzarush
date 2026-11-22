import type { Metadata } from "next"
import { ClipboardList } from "lucide-react"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { MarkOrderPaid } from "@/components/dashboard/mark-order-paid"
import { OrderCard } from "@/components/dashboard/order-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { acceptOrder, rejectOrder } from "@/lib/actions/vendor-orders"
import { ORDER_STATUSES } from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { listVendorOrders } from "@/lib/data/orders"
import type { OrderStatus } from "@/lib/collections"

export const metadata: Metadata = {
  title: "Customer orders",
}

type OrdersSearchParams = {
  status?: string
  page?: string
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value ?? "1")
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

function statusFilter(value: string | undefined) {
  return ORDER_STATUSES.find((status) => status === value)
}

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrdersSearchParams>
}) {
  const session = await requireRole("vendor")
  const params = await searchParams
  const orders = await listVendorOrders(session.user.id, {
    status: statusFilter(params.status) as OrderStatus | undefined,
    page: pageNumber(params.page),
  })

  return (
    <>
      <PageHeader
        title="Customer orders"
        description="Orders are scoped to your restaurant. Accept or reject requests that are still pending."
      />

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
          icon={ClipboardList}
          title="No orders here"
          description="When customers order from your menu, their requests appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              perspective="vendor"
              actions={
                order.status === "pending" ? (
                  <>
                    {order.paymentStatus === "pending" ? (
                      <MarkOrderPaid orderId={order.id} />
                    ) : null}
                    <ConfirmAction
                      action={rejectOrder.bind(null, order.id)}
                      triggerLabel="Reject"
                      title="Reject this order?"
                      description="The customer will see the order as rejected."
                      confirmLabel="Reject order"
                      variant="destructive"
                    />
                    <ConfirmAction
                      action={acceptOrder.bind(null, order.id)}
                      triggerLabel="Accept"
                      title="Accept this order?"
                      description="The customer will see the order as accepted."
                      confirmLabel="Accept order"
                    />
                  </>
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
        basePath="/vendor/orders"
        searchParams={params}
      />
    </>
  )
}
