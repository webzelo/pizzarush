import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Sign Up",
}

export default function SignUpPage() {
  return (
    <PagePlaceholder
      title="Sign Up"
      description="Create your PizzaHub account. Registration will be available here soon."
    />
  )
}
