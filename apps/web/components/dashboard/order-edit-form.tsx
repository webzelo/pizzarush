"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import { useToastManager } from "@workspace/ui/components/toast"

import { updateOrder } from "@/lib/api/order-updates"
import type { OrderView } from "@/lib/data/orders"

type OrderEditFormProps = {
  order: OrderView
}

/**
 * Customer edits updatable order info (delivery details) while the order is
 * still pending. Writes go through the Express API from the browser.
 */
export function OrderEditForm({ order }: OrderEditFormProps) {
  const router = useRouter()
  const toast = useToastManager()
  const [saving, setSaving] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState(order.deliveryDate)
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress)
  const [customerMessage, setCustomerMessage] = useState(order.customerMessage)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const result = await updateOrder(order.id, {
      deliveryDate: deliveryDate.trim(),
      deliveryAddress: deliveryAddress.trim(),
      customerMessage: customerMessage.trim(),
    })

    toast.add({
      title: result.ok ? "Done" : "Action failed",
      description: result.ok ? "Order details saved." : result.message,
      type: result.ok ? "success" : "error",
    })

    if (result.ok) router.refresh()
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="delivery-date">Delivery date</FieldLabel>
          <Input
            id="delivery-date"
            type="date"
            value={deliveryDate}
            onChange={(event) => setDeliveryDate(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="delivery-address">Delivery address</FieldLabel>
          <Textarea
            id="delivery-address"
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="customer-message">
            Message to the restaurant
          </FieldLabel>
          <Textarea
            id="customer-message"
            value={customerMessage}
            onChange={(event) => setCustomerMessage(event.target.value)}
          />
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? <Spinner /> : null}
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
