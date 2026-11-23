import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { OrderCounts, TrendPoint } from "@/lib/data/orders"

export type ChartSegment = {
  label: string
  value: number
  /** A CSS color, normally one of the warm chart tokens. */
  color: string
}

export function orderStatusSegments(counts: OrderCounts): ChartSegment[] {
  return [
    {
      label: "Pending",
      value: counts.pending,
      color: "var(--chart-2)",
    },
    {
      label: "Accepted",
      value: counts.accepted,
      color: "var(--chart-4)",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      color: "var(--chart-1)",
    },
    {
      label: "Cancelled",
      value: counts.cancelled,
      color: "var(--chart-5)",
    },
  ]
}

type StatusDonutChartProps = {
  title: string
  description: string
  segments: ChartSegment[]
  totalLabel?: string
}

/** Dependency-free donut chart built from a CSS conic gradient. */
export function StatusDonutChart({
  title,
  description,
  segments,
  totalLabel = "Total",
}: StatusDonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  let cursor = 0
  const gradient = total
    ? `conic-gradient(${segments
        .map((segment) => {
          const start = cursor
          cursor += (segment.value / total) * 100
          return `${segment.color} ${start}% ${cursor}%`
        })
        .join(", ")})`
    : "conic-gradient(var(--muted) 0% 100%)"

  const summary = segments
    .map((segment) => `${segment.label}: ${segment.value}`)
    .join(", ")

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div
          className="relative size-36 shrink-0 rounded-full sm:size-40"
          style={{ background: gradient }}
          role="img"
          aria-label={`${title}. ${summary}.`}
        >
          <div className="absolute inset-[18%] rounded-full bg-card shadow-inner" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground">{totalLabel}</span>
          </div>
        </div>

        <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-1">
          {segments.map((segment) => (
            <li
              key={segment.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-muted-foreground">
                  {segment.label}
                </span>
              </span>
              <span className="font-semibold tabular-nums">
                {segment.value}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

type TrendChartProps = {
  title: string
  description: string
  points: TrendPoint[]
  valueLabel?: string
  formatValue?: (value: number) => string
}

/** Lightweight bar graph with no client-side chart dependency. */
export function TrendChart({
  title,
  description,
  points,
  valueLabel = "items",
  formatValue = (value) => String(value),
}: TrendChartProps) {
  const max = Math.max(1, ...points.map((point) => point.value))
  const summary = points
    .map((point) => `${point.date}: ${formatValue(point.value)}`)
    .join(", ")

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="relative flex h-48 items-end gap-1 sm:gap-2"
          role="img"
          aria-label={`${title}. ${summary}.`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed" />
          <div className="pointer-events-none absolute inset-x-0 bottom-6 border-t" />

          {points.map((point) => {
            const height =
              point.value === 0
                ? "2px"
                : `${Math.max(8, (point.value / max) * 100)}%`

            return (
              <div
                key={point.date}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                title={`${point.date}: ${formatValue(point.value)} ${valueLabel}`}
              >
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums sm:text-xs">
                  {formatValue(point.value)}
                </span>
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/55 to-primary"
                    style={{ height }}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  {point.label}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
