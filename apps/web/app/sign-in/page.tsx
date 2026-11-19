import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Container } from "@/components/container"
import { authNav } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your PizzaHub account.",
}

export default function SignInPage() {
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
              href={authNav.signUp.href}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {authNav.signUp.label}
            </Link>
          </p>
        }
      >
        <SignInForm />
      </AuthCard>
    </Container>
  )
}
