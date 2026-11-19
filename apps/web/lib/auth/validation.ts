const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim())
}

export function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim())
}
