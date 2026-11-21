import type { DBFieldAttribute } from "better-auth/db"

import { isPublicRole, publicRoles } from "@/lib/auth/roles"
import { createValidator } from "@/lib/auth/standard-schema"

/**
 * Custom Better Auth user fields. Imported by both the server config and the
 * client plugin, so the field definition can never drift between them.
 */
export const userAdditionalFields = {
  banned: {
    type: "boolean",
    required: false,
    defaultValue: false,
    input: false,
  },
  banReason: {
    type: "string",
    required: false,
    input: false,
  },
  role: {
    type: "string",
    required: false,
    defaultValue: "customer",
    input: true,
    validator: {
      input: createValidator(
        isPublicRole,
        `Account role must be one of: ${publicRoles.join(", ")}`
      ),
    },
  },
} satisfies Record<string, DBFieldAttribute>
