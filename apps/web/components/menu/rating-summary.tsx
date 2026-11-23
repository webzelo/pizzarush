import { Star } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

/** Visual stars only; the numeric summary is rendered by RatingSummary. */
export function StarRating({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            star <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          )}
        />
      ))}
    </span>
  )
}

/** Shared compact rating shown on menu cards, detail pages and dashboards. */
export function RatingSummary({
  average,
  count,
  className,
}: {
  average?: number | null
  count?: number
  className?: string
}) {
  if (!count || average == null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        No reviews yet
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
      aria-label={`${average.toFixed(1)} out of 5 from ${count} reviews`}
    >
      <StarRating value={average} />
      <span className="font-medium text-foreground">{average.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  )
}
