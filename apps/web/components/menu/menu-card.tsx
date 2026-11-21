import Link from "next/link"
import { MapPin } from "lucide-react"

import { Card, CardContent } from "@workspace/ui/components/card"

import { PremiumBadge } from "@/components/dashboard/premium-badge"
import type { PublicMenuItem } from "@/lib/data/menu"
import { formatCurrency } from "@/lib/format"

export function MenuCard({ item }: { item: PublicMenuItem }) {
  return (
    <Card className="gap-0 overflow-hidden pt-0">
      <Link
        href={`/menu/${item.id}`}
        className="group relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        {/* Uploaded images are user-provided, so a plain img avoids remotePatterns. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.premium ? (
          <PremiumBadge className="absolute top-2 left-2 shadow-sm" />
        ) : null}
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/menu/${item.id}`}
              className="font-medium hover:underline"
            >
              {item.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {item.vendorName}
            </p>
          </div>
          <p className="shrink-0 font-semibold">
            {formatCurrency(item.price)}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
        <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          <MapPin className="size-3" aria-hidden="true" />
          {item.area}, {item.city}
        </p>
      </CardContent>
    </Card>
  )
}
