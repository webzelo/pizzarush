import { RotateCcw } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/components/dashboard/empty-state"

type PageErrorProps = {
  reset?: () => void
  title?: string
  description?: string
}

/** Shared page-level fallback for failed dashboard or page data loads. */
export function PageError({
  reset,
  title = "Something went wrong",
  description = "We could not load this page. Please try again.",
}: PageErrorProps) {
  return (
    <EmptyState
      icon={RotateCcw}
      title={title}
      description={description}
      action={
        reset ? (
          <Button onClick={reset}>
            <RotateCcw />
            Try again
          </Button>
        ) : undefined
      }
    />
  )
}
