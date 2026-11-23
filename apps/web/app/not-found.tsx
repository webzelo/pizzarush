import Link from "next/link"

import { MapPin } from "lucide-react"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export const metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-muted-foreground" />
            Page not found
          </CardTitle>
          <CardDescription>
            We couldn’t find the page you’re looking for.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/" />}>Back home</Button>
          <Button variant="outline" render={<Link href="/menu" />}>
            Browse menu
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
