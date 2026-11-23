import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"

/**
 * Serves the Better Auth session token for the signed-in user so the
 * browser can send it to the Express API as
 * `Authorization: Bearer <token>` (see `src/middleware/auth.js` on the
 * server, which looks the session up in the `session` collection).
 */
export async function GET() {
  const result = await auth.api.getSession({ headers: await headers() })
  if (!result?.session) {
    return NextResponse.json({ token: null }, { status: 401 })
  }
  return NextResponse.json({ token: result.session.token })
}
