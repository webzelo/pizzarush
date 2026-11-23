"use client"

import { PageError } from "@/components/dashboard/page-error"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageError
        reset={reset}
        title="Something went wrong"
        description={error.message}
      />
    </main>
  )
}
