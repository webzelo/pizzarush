"use client"

import { useTransition } from "react"
import { CreditCard } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { useToastManager } from "@workspace/ui/components/toast"

import { startPremiumUpgrade } from "@/lib/actions/vendor-subscription"

export function UpgradeButton() {
  const toast = useToastManager()
  const [pending, startTransition] = useTransition()

  const handleUpgrade = () => {
    startTransition(async () => {
      const result = await startPremiumUpgrade()

      if (!result.ok) {
        toast.add({
          title: "Checkout unavailable",
          description: result.message,
          type: "error",
        })
        return
      }

      if (result.url) {
        window.location.assign(result.url)
        return
      }

      toast.add({
        title: "Premium",
        description: result.message,
        type: "success",
      })
    })
  }

  return (
    <Button type="button" size="lg" onClick={handleUpgrade} disabled={pending}>
      {pending ? <Spinner /> : <CreditCard />}
      {pending ? "Opening Stripe…" : "Pay with Stripe"}
    </Button>
  )
}
