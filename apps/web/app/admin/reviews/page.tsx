import type { Metadata } from "next"
import { MessageSquare } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { StarRating } from "@/components/menu/rating-summary"
import { deleteReviewAsAdmin } from "@/lib/actions/reviews"
import { requireRole } from "@/lib/dal/session"
import { listAdminReviews } from "@/lib/data/reviews"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Reviews",
}

export default async function AdminReviewsPage() {
  await requireRole("admin")
  const reviews = await listAdminReviews()

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Recent ratings and comments left by customers on menu items."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Customer ratings will appear here once they review a dish."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{review.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.vendorName}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {review.customerName}
                  </TableCell>
                  <TableCell>
                    <StarRating value={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {review.comment || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmAction
                      action={deleteReviewAsAdmin.bind(null, review.id)}
                      triggerLabel="Delete"
                      title="Delete this review?"
                      description="The customer's rating and comment will be removed permanently."
                      confirmLabel="Delete review"
                      variant="destructive"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
