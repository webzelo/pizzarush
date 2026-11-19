import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { Container } from "@/components/container"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function VendorPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">
          Vendor dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome, {session.user.name}
        </h1>
        <p className="mt-4 text-muted-foreground">
          Your restaurant account is ready. Menu and order management are coming
          next.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <SignOutButton />
        </div>
      </div>
    </Container>
  )
}
