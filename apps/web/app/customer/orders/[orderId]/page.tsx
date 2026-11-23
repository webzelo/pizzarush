import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { OrderCard } from "@/components/dashboard/order-card"
import { OrderEditForm } from "@/components/dashboard/order-edit-form"
import { PageHeader } from "@/components/dashboard/page-header"
import { CancelOrderAction } from "@/components/dashboard/cancel-order-action"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { requireRole } from "@/lib/dal/session"
import { getCustomerOrder } from "@/lib/data/orders"

export const metadata: Metadata = {
  title: "Order details",
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const session = await requireRole("customer")
  const { orderId } = await params
  const order = await getCustomerOrder(session.user.id, orderId)

  if (!order) {
    notFound()
  }

  return (
    <>
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          render={<Link href="/customer/orders" />}
        >
          <ArrowLeft />
          Back to orders
        </Button>
      </div>

      <PageHeader
        title="Order details"
        description={`Requested on ${new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(order.createdAt)}`}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="max-w-3xl">
        <OrderCard
          order={order}
          perspective="customer"
          actions={
            order.status === "pending" ? (
              <CancelOrderAction orderId={order.id} />
            ) : null
          }
        />
        {order.status === "pending" ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Edit order</CardTitle>
              <CardDescription>
                Update delivery details while the order is still pending.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderEditForm order={order} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  )
}
