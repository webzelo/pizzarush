import { MongoClient, type Db } from "mongodb"

const uri = "mongodb+srv://pizzahubAdmin:2KZQXbilh7QwfOE9@cluster0.8evmyeo.mongodb.net/"

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
