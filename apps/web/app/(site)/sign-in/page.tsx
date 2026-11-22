import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Container } from "@/components/container"
import { safeNextPath, signUpHref } from "@/lib/redirects"
import { authNav } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your PizzaHub account.",
}

type SignInSearchParams = {
  next?: string
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SignInSearchParams>
}) {
  const next = safeNextPath((await searchParams).next, "/")

  return (
    <Container className="flex justify-center py-12 sm:py-16">
      <AuthCard
        title="Welcome back"
        description="Sign in to order, track deliveries, and manage your restaurant."
        className="w-full max-w-xl"
        footer={
          <p>
            New to PizzaHub?{" "}
            <Link
              href={signUpHref(next)}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {authNav.signUp.label}
            </Link>
          </p>
        }
      >
        <SignInForm next={next} />
      </AuthCard>
    </Container>
  )
}
