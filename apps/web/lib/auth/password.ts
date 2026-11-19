export const MIN_PASSWORD_LENGTH = 6
export const MAX_PASSWORD_LENGTH = 128

export type PasswordRuleId = "length" | "uppercase" | "lowercase"

export type PasswordRule = {
  id: PasswordRuleId
  label: string
  test: (value: string) => boolean
}

/**
 * Single source of truth for password rules: the sign-up checklist and the
 * server-side hook both read from this list.
 */
export const passwordRules: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (value) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
]

export type PasswordCheck = {
  id: PasswordRuleId
  label: string
  passed: boolean
}

export function checkPassword(value: string): PasswordCheck[] {
  return passwordRules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(value),
  }))
}

export function isPasswordValid(value: string) {
  return passwordRules.every((rule) => rule.test(value))
}

export function passwordRequirementsMessage() {
  return `Password must be at least ${MIN_PASSWORD_LENGTH} characters and include one uppercase and one lowercase letter.`
}
