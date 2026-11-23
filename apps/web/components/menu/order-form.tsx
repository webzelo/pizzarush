"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import { useToastManager } from "@workspace/ui/components/toast"

import { apiClient } from "@/lib/api-client"
import { todayInputValue } from "@/lib/format"

type OrderFormProps = {
  menuItemId: string
  priceLabel: string
}

export function OrderForm({ menuItemId, priceLabel }: OrderFormProps) {
  const router = useRouter()
  const toast = useToastManager()
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState({
    quantity: 1,
    deliveryDate: todayInputValue(),
    deliveryAddress: "",
    customerMessage: "",
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const result = await apiClient("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        menuItemId,
        quantity: values.quantity,
        deliveryDate: values.deliveryDate,
        deliveryAddress: values.deliveryAddress.trim(),
        customerMessage: values.customerMessage.trim(),
      }),
    })

    if (result.ok) {
      toast.add({
        title: "Done",
        description: "Order placed. The restaurant will accept or reject it soon.",
        type: "success",
      })
      router.push("/customer/orders?placed=1")
      router.refresh()
    } else {
      toast.add({
        title: "Action failed",
        description: result.message,
        type: "error",
      })
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={20}
            value={values.quantity}
            onChange={(event) =>
              setValues({
                ...values,
                quantity: event.target.valueAsNumber || 1,
              })
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            {priceLabel} each · maximum 20 per order
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="deliveryDate">Delivery date</FieldLabel>
          <Input
            id="deliveryDate"
            type="date"
            value={values.deliveryDate}
            onChange={(event) =>
              setValues({ ...values, deliveryDate: event.target.value })
            }
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="deliveryAddress">Delivery address</FieldLabel>
          <Textarea
            id="deliveryAddress"
            rows={3}
            placeholder="House, street, area, city"
            value={values.deliveryAddress}
            onChange={(event) =>
              setValues({ ...values, deliveryAddress: event.target.value })
            }
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="customerMessage">
            Message to the restaurant
          </FieldLabel>
          <Textarea
            id="customerMessage"
            rows={2}
            placeholder="Optional delivery notes or special requests"
            value={values.customerMessage}
            onChange={(event) =>
              setValues({ ...values, customerMessage: event.target.value })
            }
          />
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? <Spinner /> : null}
        {saving ? "Placing order…" : "Place order"}
      </Button>
    </form>
  )
}
