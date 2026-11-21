import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

type SearchParams = Record<string, string | string[] | undefined>

export function buildPageHref(
  basePath: string,
  searchParams: SearchParams,
  page: number
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue
    if (Array.isArray(value)) {
      for (const entry of value) params.append(key, entry)
    } else {
      params.set(key, value)
    }
  }

  if (page > 1) params.set("page", String(page))

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

type TablePaginationProps = {
  page: number
  pageCount: number
  total: number
  basePath: string
  searchParams: SearchParams
}

export function TablePagination({
  page,
  pageCount,
  total,
  basePath,
  searchParams,
}: TablePaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Page {page} of {pageCount} · {total} total
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href={buildPageHref(basePath, searchParams, page - 1)} />
            }
          >
            Previous
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {page < pageCount ? (
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href={buildPageHref(basePath, searchParams, page + 1)} />
            }
          >
            Next
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
