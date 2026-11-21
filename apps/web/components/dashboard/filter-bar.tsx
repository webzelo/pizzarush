"use client"

import type { FormEvent } from "react"
import { useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Spinner } from "@workspace/ui/components/spinner"

export type FilterOption = {
  label: string
  value: string
}

export type FilterDefinition = {
  key: string
  label: string
  allLabel?: string
  options: FilterOption[]
}

type FilterBarProps = {
  searchKey?: string
  searchPlaceholder?: string
  showSearch?: boolean
  filters?: FilterDefinition[]
}

/** Keeps search and filters in the URL so server components can query Mongo. */
export function FilterBar({
  searchKey = "q",
  searchPlaceholder = "Search…",
  showSearch = true,
  filters = [],
}: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get(searchKey) ?? "")

  const hasFilters = (showSearch ? [searchKey] : [])
    .concat(filters.map((filter) => filter.key))
    .some((key) => Boolean(searchParams.get(key)))

  const push = (params: URLSearchParams) => {
    params.delete("page")
    const next = params.toString()
    startTransition(() => {
      router.push(next ? `${pathname}?${next}` : pathname, { scroll: false })
    })
  }

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    push(params)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const value = query.trim()
    if (value) params.set(searchKey, value)
    else params.delete(searchKey)
    push(params)
  }

  const handleReset = () => {
    setQuery("")
    startTransition(() => router.push(pathname, { scroll: false }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
    >
      {showSearch ? (
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
            aria-label={searchPlaceholder}
          />
        </div>
      ) : null}

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={searchParams.get(filter.key) ?? "all"}
          onValueChange={(value) => updateFilter(filter.key, value)}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label={filter.label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {filter.allLabel ?? `All ${filter.label.toLowerCase()}`}
            </SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Spinner /> : null}
        {showSearch ? "Search" : "Apply"}
      </Button>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={pending}
        >
          <X />
          Reset
        </Button>
      ) : null}
    </form>
  )
}
