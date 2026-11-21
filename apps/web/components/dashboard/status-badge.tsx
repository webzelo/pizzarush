import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import type {
  MenuItemStatus,
  OrderStatus,
  PaymentStatus,
} from "@/lib/collections"

export type BadgeStatus =
  | MenuItemStatus
  | OrderStatus
  | PaymentStatus
  | "free"
  | "premium"

const statusLabels: Record<BadgeStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  accepted: "Accepted",
  cancelled: "Cancelled",
  paid: "Paid",
  failed: "Failed",
  free: "Free",
  premium: "Premium",
}

const statusClasses: Record<BadgeStatus, string> = {
  pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  accepted:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  cancelled: "border-border bg-muted text-muted-foreground",
  free: "border-border bg-muted text-muted-foreground",
  premium:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
}

export function StatusBadge({
  status,
  className,
}: {
  status: BadgeStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(statusClasses[status], className)}
    >
      {statusLabels[status]}
    </Badge>
  )
}
