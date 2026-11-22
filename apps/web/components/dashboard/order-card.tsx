import type { ReactNode } from "react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

import { StatusBadge } from "@/components/dashboard/status-badge"
import type { OrderView } from "@/lib/data/orders"
import {
  formatCurrency,
  formatDateTime,
  formatDeliveryDate,
} from "@/lib/format"

type OrderCardProps = {
  order: OrderView
  perspective: "customer" | "vendor"
  detailsHref?: string
  actions?: ReactNode
}

export function OrderCard({
  order,
  perspective,
  detailsHref,
  actions,
}: OrderCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.itemImageUrl}
            alt=""
            className="size-16 shrink-0 rounded-lg border object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{order.itemName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {perspective === "vendor"
                    ? `${order.customerName} · ${order.customerEmail}`
                    : order.vendorName}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.quantity} × {formatCurrency(order.itemPrice)} ={" "}
              <span className="font-medium text-foreground">
                {formatCurrency(order.amount)}
              </span>
            </p>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Delivery date</dt>
            <dd className="font-medium">
              {formatDeliveryDate(order.deliveryDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Requested</dt>
            <dd className="font-medium">{formatDateTime(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Payment</dt>
            <dd className="flex items-center gap-2">
              <StatusBadge status={order.paymentStatus} />
              {order.paymentReference ? (
                <span className="truncate text-xs">{order.paymentReference}</span>
              ) : null}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Delivery address</dt>
            <dd>{order.deliveryAddress}</dd>
          </div>
          {order.customerMessage ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">
                Customer message
              </dt>
              <dd className="text-muted-foreground">{order.customerMessage}</dd>
            </div>
          ) : null}
        </dl>

        {detailsHref || actions ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {detailsHref ? (
              <Button
                variant="outline"
                size="sm"
                render={<Link href={detailsHref} />}
              >
                View details
              </Button>
            ) : null}
            {actions}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
