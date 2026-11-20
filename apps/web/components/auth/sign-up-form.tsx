"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, User } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { AuthDivider } from "@/components/auth/auth-divider"
import { FormAlert } from "@/components/auth/form-alert"
import { FormField } from "@/components/auth/form-field"
import { GoogleButton } from "@/components/auth/google-button"
import { PasswordField } from "@/components/auth/password-field"
import { ProfileImageField } from "@/components/auth/profile-image-field"
import { RoleSelector } from "@/components/auth/role-selector"
import { authClient } from "@/lib/auth-client"
import {
  checkPassword,
  isPasswordValid,
  passwordRequirementsMessage,
} from "@/lib/auth/password"
import type { PublicRole } from "@/lib/auth/roles"
import { roleOptions } from "@/lib/auth/roles"
import { isHttpUrl, isValidEmail } from "@/lib/auth/validation"

type SignUpValues = {
  name: string
  email: string
  password: string
  image: string
  role: PublicRole
}

type FieldErrors = Partial<Record<keyof SignUpValues, string>>

type Status = {
  tone: "error" | "success"
  message: string
} | null

const initialValues: SignUpValues = {
  name: "",
  email: "",
  password: "",
  image: "",
  role: "customer",
}

export function SignUpForm() {
  const router = useRouter()
  const [values, setValues] = useState<SignUpValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  const passwordChecks = checkPassword(values.password)

  const handleChange =
    (field: keyof SignUpValues) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }

  const handleRoleChange = (role: PublicRole) => {
    setValues((current) => ({ ...current, role }))
    setErrors((current) => ({ ...current, role: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) {
      return
    }

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setStatus(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      const { error } = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        image: values.image.trim() || undefined,
        role: values.role,
      })

      if (error) {
        setStatus({ tone: "error", message: signUpErrorMessage(error) })
        setSubmitting(false)
        return
      }

      setStatus({
        tone: "success",
        message: "Your account is ready. Taking you home...",
      })
      router.replace("/")
      router.refresh()
    } catch {
      setStatus({
        tone: "error",
        message: "Something went wrong. Please try again.",
      })
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <GoogleButton
        callbackURL="/"
        errorCallbackURL="/sign-up"
        onError={(message) => setStatus({ tone: "error", message })}
      />

      <AuthDivider>or sign up with email</AuthDivider>

      {status ? (
        <FormAlert tone={status.tone}>{status.message}</FormAlert>
      ) : null}

      <FormField
        name="name"
        label="Full name"
        autoComplete="name"
        placeholder="Jane Doe"
        value={values.name}
        onChange={handleChange("name")}
        error={errors.name}
        startIcon={<User className="size-4" aria-hidden="true" />}
      />

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
        autoComplete="new-password"
        placeholder="Create a password"
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
        checks={passwordChecks}
      />

      <ProfileImageField
        value={values.image}
        onChange={(image) => {
          setValues((current) => ({ ...current, image }))
          setErrors((current) => ({ ...current, image: undefined }))
        }}
        error={errors.image}
      />

      <RoleSelector
        options={roleOptions}
        value={values.role}
        onChange={handleRoleChange}
        error={errors.role}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting || !isPasswordValid(values.password)}
      >
        {submitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Admin accounts are assigned by PizzaHub, never created here.
      </p>
    </form>
  )
}

function validate(values: SignUpValues): FieldErrors {
  const errors: FieldErrors = {}

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name."
  }

  if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email address."
  }

  if (!isPasswordValid(values.password)) {
    errors.password = passwordRequirementsMessage()
  }

  if (values.image.trim() && !isHttpUrl(values.image)) {
    errors.image = "Enter a valid image URL starting with http."
  }

  return errors
}

function signUpErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Try signing in instead."
    case "INVALID_EMAIL":
      return "Enter a valid email address."
    case "PASSWORD_TOO_SHORT":
    case "PASSWORD_TOO_LONG":
      return passwordRequirementsMessage()
    default:
      return (
        error.message || "We could not create your account. Please try again."
      )
  }
}
