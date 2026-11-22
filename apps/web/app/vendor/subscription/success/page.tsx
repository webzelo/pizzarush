import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, Clock3 } from "lucide-react"

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
import { getVendorByUserId } from "@/lib/dal/vendor"
import { isPremiumActive } from "@/lib/plans"
import { getStripe } from "@/lib/stripe"

export const metadata: Metadata = {
  title: "Payment Confirmation",
}

type SuccessSearchParams = {
  session_id?: string | string[]
}

export default async function PremiumPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SuccessSearchParams>
}) {
  const session = await requireRole("vendor")
  const params = await searchParams
  const sessionId =
    typeof params.session_id === "string"
      ? params.session_id
      : params.session_id?.[0]

  if (!sessionId) {
    redirect("/vendor/subscription")
  }

  let checkoutSession

  try {
    checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId)
  } catch {
    redirect("/vendor/subscription")
  }

  if (checkoutSession.client_reference_id !== session.user.id) {
    redirect("/vendor/subscription")
  }

  const vendor = await getVendorByUserId(session.user.id)
  const premiumActive = isPremiumActive(vendor)
  const paid = checkoutSession.payment_status === "paid"
  const email = checkoutSession.customer_details?.email

  return (
    <>
      <PageHeader
        title="Payment confirmation"
        description="Your Premium upgrade status."
      />

      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paid ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <Clock3 className="size-5 text-amber-500" />
            )}
            {paid ? "Payment received" : "Payment is still confirming"}
          </CardTitle>
          <CardDescription>
            {premiumActive
              ? "Your Premium plan is active."
              : "Stripe must confirm the payment before Premium becomes active."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          {email ? (
            <p>
              A confirmation email was sent to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          ) : null}
          <p>
            {premiumActive
              ? "You can now add more than 3 active menu items."
              : paid
                ? "We are finalizing your subscription. Refresh this page in a moment."
                : "You can safely close this page and check back soon."}
          </p>
          <Button render={<Link href="/vendor/subscription" />}>
            Back to subscription
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
