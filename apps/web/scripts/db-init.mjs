import { MongoClient } from "mongodb"

const uri = process.env.BETTER_AUTH_DB_URI

if (!uri) {
  console.error("BETTER_AUTH_DB_URI is missing. Add it to apps/web/.env.local.")
  process.exit(1)
}

const client = new MongoClient(uri)
const db = client.db("pizzahub")

try {
  await Promise.all([
    db.collection("vendors").createIndex({ userId: 1 }, { unique: true }),
    db
      .collection("menuItems")
      .createIndex({ vendorId: 1, status: 1, isActive: 1 }),
    db
      .collection("menuItems")
      .createIndex({ status: 1, isActive: 1, createdAt: -1 }),
    db.collection("orders").createIndex({ customerId: 1, createdAt: -1 }),
    db
      .collection("orders")
      .createIndex({ vendorId: 1, status: 1, createdAt: -1 }),
    db.collection("transactions").createIndex({ vendorId: 1, createdAt: -1 }),
    db
      .collection("transactions")
      .createIndex({ paymentStatus: 1, createdAt: -1 }),
  ])

  console.log("Database indexes are ready.")
} finally {
  await client.close()
}
