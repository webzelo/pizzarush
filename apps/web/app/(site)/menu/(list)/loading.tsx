import { Skeleton } from "@workspace/ui/components/skeleton"

import { Container } from "@/components/container"
import { MenuGridSkeleton } from "@/components/menu/menu-grid"

/** Streamed while the public menu query runs (first load and filter changes). */
export default function MenuLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Skeleton className="h-9 w-full sm:max-w-xs" />
        <Skeleton className="h-9 w-full sm:w-44" />
        <Skeleton className="h-9 w-20" />
      </div>

      <Skeleton className="mt-4 h-4 w-24" />

      <div className="mt-6">
        <MenuGridSkeleton />
      </div>
    </Container>
  )
}
