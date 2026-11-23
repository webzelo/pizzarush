
"use client"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { cancelOrder } from "@/lib/api/order-updates"

type CancelOrderActionProps = {
  orderId: string
}

export function CancelOrderAction({
  orderId,
}: CancelOrderActionProps) {
  return (
    <ConfirmAction
      action={() => cancelOrder(orderId)}
      triggerLabel="Cancel order"
      title="Cancel this order?"
      description="Only pending orders can be cancelled. This cannot be undone."
      confirmLabel="Cancel order"
      variant="destructive"
    />
  )
}
