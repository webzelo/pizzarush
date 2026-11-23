import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

import { buttonVariants } from "@workspace/ui/components/button"

import { Container } from "@/components/container"
import { MenuGrid } from "@/components/menu/menu-grid"
import { SectionHeading } from "@/components/section-heading"
import { fetchPublicMenu } from "@/lib/api/menu"
import { getCurrentSession } from "@/lib/dal/session"
import { getFavoriteItemIds } from "@/lib/data/favorites"

const ease = "easeOut" as const

/** Approved, active dishes from the menu API, shown first on the homepage. */
export async function FeaturedMenu() {
  // The homepage should still render if the menu service is unavailable.
  const [menu, session] = await Promise.all([
    fetchPublicMenu({ page: 1 }).catch(() => null),
    getCurrentSession().catch(() => null),
  ])

  if (!menu) {
    return null
  }

  // Express already filters to approved + active and sorts premium first.
  const featured = menu.items.slice(0, 6)

  if (featured.length === 0) {
    return null
  }

  const favoriteItemIds =
    session?.user.role === "customer"
      ? await getFavoriteItemIds(session.user.id)
      : undefined

  return (
    <section className="border-y bg-muted/30 py-16 sm:py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Featured"
              title="Featured Menu Items"
              description="Fresh picks from our restaurants, ready to order."
            />
            <Link
              href="/menu"
              className={buttonVariants({ variant: "outline" })}
            >
              See full menu
              <ArrowRight />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mt-8"
        >
          <MenuGrid items={featured} favoriteItemIds={favoriteItemIds} />
        </motion.div>
      </Container>
    </section>
  )
}
