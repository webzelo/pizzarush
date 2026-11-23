import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

type StatCardProps = {
  label: string
  value: string | number
  description?: string
  icon: LucideIcon
  tone?: "default" | "warning" | "success"
}

const toneClasses = {
  default: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
} as const

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  return (
    <Card
      size="sm"
      className="relative overflow-hidden transition-shadow hover:shadow-sm"
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-accent to-transparent"
        aria-hidden="true"
      />
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            toneClasses[tone]
          )}
        >
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
          {value}
        </p>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
