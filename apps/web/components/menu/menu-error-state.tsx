"use client"

import { RotateCcw, UtensilsCrossed } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/components/dashboard/empty-state"

/** Shared fallback when the Express menu API cannot be reached. */
export function MenuErrorState({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      icon={UtensilsCrossed}
      title="Menu is temporarily unavailable"
      description="We couldn't reach the menu service. Please try again in a moment."
      action={
        <Button onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
      }
    />
  )
}
