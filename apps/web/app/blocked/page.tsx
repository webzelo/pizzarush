import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ShieldX } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { getCurrentSession } from "@/lib/dal/session"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Account blocked",
}

export default async function BlockedPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="size-5" />
          </span>
          <CardTitle className="mt-2">Your account is blocked</CardTitle>
          <CardDescription>
            {session.user.banReason ||
              "An administrator has blocked this account. Contact support if you think this is a mistake."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  )
}
