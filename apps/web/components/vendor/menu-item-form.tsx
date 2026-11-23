"use client"

import { useEffect, useActionState } from "react"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { FormSwitch } from "@/components/dashboard/form-switch"
import { ImageUploadField } from "@/components/dashboard/image-upload-field"
import { SubmitButton } from "@/components/dashboard/submit-button"
import { useActionToast } from "@/components/dashboard/action-toast"
import { initialFormState } from "@/lib/action-state"
import { createMenuItem, updateMenuItem } from "@/lib/actions/vendor-menu"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import type { MenuItemView } from "@/lib/data/menu"

export function MenuItemForm({ item }: { item?: MenuItemView }) {
  const action = item ? updateMenuItem : createMenuItem
  const [state, formAction] = useActionState(action, initialFormState)
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
      {item ? <input type="hidden" name="itemId" value={item.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Item details</CardTitle>
          <CardDescription>
            New and edited items are reviewed by an admin before customers can
            see them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Item name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={item?.name}
                placeholder="Margherita pizza"
                required
              />
              <FieldError>{errors.name}</FieldError>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select
                  name="category"
                  defaultValue={item?.category ?? "Pizza"}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{errors.category}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="price">Price (USD)</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  defaultValue={item?.price}
                  placeholder="12.99"
                  required
                />
                <FieldError>{errors.price}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={item?.description}
                placeholder="Ingredients, size and what makes this dish special."
                required
              />
              <FieldError>{errors.description}</FieldError>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="area">Area</FieldLabel>
                <Input
                  id="area"
                  name="area"
                  defaultValue={item?.area}
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
                  defaultValue={item?.city}
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
            <CardTitle>Item image</CardTitle>
            <CardDescription>
              JPG, PNG, WebP or GIF, up to 5 MB. New images are stored on ImgBB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadField
              name="imageUrl"
              label="Upload image"
              defaultValue={item?.imageUrl}
              error={errors.imageUrl}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Hidden items stay saved but are not shown to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormSwitch
              name="isActive"
              label="Available for ordering"
              description="Turn off to hide this item without deleting it."
              defaultChecked={item?.isActive ?? true}
            />
          </CardContent>
        </Card>

        <SubmitButton size="lg" pendingLabel="Saving…">
          {item ? "Save changes" : "Submit for approval"}
        </SubmitButton>
      </div>
    </form>
  )
}
