import { ObjectId, type Filter } from "mongodb"

import {
  ordersCollection,
  type OrderDoc,
  type OrderStatus,
  type OrderStatusChange,
  type PaymentStatus,
} from "@/lib/collections"
import { ACTIVE_ORDER_STATUSES, CURRENCY, PAGE_SIZE } from "@/lib/constants"
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
  /** Stored on the order when it is placed (see backend "updatable order info"). */
  amount: number
  currency: string
  paymentStatus: PaymentStatus
  paymentReference: string | null
  deliveryDate: string
  deliveryAddress: string
  customerMessage: string
  status: OrderStatus
  statusHistory: OrderStatusChange[]
  createdAt: Date
}

export type OrderCounts = {
  total: number
  pending: number
  accepted: number
  rejected: number
  cancelled: number
}

/** Older orders get a single derived entry until they change status again. */
function statusHistoryFor(order: OrderDoc): OrderStatusChange[] {
  if (order.statusHistory?.length) return order.statusHistory
  return [{ status: "pending", at: order.createdAt }]
}

/** Shared update payload so every status change is recorded in the timeline. */
export function statusChangeUpdate(status: OrderStatus, at = new Date()) {
  return {
    $set: { status, updatedAt: at },
    $push: { statusHistory: { status, at } },
  }
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
    // Fall back to the same computed value for rows created before the
    // backend stored payment fields.
    amount: order.amount ?? order.itemPrice * order.quantity,
    currency: order.currency ?? CURRENCY,
    paymentStatus: order.paymentStatus ?? "pending",
    paymentReference: order.paymentReference ?? null,
    deliveryDate: order.deliveryDate,
    deliveryAddress: order.deliveryAddress,
    customerMessage: order.customerMessage,
    status: order.status,
    statusHistory: statusHistoryFor(order),
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

export async function getRecentOrders(match: Filter<OrderDoc>, limit = 4) {
  const orders = await ordersCollection
    .find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return orders.map(toOrderView)
}

/** New orders always start here; the restaurant moves them to accepted/rejected. */
export type NewCustomerOrder = {
  customerId: string
  customerName: string
  customerEmail: string
  item: {
    id: string
    vendorId: string
    vendorName: string
    name: string
    imageUrl: string
    price: number
  }
  quantity: number
  deliveryDate: string
  deliveryAddress: string
  customerMessage: string
}

/** True when the customer already has a pending/accepted order for that slot. */
export function activeOrderExists(
  customerId: string,
  menuItemId: string,
  deliveryDate: string
) {
  return ordersCollection
    .countDocuments({
      customerId,
      menuItemId,
      deliveryDate,
      status: { $in: [...ACTIVE_ORDER_STATUSES] },
    })
    .then((count) => count > 0)
}

/** Creates an order with a trusted snapshot of the selected item and vendor. */
export async function createCustomerOrder(
  input: NewCustomerOrder
): Promise<OrderView> {
  const now = new Date()
  const amount = input.item.price * input.quantity

  const order: OrderDoc = {
    _id: new ObjectId(),
    customerId: input.customerId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    vendorId: input.item.vendorId,
    vendorName: input.item.vendorName,
    menuItemId: input.item.id,
    itemName: input.item.name,
    itemImageUrl: input.item.imageUrl,
    itemPrice: input.item.price,
    quantity: input.quantity,
    amount,
    currency: CURRENCY,
    paymentStatus: "pending",
    paymentReference: null,
    deliveryDate: input.deliveryDate,
    deliveryAddress: input.deliveryAddress,
    customerMessage: input.customerMessage,
    status: "pending",
    statusHistory: [{ status: "pending", at: now }],
    createdAt: now,
    updatedAt: now,
  }

  await ordersCollection.insertOne(order)
  return toOrderView(order)
}
