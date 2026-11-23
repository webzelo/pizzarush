"use client"

import { useEffect, useActionState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import { ImageUploadField } from "@/components/dashboard/image-upload-field"
import { SubmitButton } from "@/components/dashboard/submit-button"
import { useActionToast } from "@/components/dashboard/action-toast"
import { initialFormState } from "@/lib/action-state"
import { saveVendorProfile } from "@/lib/actions/vendor-profile"
import type { VendorDoc } from "@/lib/collections"

/** Only the fields the form renders, so the server can pass a plain object. */
export type VendorProfileValues = Pick<
  VendorDoc,
  | "restaurantName"
  | "cuisine"
  | "description"
  | "phone"
  | "address"
  | "area"
  | "city"
  | "logoUrl"
  | "coverUrl"
>

export function VendorProfileForm({
  vendor,
}: {
  vendor?: VendorProfileValues | null
}) {
  const [state, formAction] = useActionState(
    saveVendorProfile,
    initialFormState
  )
  const { formState } = useActionToast()
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    formState(state)
  }, [formState, state])

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 lg:grid-cols-[1fr_360px]"
    >
      <Card>
        <CardHeader>
          <CardTitle>Restaurant details</CardTitle>
          <CardDescription>
            Customers see this information on your menu items and orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="restaurantName">
                  Restaurant name
                </FieldLabel>
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  defaultValue={vendor?.restaurantName}
                  placeholder="Slice of Heaven"
                  required
                />
                <FieldError>{errors.restaurantName}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="cuisine">Cuisine</FieldLabel>
                <Input
                  id="cuisine"
                  name="cuisine"
                  defaultValue={vendor?.cuisine}
                  placeholder="Italian, Pizza"
                  required
                />
                <FieldError>{errors.cuisine}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={vendor?.description}
                placeholder="Tell customers what makes your restaurant special."
                required
              />
              <FieldError>{errors.description}</FieldError>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={vendor?.phone}
                  placeholder="+1 555 123 4567"
                  required
                />
                <FieldError>{errors.phone}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Street address</FieldLabel>
                <Input
                  id="address"
                  name="address"
                  defaultValue={vendor?.address}
                  placeholder="123 Slice Street"
                  required
                />
                <FieldError>{errors.address}</FieldError>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="area">Area</FieldLabel>
                <Input
                  id="area"
                  name="area"
                  defaultValue={vendor?.area}
                  placeholder="Gulshan"
                  required
                />
                <FieldError>{errors.area}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  name="city"
                  defaultValue={vendor?.city}
                  placeholder="Dhaka"
                  required
                />
                <FieldError>{errors.city}</FieldError>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Square images look best.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadField
              name="logoUrl"
              label="Upload logo"
              defaultValue={vendor?.logoUrl}
              error={errors.logoUrl}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover image</CardTitle>
            <CardDescription>Shown on your public profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadField
              name="coverUrl"
              label="Upload cover"
              defaultValue={vendor?.coverUrl}
              error={errors.coverUrl}
            />
          </CardContent>
        </Card>

        <SubmitButton size="lg" pendingLabel="Saving…">
          {vendor ? "Save profile" : "Create restaurant profile"}
        </SubmitButton>
      </div>
    </form>
  )
}
