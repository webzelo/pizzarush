import type { Filter } from "mongodb"

import {
  ordersCollection,
  type OrderDoc,
  type OrderStatus,
} from "@/lib/collections"
import { PAGE_SIZE } from "@/lib/constants"
import { toObjectId } from "@/lib/object-id"

export type OrderView = {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  vendorId: string
  vendorName: string
  itemName: string
  itemImageUrl: string
  itemPrice: number
  quantity: number
  total: number
  deliveryDate: string
  deliveryAddress: string
  customerMessage: string
  status: OrderStatus
  createdAt: Date
}

export type OrderCounts = {
  total: number
  pending: number
  accepted: number
  rejected: number
  cancelled: number
}

function toOrderView(order: OrderDoc): OrderView {
  return {
    id: order._id.toString(),
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    vendorId: order.vendorId,
    vendorName: order.vendorName,
    itemName: order.itemName,
    itemImageUrl: order.itemImageUrl,
    itemPrice: order.itemPrice,
    quantity: order.quantity,
    total: order.itemPrice * order.quantity,
    deliveryDate: order.deliveryDate,
    deliveryAddress: order.deliveryAddress,
    customerMessage: order.customerMessage,
    status: order.status,
    createdAt: order.createdAt,
  }
}

async function orderCounts(match: Filter<OrderDoc>): Promise<OrderCounts> {
  const rows = await ordersCollection
    .aggregate<{ _id: OrderStatus; count: number }>([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray()

  const counts: OrderCounts = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
  }

  for (const row of rows) {
    counts[row._id] = row.count
    counts.total += row.count
  }

  return counts
}

async function listOrders(
  match: Filter<OrderDoc>,
  options: { status?: OrderStatus; page?: number }
) {
  const page = Math.max(1, options.page ?? 1)
  const query: Filter<OrderDoc> = { ...match }
  if (options.status) query.status = options.status

  const [orders, total] = await Promise.all([
    ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    ordersCollection.countDocuments(query),
  ])

  return {
    orders: orders.map(toOrderView),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export function listCustomerOrders(
  customerId: string,
  options: { status?: OrderStatus; page?: number }
) {
  return listOrders({ customerId }, options)
}

export function listVendorOrders(
  vendorId: string,
  options: { status?: OrderStatus; page?: number }
) {
  return listOrders({ vendorId }, options)
}

export function getCustomerOrderCounts(customerId: string) {
  return orderCounts({ customerId })
}

export function getVendorOrderCounts(vendorId: string) {
  return orderCounts({ vendorId })
}

export async function getCustomerOrder(customerId: string, orderId: string) {
  const objectId = toObjectId(orderId)
  if (!objectId) return null

  const order = await ordersCollection.findOne({
    _id: objectId,
    customerId,
  })

  return order ? toOrderView(order) : null
}

export async function getRecentOrders(
  match: Filter<OrderDoc>,
  limit = 4
) {
  const orders = await ordersCollection
    .find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return orders.map(toOrderView)
}
