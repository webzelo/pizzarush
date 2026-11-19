import type { LucideIcon } from "lucide-react"
import { ChefHat, Leaf, ShieldCheck, Timer } from "lucide-react"

import { Container } from "@/components/container"
import { SectionHeading } from "@/components/section-heading"

type Benefit = {
  icon: LucideIcon
  title: string
  description: string
}

const benefits: Benefit[] = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description:
      "We start with quality ingredients and generous toppings, so every slice tastes as good as it looks.",
  },
  {
    icon: Timer,
    title: "Fast Delivery",
    description:
      "Your order moves quickly from our oven to your door, arriving hot and ready to enjoy.",
  },
  {
    icon: ChefHat,
    title: "Made To Order",
    description:
      "No pre-made pizzas here. Every order is prepared and baked fresh when you place it.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Ordering",
    description:
      "Your account and order details are handled with care from checkout to delivery.",
  },
]

function BenefitCard({ icon: Icon, title, description }: Benefit) {
  return (
    <article className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm">
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  )
}

export function WhyChooseUs() {
  return (
    <section className="border-b bg-background py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="The PizzaHub difference"
          title="Why Choose PizzaHub?"
          description="Good pizza starts with good choices. Here is what you can expect from every order."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </Container>
    </section>
  )
}
