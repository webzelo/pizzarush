import type { Filter } from "mongodb"

import {
  menuItemsCollection,
  usersCollection,
  vendorsCollection,
  type MenuItemDoc,
  type MenuItemStatus,
  type VendorDoc,
} from "@/lib/collections"
import { MENU_PAGE_SIZE } from "@/lib/constants"
import { toObjectId } from "@/lib/object-id"
import { isPremiumActive } from "@/lib/plans"

export type MenuFilters = {
  q?: string
  category?: string
  area?: string
  city?: string
  page?: number
}

export type MenuItemView = {
  id: string
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
}

export type PublicMenuItem = {
  id: string
  vendorId: string
  name: string
  category: string
  description: string
  price: number
  area: string
  city: string
  imageUrl: string
  vendorName: string
  vendorCuisine: string
  premium: boolean
  /** Supplied by the menu API; optional so older API versions still render. */
  ratingAverage?: number | null
  reviewCount?: number
}

export type PublicMenuDetail = PublicMenuItem & {
  vendor: {
    id: string
    name: string
    description: string
    cuisine: string
    phone: string
    address: string
    area: string
    city: string
    logoUrl: string
    premium: boolean
  }
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function toMenuItemView(item: MenuItemDoc): MenuItemView {
  return {
    id: item._id.toString(),
    vendorId: item.vendorId,
    name: item.name,
    category: item.category,
    description: item.description,
    price: item.price,
    area: item.area,
    city: item.city,
    imageUrl: item.imageUrl,
    status: item.status,
    isActive: item.isActive,
    rejectionReason: item.rejectionReason,
    createdAt: item.createdAt,
  }
}

async function blockedVendorIds(vendorIds: string[]) {
  if (vendorIds.length === 0) return new Set<string>()

  const blocked = await usersCollection
    .find({ _id: { $in: vendorIds }, banned: true })
    .project<{ _id: string }>({ _id: 1 })
    .toArray()

  return new Set(blocked.map((user) => user._id))
}

function vendorLookup(vendors: VendorDoc[]) {
  return new Map(vendors.map((vendor) => [vendor.userId, vendor]))
}

/** Public browse only ever sees approved, available items from active vendors. */
export async function listPublicMenu(filters: MenuFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const query: Filter<MenuItemDoc> = { status: "approved", isActive: true }

  if (filters.category) {
    query.category = filters.category
  }
  if (filters.area) {
    query.area = filters.area
  }
  if (filters.city) {
    query.city = filters.city
  }
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), "i")
    query.$or = [{ name: regex }, { description: regex }, { category: regex }]
  }

  const items = await menuItemsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray()

  if (items.length === 0) {
    return { items: [] as PublicMenuItem[], total: 0, page: 1, pageCount: 1 }
  }

  const vendorIds = [...new Set(items.map((item) => item.vendorId))]
  const [vendors, blocked] = await Promise.all([
    vendorsCollection.find({ userId: { $in: vendorIds } }).toArray(),
    blockedVendorIds(vendorIds),
  ])
  const vendorsById = vendorLookup(vendors)

  const visible = items
    .filter((item) => vendorsById.has(item.vendorId))
    .filter((item) => !blocked.has(item.vendorId))
    .map<PublicMenuItem>((item) => {
      const vendor = vendorsById.get(item.vendorId)!
      return {
        id: item._id.toString(),
        vendorId: item.vendorId,
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        area: item.area,
        city: item.city,
        imageUrl: item.imageUrl,
        vendorName: vendor.restaurantName,
        vendorCuisine: vendor.cuisine,
        premium: isPremiumActive(vendor),
      }
    })
    .sort((a, b) => Number(b.premium) - Number(a.premium))

  const total = visible.length
  const pageCount = Math.max(1, Math.ceil(total / MENU_PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * MENU_PAGE_SIZE

  return {
    items: visible.slice(start, start + MENU_PAGE_SIZE),
    total,
    page: safePage,
    pageCount,
  }
}

export async function getPublicMenuItem(id: string) {
  const objectId = toObjectId(id)
  if (!objectId) return null

  const item = await menuItemsCollection.findOne({
    _id: objectId,
    status: "approved",
    isActive: true,
  })
  if (!item) return null

  const [vendor, blockedUser] = await Promise.all([
    vendorsCollection.findOne({ userId: item.vendorId }),
    usersCollection.findOne({ _id: item.vendorId, banned: true }),
  ])
  if (!vendor || blockedUser) return null

  const premium = isPremiumActive(vendor)

  return {
    id: item._id.toString(),
    vendorId: item.vendorId,
    name: item.name,
    category: item.category,
    description: item.description,
    price: item.price,
    area: item.area,
    city: item.city,
    imageUrl: item.imageUrl,
    vendorName: vendor.restaurantName,
    vendorCuisine: vendor.cuisine,
    premium,
    vendor: {
      id: vendor.userId,
      name: vendor.restaurantName,
      description: vendor.description,
      cuisine: vendor.cuisine,
      phone: vendor.phone,
      address: vendor.address,
      area: vendor.area,
      city: vendor.city,
      logoUrl: vendor.logoUrl,
      premium,
    },
  } satisfies PublicMenuDetail
}

export async function getMenuFilterOptions() {
  const [areas, cities] = await Promise.all([
    menuItemsCollection.distinct("area", { status: "approved", isActive: true }),
    menuItemsCollection.distinct("city", { status: "approved", isActive: true }),
  ])

  return {
    areas: areas.filter(Boolean).sort(),
    cities: cities.filter(Boolean).sort(),
  }
}

export async function listVendorMenu(
  vendorId: string,
  filters: { status?: MenuItemStatus; page?: number }
) {
  const page = Math.max(1, filters.page ?? 1)
  const query: Filter<MenuItemDoc> = { vendorId }
  if (filters.status) query.status = filters.status

  const [items, total] = await Promise.all([
    menuItemsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * MENU_PAGE_SIZE)
      .limit(MENU_PAGE_SIZE)
      .toArray(),
    menuItemsCollection.countDocuments(query),
  ])

  return {
    items: items.map(toMenuItemView),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / MENU_PAGE_SIZE)),
  }
}

export async function getVendorMenuItem(vendorId: string, itemId: string) {
  const objectId = toObjectId(itemId)
  if (!objectId) return null

  const item = await menuItemsCollection.findOne({
    _id: objectId,
    vendorId,
  })

  return item ? toMenuItemView(item) : null
}

/** Items that still consume a Free-plan slot (rejected items do not). */
export function activeItemLimitFilter(vendorId: string): Filter<MenuItemDoc> {
  return { vendorId, isActive: true, status: { $ne: "rejected" } }
}

export async function countActiveItemsForLimit(vendorId: string) {
  return menuItemsCollection.countDocuments(activeItemLimitFilter(vendorId))
}
