import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function SignInPage() {
  return (
    <PagePlaceholder
      title="Sign In"
      description="Sign in to your PizzaHub account. Authentication will be available here soon."
    />
  )
}
