"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { useToastManager } from "@workspace/ui/components/toast"

import { updateOrder } from "@/lib/api/order-updates"

type MarkOrderPaidProps = {
  orderId: string
}

/**
 * Vendor action: records that payment for the order was received. The
 * backend stores the payment status on the order document.
 */
export function MarkOrderPaid({ orderId }: MarkOrderPaidProps) {
  const router = useRouter()
  const toast = useToastManager()
  const [pending, setPending] = useState(false)

  async function handleClick() {
    setPending(true)

    const result = await updateOrder(orderId, { paymentStatus: "paid" })

    toast.add({
      title: result.ok ? "Done" : "Action failed",
      description: result.ok ? "Marked order as paid." : result.message,
      type: result.ok ? "success" : "error",
    })

    router.refresh()
    setPending(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? <Spinner /> : null}
      Mark as paid
    </Button>
  )
}
