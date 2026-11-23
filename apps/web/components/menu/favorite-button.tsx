"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { useToastManager } from "@workspace/ui/components/toast"
import { cn } from "@workspace/ui/lib/utils"

import { toggleFavorite } from "@/lib/actions/favorites"

type FavoriteButtonProps = {
  itemId: string
  initialFavorite?: boolean
  withLabel?: boolean
  className?: string
}

/** Reusable heart toggle for menu cards and the item details page. */
export function FavoriteButton({
  itemId,
  initialFavorite = false,
  withLabel = false,
  className,
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const toast = useToastManager()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavorite(itemId)

      toast.add({
        title: result.ok ? "Done" : "Action failed",
        description: result.message,
        type: result.ok ? "success" : "error",
      })

      if (result.ok) {
        setFavorite((current) => !current)
        router.refresh()
      }
    })
  }

  const label = favorite ? "Remove from favourites" : "Save to favourites"

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={favorite}
      title={label}
      disabled={pending}
      onClick={handleClick}
      className={cn(
        buttonVariants({
          variant: withLabel ? "outline" : "ghost",
          size: withLabel ? "sm" : "icon-sm",
        }),
        "bg-background/90 shadow-sm hover:bg-background",
        className
      )}
    >
      <Heart
        className={cn("size-4", favorite && "fill-rose-500 text-rose-500")}
        aria-hidden="true"
      />
      {withLabel ? <span>{favorite ? "Saved" : "Save"}</span> : null}
    </button>
  )
}
