import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export const metadata = {
  title: "Menu item not found",
}

export default function MenuItemNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="rounded-full bg-muted p-3">
        <ArrowLeft className="size-5 text-muted-foreground" />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>This dish is not available</CardTitle>
          <CardDescription>
            It may have been removed or temporarily disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Link className={buttonVariants()} href="/menu">
            Back to menu
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
