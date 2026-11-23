import { Skeleton } from "@workspace/ui/components/skeleton"

/** Reusable dashboard loading skeleton. */
export function DashboardPageLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  )
}

/** Reusable page-section loading skeleton. */
export function PageLoading({ children = 2 }: { children?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: children }, (_, index) => (
        <Skeleton key={index} className="h-8 w-full max-w-md" />
      ))}
    </div>
  )
}
