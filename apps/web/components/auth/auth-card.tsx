import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type AuthCardProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-6 shadow-sm sm:p-8",
        className
      )}
    >
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mt-6">{children}</div>

      {footer ? (
        <div className="mt-6 border-t pt-6 text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
