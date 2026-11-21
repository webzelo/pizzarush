import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"

import { Container } from "@/components/container"
import { MenuCard } from "@/components/menu/menu-card"
import { SectionHeading } from "@/components/section-heading"
import { listPublicMenu } from "@/lib/data/menu"

/** Premium vendors get first placement on the homepage. */
export async function FeaturedMenu() {
  const { items } = await listPublicMenu({ page: 1 })
  const featured = items.filter((item) => item.premium).slice(0, 4)

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
