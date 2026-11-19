import { cn } from "@workspace/ui/lib/utils"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground">{description}</p>
    </div>
  )
}
