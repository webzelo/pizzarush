import type { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  ShoppingBag,
  UtensilsCrossed,
  XCircle,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { OrderCard } from "@/components/dashboard/order-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { cancelOrder } from "@/lib/api/order-updates"
import { requireRole } from "@/lib/dal/session"
import { getCustomerOrderCounts, getRecentOrders } from "@/lib/data/orders"

export const metadata: Metadata = {
  title: "Customer dashboard",
}

export default async function CustomerOverviewPage() {
  const session = await requireRole("customer")
  const [counts, recentOrders] = await Promise.all([
    getCustomerOrderCounts(session.user.id),
    getRecentOrders({ customerId: session.user.id }, 3),
  ])

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.user.name}`}
        description="Track your orders and discover something new."
        actions={
          <Button render={<Link href="/menu" />}>
            <UtensilsCrossed />
            Browse menu
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={counts.total} icon={ShoppingBag} />
        <StatCard
          label="Pending"
          value={counts.pending}
          description="Waiting for the restaurant"
          icon={Clock}
          tone={counts.pending > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Accepted"
          value={counts.accepted}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          icon={XCircle}
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/customer/orders" />}
          >
            View all
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="Browse the menu and place your first order."
              action={
                <Button render={<Link href="/menu" />}>Browse menu</Button>
              }
            />
          ) : (
            recentOrders.map((order) => (
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
                      description="Pending orders can be cancelled. This cannot be undone."
                      confirmLabel="Cancel order"
                      variant="destructive"
                    />
                  ) : null
                }
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
