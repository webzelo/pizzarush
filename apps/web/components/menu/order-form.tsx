"use client"

import { useEffect, useActionState } from "react"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import { SubmitButton } from "@/components/dashboard/submit-button"
import { useActionToast } from "@/components/dashboard/action-toast"
import { initialFormState } from "@/lib/action-state"
import { placeCustomerOrder } from "@/lib/actions/customer-orders"
import { todayInputValue } from "@/lib/format"

type OrderFormProps = {
  menuItemId: string
  itemName: string
  vendorName: string
  customerName: string
  priceLabel: string
}

/** Shared order form shown on the public menu item details page. */
export function OrderForm({
  menuItemId,
  itemName,
  vendorName,
  customerName,
  priceLabel,
}: OrderFormProps) {
  const placeOrder = placeCustomerOrder.bind(null, menuItemId)
  const [state, formAction] = useActionState(placeOrder, initialFormState)
  const { formState } = useActionToast()
  const errors = state.fieldErrors ?? {}
  const minDeliveryDate = todayInputValue()

  useEffect(() => {
    formState(state)
  }, [formState, state])

  return (
    <form action={formAction} className="space-y-5">
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="font-medium">{itemName}</p>
        <p className="text-xs text-muted-foreground">
          For {customerName} · From {vendorName}
        </p>
      </div>

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            required
          />
          <FieldError>{errors.quantity}</FieldError>
          <p className="text-xs text-muted-foreground">
            {priceLabel} each · maximum 20 per order
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="deliveryDate">Delivery date</FieldLabel>
          <Input
            id="deliveryDate"
            name="deliveryDate"
            type="date"
            min={minDeliveryDate}
            defaultValue={minDeliveryDate}
            required
          />
          <FieldError>{errors.deliveryDate}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="deliveryAddress">Delivery address</FieldLabel>
          <Textarea
            id="deliveryAddress"
            name="deliveryAddress"
            rows={3}
            placeholder="House, street, area, city"
            required
          />
          <FieldError>{errors.deliveryAddress}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="customerMessage">
            Additional message / special instructions
          </FieldLabel>
          <Textarea
            id="customerMessage"
            name="customerMessage"
            rows={2}
            placeholder="Optional delivery notes or special requests"
          />
          <FieldError>{errors.customerMessage}</FieldError>
        </Field>
      </FieldGroup>

      <SubmitButton size="lg" pendingLabel="Placing order…">
        Place order
      </SubmitButton>
    </form>
  )
}
