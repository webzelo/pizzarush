import type { Metadata } from "next"
import Link from "next/link"
import {
  Clock,
  DollarSign,
  ListChecks,
  ShoppingBag,
  Users,
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

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { requireRole } from "@/lib/dal/session"
import {
  getAdminStats,
  getPendingMenuItems,
  getRecentTransactions,
} from "@/lib/data/admin"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Admin dashboard",
}

export default async function AdminOverviewPage() {
  const session = await requireRole("admin")
  const [stats, pendingItems, recentTransactions] = await Promise.all([
    getAdminStats(),
    getPendingMenuItems(4),
    getRecentTransactions(4),
  ])

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.user.name}`}
        description="Platform health, moderation queue and the latest subscription payments."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/users" />}>
              <Users />
              Manage users
            </Button>
            <Button render={<Link href="/admin/menu" />}>
              <ListChecks />
              Review menu items
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats.totalUsers}
          description={`${stats.totalVendors} vendors · ${stats.totalCustomers} customers`}
          icon={Users}
        />
        <StatCard
          label="Menu items"
          value={stats.totalMenuItems}
          description={`${stats.pendingMenuItems} waiting for review`}
          icon={UtensilsCrossed}
          tone={stats.pendingMenuItems > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Transactions"
          value={stats.totalTransactions}
          description={`${stats.paidTransactions} paid`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Revenue"
          value={stats.revenue}
          description="Paid subscriptions"
          icon={DollarSign}
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Moderation queue</CardTitle>
            <CardDescription>
              Newly submitted items stay hidden from customers until approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingItems.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Nothing to review"
                description="New menu items will show up here for approval."
              />
            ) : (
              pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full"
              render={<Link href="/admin/menu?status=pending" />}
            >
              Open moderation queue
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              Read-only log of Premium subscription payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="No transactions yet"
                description="Premium upgrades will appear here."
              />
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {transaction.vendorName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(transaction.createdAt)} ·{" "}
                      {transaction.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={transaction.paymentStatus} />
                    <span className="text-sm font-semibold">
                      {transaction.amount}
                    </span>
                  </div>
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full"
              render={<Link href="/admin/transactions" />}
            >
              View all transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
