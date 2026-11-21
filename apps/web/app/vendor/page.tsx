import type { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  CreditCard,
  ListChecks,
  PlusCircle,
  Store,
  UtensilsCrossed,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { OrderCard } from "@/components/dashboard/order-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { PremiumBadge } from "@/components/dashboard/premium-badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { acceptOrder, rejectOrder } from "@/lib/actions/vendor-orders"
import { FREE_ACTIVE_ITEM_LIMIT } from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"
import { getRecentOrders } from "@/lib/data/orders"
import { getVendorDashboard } from "@/lib/data/vendors"
import { formatDate } from "@/lib/format"
import { planFeatures } from "@/lib/plans"

export const metadata: Metadata = {
  title: "Vendor dashboard",
}

export default async function VendorOverviewPage() {
  const session = await requireRole("vendor")
  const [vendor, dashboard] = await Promise.all([
    getVendorByUserId(session.user.id),
    getVendorDashboard(session.user.id),
  ])

  if (!vendor) {
    return (
      <>
        <PageHeader
          title={`Welcome, ${session.user.name}`}
          description="Set up your restaurant profile to start adding menu items and receiving orders."
        />
        <EmptyState
          icon={Store}
          title="Create your restaurant profile"
          description="Tell customers who you are, where you cook, and how to reach you."
          action={
            <Button render={<Link href="/vendor/profile" />}>
              Set up profile
            </Button>
          }
        />
      </>
    )
  }

  const pendingOrders = await getRecentOrders(
    { vendorId: session.user.id, status: "pending" },
    3
  )

  return (
    <>
      <PageHeader
        title={`Welcome, ${vendor.restaurantName}`}
        description="A snapshot of your menu and the orders waiting for you."
        actions={
          <>
            <Button variant="outline" render={<Link href="/vendor/menu" />}>
              My menu
            </Button>
            <Button render={<Link href="/vendor/menu/new" />}>
              <PlusCircle />
              Add menu item
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total menu items"
          value={dashboard.totalItems}
          icon={ListChecks}
        />
        <StatCard
          label="Active menu items"
          value={dashboard.activeItems}
          description={
            dashboard.premium
              ? "Unlimited on Premium"
              : `${dashboard.activeItems} of ${FREE_ACTIVE_ITEM_LIMIT} active slots used`
          }
          icon={UtensilsCrossed}
          tone="success"
        />
        <StatCard
          label="Pending orders"
          value={dashboard.pendingOrders}
          description="Waiting for your decision"
          icon={Clock}
          tone={dashboard.pendingOrders > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Accepted orders"
          value={dashboard.acceptedOrders}
          icon={CheckCircle2}
        />
        <StatCard
          label="Current plan"
          value={dashboard.premium ? "Premium" : "Free"}
          description={
            dashboard.premium && vendor.planExpiresAt
              ? `Active until ${formatDate(vendor.planExpiresAt)}`
              : "Upgrade for unlimited items"
          }
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pending orders</CardTitle>
            <CardDescription>
              Accept or reject requests before they expire.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingOrders.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No pending orders"
                description="New customer requests will appear here."
              />
            ) : (
              pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  perspective="vendor"
                  actions={
                    <>
                      <ConfirmAction
                        action={rejectOrder.bind(null, order.id)}
                        triggerLabel="Reject"
                        title="Reject this order?"
                        description="The customer will see the order as rejected and cannot be charged."
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
                  }
                />
              ))
            )}
            <Button
              variant="outline"
              className="w-full"
              render={<Link href="/vendor/orders" />}
            >
              View all orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Subscription
              {dashboard.premium ? (
                <PremiumBadge />
              ) : (
                <StatusBadge status="free" />
              )}
            </CardTitle>
            <CardDescription>
              {dashboard.premium
                ? "Your Premium benefits are active."
                : "Free plan includes the essentials."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2 text-sm">
              {planFeatures[dashboard.plan].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
            {dashboard.premium ? (
              <p className="text-sm text-muted-foreground">
                Active until {formatDate(vendor.planExpiresAt)}.
              </p>
            ) : (
              <Button render={<Link href="/vendor/subscription" />}>
                Upgrade to Premium
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
