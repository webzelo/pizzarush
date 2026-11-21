import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { APIError, betterAuth } from "better-auth"
import { createAuthMiddleware } from "better-auth/api"

import { userAdditionalFields } from "@/lib/auth/fields"
import { usersCollection } from "@/lib/collections"
import { db, mongoClient } from "@/lib/db"
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  isPasswordValid,
  passwordRequirementsMessage,
} from "@/lib/auth/password"
import { isPublicRole } from "@/lib/auth/roles"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: MAX_PASSWORD_LENGTH,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: userAdditionalFields,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return
      }

      // Better Auth only enforces length; enforce the full policy here so a
      // direct API call cannot skip the client-side checks.
      const password = ctx.body?.password
      if (typeof password !== "string" || !isPasswordValid(password)) {
        throw APIError.from("BAD_REQUEST", {
          code: "INVALID_PASSWORD",
          message: passwordRequirementsMessage(),
        })
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            // Covers every creation path, including OAuth providers that never
            // send a role, and blocks privileged roles in a single place.
            role: isPublicRole(user.role) ? user.role : "customer",
          },
        }),
      },
    },
    session: {
      create: {
        // Blocked accounts cannot start a new session, on any auth method.
        before: async (session) => {
          const user = await usersCollection.findOne({ _id: session.userId })

          if (user?.banned) {
            throw APIError.from("FORBIDDEN", {
              code: "USER_BLOCKED",
              message:
                user.banReason ||
                "Your account has been blocked. Please contact support.",
            })
          }

          return { data: session }
        },
      },
    },
  },
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),
})
