import Link from "next/link"
import { ArrowUpRight, Crown, UserRound } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { UserAvatar } from "@/components/auth/user-avatar"

type ProfileSummaryCardProps = {
  name: string
  email: string
  image?: string | null
  roleLabel: string
  plan?: "free" | "premium"
  profileHref?: string
}

/** Compact account section shown on each role's dashboard overview. */
export function ProfileSummaryCard({
  name,
  email,
  image,
  roleLabel,
  plan,
  profileHref,
}: ProfileSummaryCardProps) {
  return (
    <Card className="h-full overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-primary/85 via-primary/55 to-accent" />
      <CardHeader className="relative pb-2">
        <div className="-mt-10 mb-2 flex size-16 items-center justify-center rounded-full bg-card p-1 shadow-sm">
          <UserAvatar
            name={name}
            image={image}
            className="size-14 text-base"
            alt={`${name}'s profile photo`}
          />
        </div>
        <CardTitle className="truncate text-lg">{name}</CardTitle>
        <CardDescription className="truncate">{email}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium">
            <UserRound className="size-3.5" />
            {roleLabel}
          </span>
          {plan ? (
            <span
              className={
                plan === "premium"
                  ? "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  : "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {plan === "premium" ? <Crown className="size-3.5" /> : null}
              {plan === "premium" ? "Premium" : "Free plan"}
            </span>
          ) : null}
        </div>

        {profileHref ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            render={<Link href={profileHref} />}
          >
            Edit profile
            <ArrowUpRight />
          </Button>
        ) : (
          <p className="rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
            Administrator access is managed by your platform owner.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
