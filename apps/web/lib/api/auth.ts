let cached: { token: string | null; at: number } | null = null
const TTL_MS = 60_000

/**
 * Returns the signed-in user's Better Auth session token, fetched from the
 * Next.js route `/api/session-token` and cached briefly. The backend's
 * `verifyToken` middleware (`src/middleware/auth.js`) loads the user from
 * the `session` collection by this token — user and role never come from
 * the client.
 */
export async function getSessionToken(): Promise<string | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.token
  try {
    const response = await fetch("/api/session-token", { cache: "no-store" })
    const body = response.ok ? await response.json() : null
    cached = { token: body?.token ?? null, at: Date.now() }
  } catch {
    cached = { token: null, at: Date.now() }
  }
  return cached.token
}
