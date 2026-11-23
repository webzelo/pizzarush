import type { LucideIcon } from "lucide-react"
import { Pizza, ShoppingCart, Truck } from "lucide-react"
import { MotionDiv } from "@/components/motion-div"

import { Container } from "@/components/container"
import { SectionHeading } from "@/components/section-heading"

const ease = "easeOut" as const

type Step = {
  icon: LucideIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    icon: Pizza,
    title: "Browse the Menu",
    description:
      "Explore pizzas, sides, and drinks to find your next favorite.",
  },
  {
    icon: ShoppingCart,
    title: "Place Your Order",
    description:
      "Choose what you are craving and check out in just a few clicks.",
  },
  {
    icon: Truck,
    title: "Get It Delivered",
    description: "We bake your pizza fresh and bring it hot to your door.",
  },
]

type StepCardProps = {
  step: Step
  index: number
  isLast: boolean
}

function StepCard({ step, index, isLast }: StepCardProps) {
  const Icon = step.icon

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.12, ease }}
      className="relative text-center"
    >
      {!isLast && (
        <div
          className="absolute top-8 left-1/2 hidden h-px w-[calc(100%+2rem)] bg-border md:block"
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 mx-auto flex size-16 items-center justify-center rounded-full border bg-background shadow-sm">
        <Icon className="size-6" aria-hidden="true" />
        <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {index + 1}
        </span>
      </div>

      <h3 className="mt-5 font-semibold">{step.title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        {step.description}
      </p>
    </MotionDiv>
  )
}

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Simple from start to finish"
          title="How PizzaHub Works"
          description="Three easy steps from choosing your pizza to enjoying it at home."
        />

        <ol
          className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8"
          aria-label="Ordering steps"
        >
          {steps.map((step, index) => (
            <StepCard
              key={step.title}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </ol>
      </Container>
    </section>
  )
}
