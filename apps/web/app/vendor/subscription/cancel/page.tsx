import type { Metadata } from "next"
import Link from "next/link"
import { XCircle } from "lucide-react"

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
  title: "Payment Canceled",
}

export default async function PremiumPaymentCancelPage() {
  await requireRole("vendor")

  return (
    <>
      <PageHeader
        title="Payment canceled"
        description="You can try again whenever you are ready."
      />

      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-muted-foreground" />
            Checkout was canceled
          </CardTitle>
          <CardDescription>No payment was completed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            Your plan is unchanged. Return to the subscription page to start a
            new secure checkout.
          </p>
          <Button render={<Link href="/vendor/subscription" />}>
            Back to subscription
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
