import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { buttonVariants } from "@workspace/ui/components/button"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { Container } from "@/components/container"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function CustomerPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">
          Customer dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome, {session.user.name}
        </h1>
        <p className="mt-4 text-muted-foreground">
          Your account is ready. Browse the menu and place your first order.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/menu" className={buttonVariants({ size: "lg" })}>
            Browse the menu
          </Link>
          <SignOutButton />
        </div>
      </div>
    </Container>
  )
}
