import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"

import { Container } from "@/components/container"
import { MenuCard } from "@/components/menu/menu-card"
import { SectionHeading } from "@/components/section-heading"
import { fetchPublicMenu } from "@/lib/api/menu"

/** Premium vendors get first placement on the homepage. */
export async function FeaturedMenu() {
  // The homepage should still render if the menu service is unavailable.
  const menu = await fetchPublicMenu({ page: 1 }).catch(() => null)

  if (!menu) {
    return null
  }

  const featured = menu.items.filter((item) => item.premium).slice(0, 4)

  if (featured.length === 0) {
    return null
  }

  return (
    <section className="border-y bg-muted/30 py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured"
            title="Premium picks"
            description="Hand-picked dishes from our Premium restaurants, shown first for a reason."
          />
          <Link
            href="/menu"
            className={buttonVariants({ variant: "outline" })}
          >
            See full menu
            <ArrowRight />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  )
}
