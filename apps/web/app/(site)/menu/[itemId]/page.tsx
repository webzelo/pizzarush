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
import { OrderForm } from "@/components/menu/order-form"
import { fetchPublicMenuItem } from "@/lib/api/menu"
import { requireUser } from "@/lib/dal/session"
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
          </div>

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
