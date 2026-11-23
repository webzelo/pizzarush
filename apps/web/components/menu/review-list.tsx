import { formatDate } from "@/lib/format"
import type { ReviewView } from "@/lib/data/reviews"

import { StarRating } from "@/components/menu/rating-summary"

/** Read-only list of the most recent public reviews for one menu item. */
export function ReviewList({ reviews }: { reviews: ReviewView[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to share your experience.
      </p>
    )
  }

  return (
    <ul className="flex flex-col divide-y">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{review.customerName}</p>
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} />
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
          {review.comment ? (
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
