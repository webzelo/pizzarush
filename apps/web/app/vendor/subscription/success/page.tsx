import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { PageHeader } from "@/components/dashboard/page-header"
import { requireRole } from "@/lib/dal/session"

export const metadata: Metadata = {
  title: "Payment Submitted",
}

export default async function PremiumPaymentSuccessPage() {
  await requireRole("vendor")

  return (
    <>
      <PageHeader
        title="Payment submitted"
        description="Thanks for choosing Pizzarush Premium."
      />

      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            We received your checkout
          </CardTitle>
          <CardDescription>
            Stripe will confirm the payment before your plan changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            Premium benefits stay inactive until Stripe sends a verified payment
            event. You can safely close this page.
          </p>
          <Button render={<Link href="/vendor/subscription" />}>
            Back to subscription
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
