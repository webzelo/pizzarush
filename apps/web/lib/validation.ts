import { z } from "zod"

import { CATEGORIES, IMAGE_HOSTS } from "@/lib/constants"
import { todayInputValue } from "@/lib/format"

const trimmed = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max, message)

const imageUrl = z
  .string()
  .trim()
  .url("Upload an image before saving.")
  .refine((value) => {
    try {
      return IMAGE_HOSTS.includes(new URL(value).hostname)
    } catch {
      return false
    }
  }, "Image must be uploaded through the app.")

const optionalImageUrl = z
  .union([imageUrl, z.literal("")])
  .optional()
  .transform((value) => value ?? "")

export const menuItemInputSchema = z.object({
  name: trimmed(2, 80, "Item name must be 2–80 characters."),
  category: z.enum(CATEGORIES, { message: "Choose a category." }),
  description: trimmed(10, 1000, "Description must be 10–1000 characters."),
  price: z.coerce
    .number({ message: "Enter a valid price." })
    .positive("Price must be greater than 0.")
    .max(10000, "Price must be $10,000 or less."),
  area: trimmed(1, 80, "Area is required."),
  city: trimmed(1, 80, "City is required."),
  imageUrl,
  isActive: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
})

export const vendorProfileInputSchema = z.object({
  restaurantName: trimmed(2, 80, "Restaurant name must be 2–80 characters."),
  description: trimmed(10, 1000, "Description must be 10–1000 characters."),
  cuisine: trimmed(2, 60, "Cuisine must be 2–60 characters."),
  phone: trimmed(6, 30, "Enter a valid phone number."),
  address: trimmed(5, 200, "Address must be 5–200 characters."),
  area: trimmed(1, 80, "Area is required."),
  city: trimmed(1, 80, "City is required."),
  logoUrl: optionalImageUrl,
  coverUrl: optionalImageUrl,
})

export const orderInputSchema = z
  .object({
    menuItemId: z.string().trim().min(1, "Choose a menu item."),
    quantity: z.coerce
      .number({ message: "Enter a valid quantity." })
      .int("Quantity must be a whole number.")
      .min(1, "Quantity must be at least 1.")
      .max(20, "Maximum quantity per order is 20."),
    deliveryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a delivery date."),
    deliveryAddress: trimmed(
      10,
      300,
      "Delivery address must be 10–300 characters."
    ),
    customerMessage: z
      .string()
      .trim()
      .max(500, "Message must be 500 characters or less.")
      .optional()
      .default(""),
  })
  .refine((value) => value.deliveryDate >= todayInputValue(), {
    path: ["deliveryDate"],
    message: "Delivery date must be today or later.",
  })

export const rejectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(300, "Reason must be 300 characters or less.")
    .optional()
    .default(""),
})

export const moderationSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(["approved", "rejected", "pending"]),
  reason: z.string().trim().max(300).optional().default(""),
})

export type MenuItemInput = z.infer<typeof menuItemInputSchema>
export type VendorProfileInput = z.infer<typeof vendorProfileInputSchema>
export type OrderInput = z.infer<typeof orderInputSchema>
