import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Container } from "@/components/container"
import { authNav } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a PizzaHub account as a customer or a restaurant vendor.",
}

export default function SignUpPage() {
  return (
    <Container className="flex justify-center py-12 sm:py-16">
      <AuthCard
        title="Create your account"
        description="Order from your favourite restaurants, or bring your own to PizzaHub."
        className="w-full max-w-xl"
        footer={
          <p>
            Already have an account?{" "}
            <Link
              href={authNav.signIn.href}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {authNav.signIn.label}
            </Link>
          </p>
        }
      >
        <SignUpForm />
      </AuthCard>
    </Container>
  )
}
