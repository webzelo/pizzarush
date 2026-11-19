import type { StandardSchemaV1 } from "better-auth"

/**
 * Minimal Standard Schema validator so Better Auth can validate custom user
 * fields server-side without pulling in a schema library.
 *
 * Better Auth returns a 400 BAD_REQUEST when the first issue is produced.
 */
export function createValidator<T>(
  isValid: (value: unknown) => value is T,
  message: string
): StandardSchemaV1<unknown, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "pizzarush",
      validate: (value) => {
        return isValid(value) ? { value } : { issues: [{ message }] }
      },
    },
  }
}
