import type { ObjectId } from "mongodb"

import type { AccountRole } from "@/lib/auth/roles"
import { db } from "@/lib/db"

export type Plan = "free" | "premium"
export type MenuItemStatus = "pending" | "approved" | "rejected"
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled"
export type PaymentStatus = "paid" | "pending" | "failed"

/** One entry per order status change, oldest first. */
export type OrderStatusChange = {
  status: OrderStatus
  at: Date
}

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
  amount: number
  currency: string
  paymentStatus: PaymentStatus
  paymentReference: string | null
  deliveryDate: string
  deliveryAddress: string
  customerMessage: string
  status: OrderStatus
  /** Older orders may not have history yet; views derive it from createdAt. */
  statusHistory?: OrderStatusChange[]
  createdAt: Date
  updatedAt: Date
}

/** A customer's rating/review for one menu item from an order they placed. */
export type ReviewDoc = {
  _id: ObjectId
  itemId: string
  itemName: string
  vendorId: string
  vendorName: string
  userId: string
  customerName: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

/** One saved menu item per customer. */
export type FavoriteDoc = {
  _id: ObjectId
  userId: string
  itemId: string
  createdAt: Date
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
export const reviewsCollection = db.collection<ReviewDoc>("reviews")
export const favoritesCollection = db.collection<FavoriteDoc>("favorites")
export const transactionsCollection =
  db.collection<TransactionDoc>("transactions")
