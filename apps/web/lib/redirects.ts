/** Auth pages must never be used as a post-auth destination (redirect loops). */
const AUTH_PATHS = ["/sign-in", "/sign-up"]

/**
 * Only same-origin, relative paths are allowed as a post-auth destination.
 * Rejects absolute URLs, protocol-relative URLs and backslash tricks so a
 * crafted `?next=` cannot send users to another site.
 */
export function safeNextPath(
  value: string | string[] | undefined,
  fallback = "/"
) {
  const raw = Array.isArray(value) ? value[0] : value

  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.startsWith("/\\")
  ) {
    return fallback
  }

  const url = new URL(raw, "http://localhost")

  if (url.origin !== "http://localhost") {
    return fallback
  }

  const path = `${url.pathname}${url.search}${url.hash}`

  if (
    AUTH_PATHS.some(
      (authPath) => path === authPath || path.startsWith(`${authPath}?`)
    )
  ) {
    return fallback
  }

  return path
}

/** Build `/sign-in?next=…`, omitting `next` when there is nothing useful. */
export function signInHref(nextPath?: string) {
  const next = nextPath ? safeNextPath(nextPath, "") : ""
  return next && next !== "/"
    ? `/sign-in?next=${encodeURIComponent(next)}`
    : "/sign-in"
}

/** Build `/sign-up?next=…`, mirroring the sign-in behaviour. */
export function signUpHref(nextPath?: string) {
  const next = nextPath ? safeNextPath(nextPath, "") : ""
  return next && next !== "/"
    ? `/sign-up?next=${encodeURIComponent(next)}`
    : "/sign-up"
}
