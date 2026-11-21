import { Crown } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        className
      )}
    >
      <Crown className="size-3" />
      Premium
    </Badge>
  )
}
