import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Browse Menu",
}

export default function MenuPage() {
  return (
    <PagePlaceholder
      title="Browse Menu"
      description="Our full menu is coming soon. Check back shortly to explore pizzas, sides, and drinks."
    />
  )
}
