import type { ObjectId } from "mongodb"

import type { AccountRole } from "@/lib/auth/roles"
import { db } from "@/lib/db"

export type Plan = "free" | "premium"
export type MenuItemStatus = "pending" | "approved" | "rejected"
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled"
export type PaymentStatus = "paid" | "pending" | "failed"

export type UserDoc = {
  _id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  role: AccountRole
  banned?: boolean | null
  banReason?: string | null
  createdAt: Date
  updatedAt: Date
}

export type VendorDoc = {
  _id: ObjectId
  userId: string
  restaurantName: string
  description: string
  cuisine: string
  phone: string
  address: string
  area: string
  city: string
  logoUrl: string
  coverUrl: string
  plan: Plan
  planExpiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type MenuItemDoc = {
  _id: ObjectId
  vendorId: string
  name: string
  category: string
  description: string
  price: number
  area: string
  city: string
  imageUrl: string
  status: MenuItemStatus
  isActive: boolean
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

export type OrderDoc = {
  _id: ObjectId
  customerId: string
  customerName: string
  customerEmail: string
  vendorId: string
  vendorName: string
  menuItemId: string
  itemName: string
  itemImageUrl: string
  itemPrice: number
  quantity: number
  deliveryDate: string
  deliveryAddress: string
  customerMessage: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export type TransactionDoc = {
  _id: ObjectId
  vendorId: string
  vendorName: string
  vendorEmail: string
  plan: Plan
  amount: number
  currency: string
  paymentStatus: PaymentStatus
  reference: string
  checkoutSessionId?: string
  paymentIntentId?: string
  stripeEventId?: string
  createdAt: Date
}

export const usersCollection = db.collection<UserDoc>("user")
export const sessionsCollection = db.collection("session")
export const vendorsCollection = db.collection<VendorDoc>("vendors")
export const menuItemsCollection = db.collection<MenuItemDoc>("menuItems")
export const ordersCollection = db.collection<OrderDoc>("orders")
export const transactionsCollection =
  db.collection<TransactionDoc>("transactions")
