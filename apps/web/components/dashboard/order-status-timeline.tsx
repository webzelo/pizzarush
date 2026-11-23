import { cn } from "@workspace/ui/lib/utils"

import { StatusBadge } from "@/components/dashboard/status-badge"
import type { OrderStatus, OrderStatusChange } from "@/lib/collections"
import { formatDateTime } from "@/lib/format"

const statusDetails: Record<OrderStatus, string> = {
  pending: "Order placed and waiting for the restaurant.",
  accepted: "The restaurant accepted your order.",
  rejected: "The restaurant could not fulfil this order.",
  cancelled: "You cancelled this order.",
}

/** Vertical, read-only history shown on the customer order details page. */
export function OrderStatusTimeline({
  history,
}: {
  history: OrderStatusChange[]
}) {
  return (
    <ol className="flex flex-col gap-6">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1

        return (
          <li key={`${entry.status}-${index}`} className="relative flex gap-3">
            {!isLast ? (
              <span
                className="absolute top-4 left-[0.3125rem] h-full w-px bg-border"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-1 size-2.5 shrink-0 rounded-full ring-4 ring-background",
                entry.status === "rejected"
                  ? "bg-destructive"
                  : entry.status === "cancelled"
                    ? "bg-muted-foreground"
                    : "bg-emerald-500"
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={entry.status} />
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.at)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {statusDetails[entry.status]}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
