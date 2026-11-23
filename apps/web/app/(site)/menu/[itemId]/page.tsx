import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Store } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { Container } from "@/components/container"
import { PremiumBadge } from "@/components/dashboard/premium-badge"
import { FavoriteButton } from "@/components/menu/favorite-button"
import { OrderForm } from "@/components/menu/order-form"
import { RatingSummary } from "@/components/menu/rating-summary"
import { ReviewForm } from "@/components/menu/review-form"
import { ReviewList } from "@/components/menu/review-list"
import { fetchMenuItemReviews, fetchPublicMenuItem } from "@/lib/api/menu"
import { requireUser } from "@/lib/dal/session"
import { getFavoriteItemIds } from "@/lib/data/favorites"
import { hasOrderedItem, getVendorRatingSummary } from "@/lib/data/reviews"
import { formatCurrency } from "@/lib/format"

type PageProps = {
  params: Promise<{ itemId: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { itemId } = await params

  try {
    const item = await fetchPublicMenuItem(itemId)
    return { title: item?.name ?? "Menu item" }
  } catch {
    // The page's error boundary handles an unreachable menu API.
    return { title: "Menu item" }
  }
}

export default async function MenuItemPage({ params }: PageProps) {
  const { itemId } = await params

  // Browsing the list is public; opening a dish requires an account. This is
  // also what the card's "View Details" button hits, so logged-out users are
  // sent to sign in and returned here afterwards.
  const session = await requireUser(`/menu/${itemId}`)
  const item = await fetchPublicMenuItem(itemId)

  if (!item) {
    notFound()
  }

  const canOrder = session.user.role === "customer"
  const [favoriteItemIds, reviews, vendorRating, canReview] = await Promise.all(
    [
      canOrder ? getFavoriteItemIds(session.user.id) : Promise.resolve([]),
      fetchMenuItemReviews(item.id).catch(() => null),
      getVendorRatingSummary(item.vendorId).catch(() => ({
        average: null,
        count: 0,
      })),
      canOrder
        ? hasOrderedItem(session.user.id, item.id).catch(() => false)
        : Promise.resolve(false),
    ]
  )

  return (
    <Container className="py-10 sm:py-14">
      <Link
        href="/menu"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to menu
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-xl border bg-muted">
            {/* Uploaded images are user-provided, so a plain img avoids remotePatterns. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {item.name}
              </h1>
              <p className="mt-1 text-muted-foreground">{item.vendorName}</p>
            </div>
            <p className="text-2xl font-semibold">
              {formatCurrency(item.price)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.category}</Badge>
            <Badge variant="outline">
              <MapPin />
              {item.area}, {item.city}
            </Badge>
            {item.premium ? <PremiumBadge /> : null}
            {canOrder ? (
              <FavoriteButton
                itemId={item.id}
                initialFavorite={favoriteItemIds.includes(item.id)}
                withLabel
              />
            ) : null}
          </div>

          <RatingSummary
            className="mt-3"
            average={reviews?.summary.average ?? item.ratingAverage}
            count={reviews?.summary.count ?? item.reviewCount}
          />

          <p className="mt-5 leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-4" />
                About {item.vendor.name}
              </CardTitle>
              <CardDescription>{item.vendor.cuisine}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Restaurant rating</span>
                <RatingSummary
                  average={vendorRating.average}
                  count={vendorRating.count}
                />
              </div>
              <p>{item.vendor.description}</p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" />
                {item.vendor.address}, {item.vendor.area}, {item.vendor.city}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4" />
                {item.vendor.phone}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                What customers said after ordering this dish.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewList reviews={reviews?.reviews ?? []} />
            </CardContent>
          </Card>

          {canOrder ? (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Write a review</CardTitle>
                <CardDescription>
                  {canReview
                    ? "Share your rating; you can update it later."
                    : "Place an order for this dish before reviewing it."}
                </CardDescription>
              </CardHeader>
              {canReview ? (
                <CardContent>
                  <ReviewForm itemId={item.id} />
                </CardContent>
              ) : null}
            </Card>
          ) : null}
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Place an order</CardTitle>
            <CardDescription>
              Choose a delivery date and address. The restaurant will accept or
              reject your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canOrder ? (
              <OrderForm
                menuItemId={item.id}
                itemName={item.name}
                vendorName={item.vendorName}
                customerName={session.user.name}
                priceLabel={formatCurrency(item.price)}
              />
            ) : (
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>
                  Only customer accounts can place orders. Sign in with a
                  customer account to continue.
                </p>
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Go to dashboard
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
