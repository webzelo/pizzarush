import { MongoClient } from "mongodb"

const uri = process.env.BETTER_AUTH_DB_URI
const email = process.argv[2]?.trim().toLowerCase()

if (!uri) {
  console.error("BETTER_AUTH_DB_URI is missing. Add it to apps/web/.env.local.")
  process.exit(1)
}

if (!email) {
  console.error(
    "Usage: npm run seed:admin -w web -- you@example.com\n" +
      "The account must already exist (sign up first, then promote it)."
  )
  process.exit(1)
}

const client = new MongoClient(uri)
const db = client.db("pizzahub")

try {
  const result = await db.collection("user").updateOne(
    { email },
    {
      $set: {
        role: "admin",
        banned: false,
        updatedAt: new Date(),
      },
    }
  )

  if (result.matchedCount === 0) {
    console.error(`No user found with email ${email}. Sign up first.`)
    process.exit(1)
  }

  console.log(`${email} is now an admin. Sign out and back in to refresh.`)
} finally {
  await client.close()
}
