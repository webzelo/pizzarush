"use client"

import { Container } from "@/components/container"
import { MenuErrorState } from "@/components/menu/menu-error-state"

export default function MenuItemError({ reset }: { reset: () => void }) {
  return (
    <Container className="py-10 sm:py-14">
      <MenuErrorState reset={reset} />
    </Container>
  )
}
