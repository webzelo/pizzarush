import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Crown, Sparkles, Store } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { PremiumBadge } from "@/components/dashboard/premium-badge"
import { upgradeToPremium } from "@/lib/actions/vendor-subscription"
import { PREMIUM_PRICE } from "@/lib/constants"
import { requireRole } from "@/lib/dal/session"
import { getVendorByUserId } from "@/lib/dal/vendor"
import { formatCurrency, formatDate } from "@/lib/format"
import { effectivePlan, planFeatures } from "@/lib/plans"

export const metadata: Metadata = {
  title: "Subscription",
}

export default async function VendorSubscriptionPage() {
  const session = await requireRole("vendor")
  const vendor = await getVendorByUserId(session.user.id)

  if (!vendor) {
    return (
      <>
        <PageHeader
          title="Subscription"
          description="Create your restaurant profile before choosing a plan."
        />
        <EmptyState
          icon={Store}
          title="Restaurant profile required"
          description="Your plan is attached to your restaurant profile."
          action={
            <Button render={<Link href="/vendor/profile" />}>
              Set up profile
            </Button>
          }
        />
      </>
    )
  }

  const plan = effectivePlan(vendor)
  const premium = plan === "premium"

  return (
    <>
      <PageHeader
        title="Subscription"
        description="Free covers the basics. Premium unlocks unlimited items and featured placement."
        actions={premium ? <PremiumBadge /> : null}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>$0 — always available</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2 text-sm">
              {planFeatures.free.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" disabled>
              {premium ? "Included with Premium" : "Current plan"}
            </Button>
          </CardContent>
        </Card>

        <Card className="ring-2 ring-amber-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Premium
              <Crown className="size-4 text-amber-500" />
            </CardTitle>
            <CardDescription>
              {formatCurrency(PREMIUM_PRICE)} per 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2 text-sm">
              {planFeatures.premium.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  {feature}
                </li>
              ))}
            </ul>

            {premium ? (
              <div className="flex flex-col gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                <p className="font-medium">Premium is active</p>
                <p>
                  Your benefits run until {formatDate(vendor.planExpiresAt)}.
                </p>
              </div>
            ) : (
              <ConfirmAction
                action={upgradeToPremium}
                triggerLabel="Upgrade to Premium"
                title="Upgrade to Premium?"
                description={`This demo checkout records a ${formatCurrency(PREMIUM_PRICE)} paid transaction and activates Premium for 30 days.`}
                confirmLabel="Pay and activate"
                size="lg"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Payments are simulated for this project. Each upgrade creates a
        read-only transaction record for the admin.
      </p>
    </>
  )
}
