export const CATEGORIES = ["Pizza", "Sides", "Drinks", "Desserts"] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export const MENU_STATUSES = ["pending", "approved", "rejected"] as const
export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
] as const

/** Orders still being handled by the restaurant. */
export const ACTIVE_ORDER_STATUSES = ["pending", "accepted"] as const

export const PAGE_SIZE = 8
export const MENU_PAGE_SIZE = 12

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]
/** ImgBB returns both hosts depending on the upload format. */
export const IMAGE_HOSTS = ["i.ibb.co", "ibb.co"]

export const CURRENCY = "USD"
export const PREMIUM_PRICE = 9.99
export const PREMIUM_DURATION_DAYS = 30
export const FREE_ACTIVE_ITEM_LIMIT = 3
