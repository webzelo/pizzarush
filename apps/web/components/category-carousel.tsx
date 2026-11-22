"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@workspace/ui/components/carousel"
import { cn } from "@workspace/ui/lib/utils"

import { MenuGrid } from "@/components/menu/menu-grid"
import { SectionHeading } from "@/components/section-heading"
import type { PublicMenuItem } from "@/lib/data/menu"

export type CategoryCarouselSection = {
  title: string
  items: PublicMenuItem[]
}

/** Reusable dot navigation for any shadcn/Embla carousel. */
export function CarouselDots({ labels }: { labels: string[] }) {
  const { api } = useCarousel()
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const update = () => setActive(api.selectedScrollSnap())
    update()
    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  return (
    <div className="flex items-center justify-center gap-2" role="group" aria-label="Carousel slides">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          onClick={() => api?.scrollTo(index)}
          aria-label={`Show ${label}`}
          aria-current={index === active ? "true" : undefined}
          className={cn(
            "h-2 rounded-full transition-all",
            index === active
              ? "w-6 bg-primary"
              : "w-2 bg-primary/30 hover:bg-primary/60"
          )}
        />
      ))}
    </div>
  )
}

/** Prev/next controls plus dots — reusable anywhere inside a <Carousel />. */
export function CategoryCarouselControls({ labels }: { labels: string[] }) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      <Button variant="outline" size="sm" onClick={scrollPrev} disabled={!canScrollPrev}>
        <ChevronLeft />
        Previous
      </Button>
      <CarouselDots labels={labels} />
      <Button variant="outline" size="sm" onClick={scrollNext} disabled={!canScrollNext}>
        Next
        <ChevronRight />
      </Button>
    </div>
  )
}

function CategorySlide({
  section,
  index,
  total,
}: {
  section: CategoryCarouselSection
  index: number
  total: number
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 sm:p-6">
      <SectionHeading
        eyebrow={`Category ${index + 1} of ${total}`}
        title={section.title}
        description={`${section.items.length} ${section.items.length === 1 ? "dish" : "dishes"} in this category`}
      />
      <div className="mt-6">
        <MenuGrid items={section.items} />
      </div>
    </div>
  )
}

/** One slide per category, with the category name visible on every slide. */
export function CategoryCarousel({
  sections,
}: {
  sections: CategoryCarouselSection[]
}) {
  if (sections.length === 0) {
    return null
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full py-2">
      <CarouselContent>
        {sections.map((section, index) => (
          <CarouselItem
            key={section.title}
            className="md:basis-1/2 lg:basis-2/3"
            aria-label={section.title}
          >
            <CategorySlide section={section} index={index} total={sections.length} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CategoryCarouselControls labels={sections.map((section) => section.title)} />
    </Carousel>
  )
}
