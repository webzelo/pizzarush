import type { Filter } from "mongodb"

import {
  menuItemsCollection,
  transactionsCollection,
  usersCollection,
  vendorsCollection,
  type MenuItemDoc,
  type MenuItemStatus,
  type PaymentStatus,
  type TransactionDoc,
  type UserDoc,
} from "@/lib/collections"
import { PAGE_SIZE } from "@/lib/constants"
import { escapeRegex } from "@/lib/data/menu"
import { formatCurrency } from "@/lib/format"
import { isPremiumActive } from "@/lib/plans"

export type AdminStats = {
  totalUsers: number
  totalVendors: number
  totalCustomers: number
  totalMenuItems: number
  pendingMenuItems: number
  totalTransactions: number
  paidTransactions: number
  revenue: string
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    totalUsers,
    totalVendors,
    totalCustomers,
    totalMenuItems,
    pendingMenuItems,
    totalTransactions,
    paid,
  ] = await Promise.all([
    usersCollection.countDocuments(),
    usersCollection.countDocuments({ role: "vendor" }),
    usersCollection.countDocuments({ role: "customer" }),
    menuItemsCollection.countDocuments(),
    menuItemsCollection.countDocuments({ status: "pending" }),
    transactionsCollection.countDocuments(),
    transactionsCollection
      .aggregate<{ count: number; amount: number }>([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } },
      ])
      .toArray(),
  ])

  return {
    totalUsers,
    totalVendors,
    totalCustomers,
    totalMenuItems,
    pendingMenuItems,
    totalTransactions,
    paidTransactions: paid[0]?.count ?? 0,
    revenue: formatCurrency(paid[0]?.amount ?? 0),
  }
}

export type AdminUserView = {
  id: string
  name: string
  email: string
  image: string
  role: UserDoc["role"]
  banned: boolean
  banReason: string
  createdAt: Date
  restaurantName: string
  plan: "free" | "premium"
}

export async function listAdminUsers(filters: {
  q?: string
  role?: string
  page?: number
}) {
  const page = Math.max(1, filters.page ?? 1)
  const query: Filter<UserDoc> = {}

  if (filters.role) query.role = filters.role as UserDoc["role"]
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), "i")
    query.$or = [{ name: regex }, { email: regex }]
  }

  const [users, total] = await Promise.all([
    usersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    usersCollection.countDocuments(query),
  ])

  const vendorIds = users
    .filter((user) => user.role === "vendor")
    .map((user) => user._id)
  const vendors =
    vendorIds.length > 0
      ? await vendorsCollection
          .find({ userId: { $in: vendorIds } })
          .toArray()
      : []
  const vendorsByUser = new Map(vendors.map((vendor) => [vendor.userId, vendor]))

  return {
    users: users.map<AdminUserView>((user) => {
      const vendor = vendorsByUser.get(user._id)
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image ?? "",
        role: user.role,
        banned: Boolean(user.banned),
        banReason: user.banReason ?? "",
        createdAt: user.createdAt,
        restaurantName: vendor?.restaurantName ?? "",
        plan: isPremiumActive(vendor) ? "premium" : "free",
      }
    }),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export type AdminMenuItemView = {
  id: string
  name: string
  category: string
  price: number
  imageUrl: string
  status: MenuItemStatus
  isActive: boolean
  rejectionReason: string | null
  createdAt: Date
  vendorId: string
  vendorName: string
  vendorEmail: string
  premium: boolean
}

export async function listAdminMenuItems(filters: {
  q?: string
  status?: string
  page?: number
}) {
  const page = Math.max(1, filters.page ?? 1)
  const query: Filter<MenuItemDoc> = {}

  if (filters.status) query.status = filters.status as MenuItemStatus
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), "i")
    query.$or = [{ name: regex }, { category: regex }, { description: regex }]
  }

  const [items, total] = await Promise.all([
    menuItemsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    menuItemsCollection.countDocuments(query),
  ])

  const vendorIds = [...new Set(items.map((item) => item.vendorId))]
  const vendors =
    vendorIds.length > 0
      ? await vendorsCollection
          .find({ userId: { $in: vendorIds } })
          .toArray()
      : []
  const users =
    vendorIds.length > 0
      ? await usersCollection
          .find({ _id: { $in: vendorIds } })
          .project<{ _id: string; email: string }>({ email: 1 })
          .toArray()
      : []
  const vendorsById = new Map(vendors.map((vendor) => [vendor.userId, vendor]))
  const emailsById = new Map(users.map((user) => [user._id, user.email]))

  return {
    items: items.map<AdminMenuItemView>((item) => {
      const vendor = vendorsById.get(item.vendorId)
      return {
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        price: item.price,
        imageUrl: item.imageUrl,
        status: item.status,
        isActive: item.isActive,
        rejectionReason: item.rejectionReason,
        createdAt: item.createdAt,
        vendorId: item.vendorId,
        vendorName: vendor?.restaurantName ?? "Unknown vendor",
        vendorEmail: emailsById.get(item.vendorId) ?? "",
        premium: isPremiumActive(vendor),
      }
    }),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export type TransactionView = {
  id: string
  vendorId: string
  vendorName: string
  vendorEmail: string
  plan: "free" | "premium"
  amount: string
  paymentStatus: PaymentStatus
  reference: string
  createdAt: Date
}

export async function listTransactions(filters: {
  q?: string
  status?: string
  page?: number
}) {
  const page = Math.max(1, filters.page ?? 1)
  const query: Filter<TransactionDoc> = {}

  if (filters.status) query.paymentStatus = filters.status as PaymentStatus
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), "i")
    query.$or = [
      { vendorName: regex },
      { vendorEmail: regex },
      { reference: regex },
    ]
  }

  const [transactions, total] = await Promise.all([
    transactionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    transactionsCollection.countDocuments(query),
  ])

  return {
    transactions: transactions.map<TransactionView>((transaction) => ({
      id: transaction._id.toString(),
      vendorId: transaction.vendorId,
      vendorName: transaction.vendorName,
      vendorEmail: transaction.vendorEmail,
      plan: transaction.plan,
      amount: formatCurrency(transaction.amount),
      paymentStatus: transaction.paymentStatus,
      reference: transaction.reference,
      createdAt: transaction.createdAt,
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export async function getRecentTransactions(limit = 4) {
  const transactions = await transactionsCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return transactions.map<TransactionView>((transaction) => ({
    id: transaction._id.toString(),
    vendorId: transaction.vendorId,
    vendorName: transaction.vendorName,
    vendorEmail: transaction.vendorEmail,
    plan: transaction.plan,
    amount: formatCurrency(transaction.amount),
    paymentStatus: transaction.paymentStatus,
    reference: transaction.reference,
    createdAt: transaction.createdAt,
  }))
}

export async function getPendingMenuItems(limit = 4) {
  const items = await menuItemsCollection
    .find({ status: "pending" })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray()

  return items.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    vendorId: item.vendorId,
    createdAt: item.createdAt,
  }))
}
