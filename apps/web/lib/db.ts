import { MongoClient, type Db } from "mongodb"

const uri = process.env.BETTER_AUTH_DB_URI

if (!uri) {
  throw new Error(
    "BETTER_AUTH_DB_URI is missing. Add it to apps/web/.env.local before starting the app."
  )
}

const globalForMongo = globalThis as typeof globalThis & {
  pizzarushMongoClient?: MongoClient
}

/** One client per process, reused across HMR reloads in development. */
export const mongoClient =
  globalForMongo.pizzarushMongoClient ?? new MongoClient(uri)

if (process.env.NODE_ENV !== "production") {
  globalForMongo.pizzarushMongoClient = mongoClient
}

export const db: Db = mongoClient.db("pizzahub")
