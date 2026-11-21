import { CURRENCY } from "@/lib/constants"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "—"
  return dateFormatter.format(date)
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "—"
  return dateTimeFormatter.format(date)
}

/** Delivery dates are stored as `YYYY-MM-DD` so time zones cannot shift them. */
export function formatDeliveryDate(value: string) {
  return formatDate(`${value}T00:00:00`)
}

export function todayInputValue() {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  const day = `${now.getDate()}`.padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}
