"use client"

import { Container } from "@/components/container"
import { MenuErrorState } from "@/components/menu/menu-error-state"

export default function MenuError({ reset }: { reset: () => void }) {
  return (
    <Container className="py-12 sm:py-16">
      <MenuErrorState reset={reset} />
    </Container>
  )
}
