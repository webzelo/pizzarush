import type {
  MenuFilters,
  PublicMenuDetail,
  PublicMenuItem,
} from "@/lib/data/menu"
import type { ReviewSummary, ReviewView } from "@/lib/data/reviews"

/**
 * Server-only client for the Express menu API. `API_URL` is intentionally not
 * public: the browser never calls Express directly.
 */
const API_URL = process.env.API_URL ?? "http://localhost:5000"
const REQUEST_TIMEOUT_MS = 8_000

export type PublicMenuResponse = {
  items: PublicMenuItem[]
  total: number
  page: number
  pageCount: number
}

export type MenuFilterOptions = {
  categories: string[]
  areas: string[]
  cities: string[]
}

export type MenuItemReviews = {
  summary: ReviewSummary
  reviews: ReviewView[]
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Menu API request failed (${response.status}) for ${path}`)
  }

  return (await response.json()) as T
}

export async function fetchPublicMenu(filters: MenuFilters) {
  const params = new URLSearchParams()

  if (filters.q) params.set("q", filters.q)
  if (filters.category) params.set("category", filters.category)
  if (filters.area) params.set("area", filters.area)
  if (filters.city) params.set("city", filters.city)
  if (filters.page && filters.page > 1) params.set("page", String(filters.page))

  const query = params.toString()
  return apiFetch<PublicMenuResponse>(`/api/menu${query ? `?${query}` : ""}`)
}

export async function fetchMenuFilterOptions() {
  return apiFetch<MenuFilterOptions>("/api/menu/filters")
}

export async function fetchPublicMenuItem(id: string) {
  const response = await fetch(
    `${API_URL}/api/menu/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      `Menu API request failed (${response.status}) for item ${id}`
    )
  }

  return (await response.json()) as PublicMenuDetail
}

/** Public reviews for the menu item details page. */
export async function fetchMenuItemReviews(id: string) {
  return apiFetch<MenuItemReviews>(
    `/api/menu/${encodeURIComponent(id)}/reviews`
  )
}
