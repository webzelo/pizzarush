import type { MouseEventHandler } from "react"

import Link from "next/link"
import { Pizza } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { siteConfig } from "@/lib/site-config"

type SiteLogoProps = {
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export function SiteLogo({ className, onClick }: SiteLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Pizza className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg tracking-tight">{siteConfig.name}</span>
    </Link>
  )
}
