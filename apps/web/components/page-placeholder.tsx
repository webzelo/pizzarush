import { Container } from "@/components/container"

type PagePlaceholderProps = {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-muted-foreground">{description}</p>
      </div>
    </Container>
  )
}
