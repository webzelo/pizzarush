"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { useToastManager } from "@workspace/ui/components/toast"

import { syncPremiumPayment } from "@/lib/actions/vendor-subscription"

type PaymentStatusRefresherProps = {
  sessionId: string
  paid: boolean
  premiumActive: boolean
}

/** Reconciles a paid session locally if the webhook has not run yet. */
export function PaymentStatusRefresher({
  sessionId,
  paid,
  premiumActive,
}: PaymentStatusRefresherProps) {
  const router = useRouter()
  const toast = useToastManager()
  const started = useRef(false)

  useEffect(() => {
    if (started.current || !paid || premiumActive) return
    started.current = true

    void (async () => {
      const result = await syncPremiumPayment(sessionId)

      if (!result.ok) {
        toast.add({
          title: "Could not refresh payment",
          description: result.message,
          type: "error",
        })
        return
      }

      router.refresh()
    })()
  }, [paid, premiumActive, router, sessionId, toast])

  return null
}
