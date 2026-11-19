import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Container } from "@/components/container"

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b bg-muted/30">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
        aria-hidden="true"
      />

      <Container className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Flame className="size-3.5 text-primary" aria-hidden="true" />
            Fresh from the oven
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Hot &amp; Fresh Pizza Delivered To Your Door
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            From classic pepperoni to loaded veggie, every pizza is baked to
            order and delivered hot. Pick your favorite and make tonight
            delicious.
          </p>

          <div className="mt-8">
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 px-6 text-base"
              )}
            >
              Explore Pizza Menu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-2xl"
            aria-hidden="true"
          />

          <div className="relative aspect-square overflow-hidden rounded-3xl border bg-muted shadow-2xl">
            <Image
              src="/pizza-banner-img.jpg"
              alt="Freshly baked pepperoni pizza with basil on a dark background"
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
