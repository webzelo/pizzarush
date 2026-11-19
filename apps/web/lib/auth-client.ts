import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { userAdditionalFields } from "@/lib/auth/fields"

/**
 * Same-origin client: the auth handler lives at /api/auth, so no baseURL is
 * needed. Only NEXT_PUBLIC_* env vars are exposed to the browser.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields({ user: userAdditionalFields })],
})

export const { signIn, signUp, signOut, useSession } = authClient
