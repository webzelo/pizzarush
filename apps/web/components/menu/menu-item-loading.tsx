import { Skeleton } from "@workspace/ui/components/skeleton"

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"

/** Loading card for the public menu details page. */
export function MenuItemLoading() {
  return (
    <Card className="relative overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardHeader className="space-y-2 p-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}
