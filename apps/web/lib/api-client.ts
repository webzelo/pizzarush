/**
 * Reusable browser-side client for mutating calls to the Express API.
 *
 * Server components read data via the `lib/api/*` functions, which forward
 * the Better Auth cookie (see `lib/api/menu.ts` for the pattern). Writes —
 * saving/updating order info, marking an order paid, etc. — happen in
 * browser components and go through here.
 */

import { getSessionToken } from "@/lib/api/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string }

/**
 * Fetch a JSON endpoint and normalise the outcome into `{ ok, message, data }`.
 * Never throws: the caller maps `ok: false` to a UI message or toast.
 */
export async function apiClient<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const token = await getSessionToken()
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
    })

    const body = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null

    if (!response.ok) {
      const message =
        typeof body?.error === "string"
          ? body.error
          : `Request failed with status ${response.status}`
      return { ok: false, message }
    }

    return { ok: true, data: body as T }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    }
  }
}
