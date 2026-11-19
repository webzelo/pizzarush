"use client"

import { useState } from "react"

import { Button } from "@workspace/ui/components/button"

import { authClient } from "@/lib/auth-client"

type GoogleButtonProps = {
  callbackURL: string
  errorCallbackURL: string
  label?: string
  onError?: (message: string) => void
}

export function GoogleButton({
  callbackURL,
  errorCallbackURL,
  label = "Continue with Google",
  onError,
}: GoogleButtonProps) {
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    setPending(true)

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL,
    })

    // On success the browser is redirected to Google, so this usually only
    // runs when the request could not even be started.
    if (error) {
      setPending(false)
      onError?.(error.message ?? "Google sign-in failed. Please try again.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        <GoogleIcon />
      )}
      {pending ? "Redirecting..." : label}
    </Button>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v2.85h3.88c2.27-2.09 3.54-5.17 3.54-8.72Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-2.85c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.44a7.2 7.2 0 0 1 0-4.88V6.47H1.29a12 12 0 0 0 0 11.06l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.47l3.98 3.09C6.22 6.71 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}
