"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { AuthDivider } from "@/components/auth/auth-divider"
import { FormAlert } from "@/components/auth/form-alert"
import { FormField } from "@/components/auth/form-field"
import { GoogleButton } from "@/components/auth/google-button"
import { PasswordField } from "@/components/auth/password-field"
import { authClient } from "@/lib/auth-client"
import { isValidEmail } from "@/lib/auth/validation"

type SignInValues = {
  email: string
  password: string
}

type FieldErrors = Partial<Record<keyof SignInValues, string>>

export function SignInForm() {
  const router = useRouter()
  const [values, setValues] = useState<SignInValues>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange =
    (field: keyof SignInValues) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) {
      return
    }

    const nextErrors: FieldErrors = {}
    if (!isValidEmail(values.email)) {
      nextErrors.email = "Enter a valid email address."
    }
    if (!values.password) {
      nextErrors.password = "Enter your password."
    }

    setErrors(nextErrors)
    setError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      const { error } = await authClient.signIn.email({
        email: values.email.trim(),
        password: values.password,
      })

      if (error) {
        setError(signInErrorMessage(error))
        setSubmitting(false)
        return
      }

      router.replace("/")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <GoogleButton
        callbackURL="/"
        errorCallbackURL="/sign-in"
        label="Continue with Google"
        onError={setError}
      />

      <AuthDivider>or sign in with email</AuthDivider>

      {error ? <FormAlert tone="error">{error}</FormAlert> : null}

      <FormField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={handleChange("email")}
        error={errors.email}
        startIcon={<Mail className="size-4" aria-hidden="true" />}
      />

      <PasswordField
        name="password"
        label="Password"
        autoComplete="current-password"
        placeholder="Your password"
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
      />

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}

function signInErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_PASSWORD":
      return "Incorrect email or password."
    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email before signing in."
    default:
      return error.message || "We could not sign you in. Please try again."
  }
}
