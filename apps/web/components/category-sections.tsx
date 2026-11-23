import { MotionDiv } from "@/components/motion-div"

import { CategoryCarousel } from "@/components/category-carousel"
import { Container } from "@/components/container"
import { SectionHeading } from "@/components/section-heading"
import { fetchPublicMenu } from "@/lib/api/menu"
import type { PublicMenuItem } from "@/lib/data/menu"

const ease = "easeOut" as const

type SectionDef = {
  eyebrow: string
  title: string
  /** Backend categories included in this section. */
  categories: string[]
  /** Further client-side filter so distinct sections show distinct items. */
  match?: RegExp
}

const SECTIONS: SectionDef[] = [
  {
    eyebrow: "Classic Pizzas",
    title: "Classic Pizzas",
    categories: ["Pizza"],
    match: /margherita/i,
  },
  {
    eyebrow: "Vegetarian Pizzas",
    title: "Vegetarian Pizzas",
    categories: ["Pizza"],
    match: /veggi|vegetarian/i,
  },
  {
    eyebrow: "Meat Lovers",
    title: "Meat Lovers",
    categories: ["Pizza"],
    match: /pepperoni|beef|chicken|bbq|spicy/i,
  },
  {
    eyebrow: "Speciality / Gourmet Pizzas",
    title: "Speciality / Gourmet Pizzas",
    categories: ["Pizza"],
    match: /cheese/i,
  },
  {
    eyebrow: "Sides & Appetizers",
    title: "Sides & Appetizers",
    categories: ["Sides"],
  },
  {
    eyebrow: "Beverages & Desserts",
    title: "Beverages & Desserts",
    categories: ["Drinks", "Desserts"],
  },
]

async function sectionItems(def: SectionDef) {
  const menus = await Promise.all(
    def.categories.map((category) =>
      fetchPublicMenu({ category }).catch(() => null)
    )
  )

  const items = menus
    .filter((menu) => menu !== null)
    .flatMap((menu) => menu!.items)
    .filter((item) =>
      def.match ? def.match.test(`${item.name} ${item.description}`) : true
    )

  return items.slice(0, 6)
}

/** Browse-by-category sections. Every section reads the public menu API. */
export async function CategorySections() {
  const sections = await Promise.all(
    SECTIONS.map(async (def) => ({ def, items: await sectionItems(def) }))
  )
  const visible = sections.filter((section) => section.items.length > 0)

  if (visible.length === 0) {
    return null
  }

  return (
    <section className="border-b py-16 sm:py-20">
      <Container>
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.6, ease }}
        >
          <SectionHeading
            eyebrow="Categories"
            title="Browse by Category"
            description="Everything you want, grouped so you can find it faster."
          />
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mt-10"
        >
          <CategoryCarousel
            sections={visible.map(({ def, items }) => ({
              title: def.title,
              items: items as PublicMenuItem[],
            }))}
          />
        </MotionDiv>
      </Container>
    </section>
  )
}
