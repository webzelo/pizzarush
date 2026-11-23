import {
  ordersCollection,
  reviewsCollection,
  type ReviewDoc,
} from "@/lib/collections"

export type ReviewSummary = {
  average: number | null
  count: number
}

export type ReviewView = {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: Date
}

export type AdminReviewView = ReviewView & {
  itemId: string
  itemName: string
  vendorName: string
  userId: string
}

function toReviewView(review: ReviewDoc): ReviewView {
  return {
    id: review._id.toString(),
    customerName: review.customerName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }
}

/** A customer can rate a dish only after placing an order for it. */
export function hasOrderedItem(customerId: string, itemId: string) {
  return ordersCollection
    .countDocuments({ customerId, menuItemId: itemId })
    .then((count) => count > 0)
}

/** Ratings across all of a restaurant's dishes. */
export async function getVendorRatingSummary(
  vendorId: string
): Promise<ReviewSummary> {
  const [result] = await reviewsCollection
    .aggregate<{ _id: null; average: number; count: number }>([
      { $match: { vendorId } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray()

  return {
    average: result ? Math.round(result.average * 10) / 10 : null,
    count: result?.count ?? 0,
  }
}

export async function listAdminReviews(): Promise<AdminReviewView[]> {
  const reviews = await reviewsCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray()

  return reviews.map((review) => ({
    ...toReviewView(review),
    itemId: review.itemId,
    itemName: review.itemName,
    vendorName: review.vendorName,
    userId: review.userId,
  }))
}
