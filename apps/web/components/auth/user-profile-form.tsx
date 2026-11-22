"use client"

import { useActionState, useEffect, useRef } from "react"

import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import { UserAvatar } from "@/components/auth/user-avatar"
import { SubmitButton } from "@/components/dashboard/submit-button"
import { ImageUploadField } from "@/components/dashboard/image-upload-field"
import { initialFormState } from "@/lib/action-state"
import { saveUserProfile } from "@/lib/actions/user-profile"
import { useSession } from "@/lib/auth-client"

export type UserProfileValues = {
  name: string
  image?: string | null
}

/** Shared account form for vendors and customers. */
export function UserProfileForm({ user }: { user: UserProfileValues }) {
  const [state, formAction] = useActionState(saveUserProfile, initialFormState)
  const { refetch } = useSession()
  const router = useRouter()
  const refreshedFor = useRef<typeof state | null>(null)
  const errors = state.fieldErrors ?? {}

  // Keep the navbar/sidebar avatar and name in sync after a successful save.
  useEffect(() => {
    if (state.status !== "success" || refreshedFor.current === state) return
    refreshedFor.current = state
    void refetch()
    router.refresh()
  }, [state, refetch, router])

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 lg:grid-cols-[1fr_300px]"
    >
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            This name appears on your orders, menu activity and account menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profileName">Full name</FieldLabel>
              <Input
                id="profileName"
                name="name"
                defaultValue={user.name}
                placeholder="Your name"
                required
              />
              <FieldError>{errors.name}</FieldError>
            </Field>

            <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              Your email, role and subscription status are managed by Pizzarush
              and cannot be changed here.
            </p>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>Optional. Square images look best.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={user.name}
              image={user.image}
              className="size-10"
            />
            <p className="text-xs text-muted-foreground">
              Shown in your account menu.
            </p>
          </div>
          <ImageUploadField
            name="image"
            label="Upload profile photo"
            description="Leave empty to use your initials."
            defaultValue={user.image ?? ""}
            error={errors.image}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col items-start gap-3 lg:col-span-2">
        {state.status === "error" ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {state.message}
          </p>
        ) : null}

        {state.status === "success" ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            {state.message}
          </p>
        ) : null}

        <SubmitButton size="lg" pendingLabel="Saving…">
          Save profile
        </SubmitButton>
      </div>
    </form>
  )
}
