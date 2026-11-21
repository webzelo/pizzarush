"use client"

import { useActionState } from "react"
import { CalendarDays, MapPin, MessageSquare, ShoppingBag } from "lucide-react"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import { SubmitButton } from "@/components/dashboard/submit-button"
import { initialFormState } from "@/lib/action-state"
import { placeOrder } from "@/lib/actions/customer-orders"
import { todayInputValue } from "@/lib/format"

type OrderFormProps = {
  menuItemId: string
  priceLabel: string
}

export function OrderForm({ menuItemId, priceLabel }: OrderFormProps) {
  const [state, formAction] = useActionState(placeOrder, initialFormState)
  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="menuItemId" value={menuItemId} />

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
          <p className="text-xs text-muted-foreground">
            {priceLabel} each · maximum 20 per order
          </p>
          <FieldError>{errors.quantity}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="deliveryDate">
            <CalendarDays className="size-3.5" />
            Delivery date
          </FieldLabel>
          <Input
            id="deliveryDate"
            name="deliveryDate"
            type="date"
            min={todayInputValue()}
            required
          />
          <FieldError>{errors.deliveryDate}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="deliveryAddress">
            <MapPin className="size-3.5" />
            Delivery address
          </FieldLabel>
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
            <MessageSquare className="size-3.5" />
            Message to the restaurant
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

      {state.status === "error" ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <SubmitButton size="lg" pendingLabel="Placing order…">
        <ShoppingBag />
        Place order
      </SubmitButton>
    </form>
  )
}
