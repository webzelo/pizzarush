import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.BETTER_AUTH_DB_URI
const reset = process.argv.includes("--reset")

if (!uri) {
  console.error("BETTER_AUTH_DB_URI is missing. Add it to apps/web/.env.local.")
  process.exit(1)
}

const IMGBB_HOSTS = ["i.ibb.co", "ibb.co"]
const imgbbApiKey = process.env.IMGBB_API_KEY

// Source photos are Unsplash URLs, but menu items must end up on ImgBB.
const sourceImage = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`

function isImgbbUrl(value) {
  try {
    return IMGBB_HOSTS.includes(new URL(value).hostname)
  } catch {
    return false
  }
}

async function uploadToImgbb(sourceUrl, name) {
  if (!imgbbApiKey) {
    throw new Error(
      "IMGBB_API_KEY is required to seed menu images. Add it to apps/web/.env.local."
    )
  }

  const sourceResponse = await fetch(sourceUrl)
  if (!sourceResponse.ok) {
    throw new Error(`Could not download the sample image for ${name}.`)
  }

  const body = new FormData()
  body.append(
    "image",
    Buffer.from(await sourceResponse.arrayBuffer()).toString("base64")
  )
  body.append("name", `${name} sample menu`.slice(0, 80))

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
    { method: "POST", body }
  )
  const payload = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(`ImgBB rejected the upload for ${name}.`)
  }

  const url = payload.data?.display_url ?? payload.data?.url
  if (!url || !isImgbbUrl(url)) {
    throw new Error(`ImgBB returned an unexpected URL for ${name}.`)
  }

  return url
}

/**
 * Sample catalogue for the first vendor in the database. Every item is
 * approved and active, so it appears on the public /menu page immediately.
 * `area` varies within the vendor's city so the location filter is testable.
 */
const items = [
  {
    name: "Margherita",
    category: "Pizza",
    description:
      "Classic tomato sauce, fresh mozzarella and basil on a hand-stretched crust.",
    price: 8.99,
    area: "Panchlaish",
    imageUrl: sourceImage("photo-1574071318508-1cdbab80d002"),
  },
  {
    name: "Pepperoni",
    category: "Pizza",
    description:
      "Spicy pepperoni cups, mozzarella and oregano over our signature tomato base.",
    price: 10.99,
    area: "Khulshi",
    imageUrl: sourceImage("photo-1628840042765-356cda07504e"),
  },
  {
    name: "BBQ Chicken",
    category: "Pizza",
    description:
      "Smoky barbecue chicken, red onion and mozzarella with a tangy BBQ drizzle.",
    price: 12.49,
    area: "Agrabad",
    imageUrl: sourceImage("photo-1565299624946-b28f40a0ae38"),
  },
  {
    name: "Veggie Supreme",
    category: "Pizza",
    description:
      "Bell peppers, mushrooms, olives, red onion and sweetcorn on a tomato base.",
    price: 11.49,
    area: "Nasirabad",
    imageUrl: sourceImage("photo-1513104890138-7c749659a591"),
  },
  {
    name: "Four Cheese",
    category: "Pizza",
    description:
      "Mozzarella, cheddar, parmesan and blue cheese for a rich, stretchy slice.",
    price: 13.99,
    area: "GEC Circle",
    imageUrl: sourceImage("photo-1604382354936-07c5d9983bd3"),
  },
  {
    name: "Spicy Beef",
    category: "Pizza",
    description:
      "Seasoned beef, jalapeños, red onion and chilli flakes with mozzarella.",
    price: 14.99,
    area: "Chawkbazar",
    imageUrl: sourceImage("photo-1594007654729-407eedc4be65"),
  },
  {
    name: "Garlic Bread",
    category: "Sides",
    description:
      "Toasted baguette brushed with garlic butter and finished with parsley.",
    price: 4.49,
    area: "Halishahar",
    imageUrl: sourceImage("photo-1573140247632-f8fd74997d5c"),
  },
  {
    name: "Loaded Fries",
    category: "Sides",
    description:
      "Crispy fries topped with cheese sauce, spring onion and a smoky drizzle.",
    price: 5.99,
    area: "Pahartali",
    imageUrl: sourceImage("photo-1573080496219-bb080dd4f877"),
  },
  {
    name: "Chicken Wings",
    category: "Sides",
    description:
      "Six oven-baked wings tossed in your choice of buffalo or honey glaze.",
    price: 7.49,
    area: "Panchlaish",
    imageUrl: sourceImage("photo-1608039755401-742074f0548d"),
  },
  {
    name: "Cola",
    category: "Drinks",
    description: "Chilled 330 ml can of classic cola.",
    price: 2.49,
    area: "Khulshi",
    imageUrl: sourceImage("photo-1554866585-cd94860890b7"),
  },
  {
    name: "Lemonade",
    category: "Drinks",
    description: "Freshly squeezed lemonade served over ice with a mint leaf.",
    price: 2.99,
    area: "Agrabad",
    imageUrl: sourceImage("photo-1523677011781-c91d1bbe2f9e"),
  },
  {
    name: "Iced Coffee",
    category: "Drinks",
    description:
      "Cold-brewed coffee with milk and a touch of vanilla, served over ice.",
    price: 3.49,
    area: "Nasirabad",
    imageUrl: sourceImage("photo-1461023058943-07fcbe16d735"),
  },
  {
    name: "Cheesecake",
    category: "Desserts",
    description:
      "Creamy baked cheesecake on a buttery biscuit base with berry compote.",
    price: 5.49,
    area: "GEC Circle",
    imageUrl: sourceImage("photo-1533134242443-d4fd215305ad"),
  },
  {
    name: "Chocolate Brownie",
    category: "Desserts",
    description:
      "Warm fudge brownie with a crackly top and molten chocolate centre.",
    price: 4.99,
    area: "Chawkbazar",
    imageUrl: sourceImage("photo-1606313564200-e75d5e30476c"),
  },
]

const client = new MongoClient(uri)
const db = client.db("pizzahub")

try {
  const vendor = await db
    .collection("vendors")
    .findOne({}, { sort: { createdAt: 1 } })

  if (!vendor) {
    console.error(
      "No vendor found. Create a restaurant profile in the app first, then re-run."
    )
    process.exit(1)
  }

  const menuItems = db.collection("menuItems")
  const now = new Date()
  const city = vendor.city || "Chattogram"

  if (reset) {
    const { deletedCount } = await menuItems.deleteMany({
      vendorId: vendor.userId,
      seedSource: "sample-menu",
    })
    console.log(`Removed ${deletedCount} previously seeded item(s).`)
  }

  let inserted = 0
  let updated = 0

  for (const item of items) {
    const existing = await menuItems.findOne(
      { vendorId: vendor.userId, name: item.name },
      { projection: { imageUrl: 1 } }
    )

    // Reuse an ImgBB URL from a previous run; upload only when needed.
    const imageUrl = isImgbbUrl(existing?.imageUrl)
      ? existing.imageUrl
      : await uploadToImgbb(item.imageUrl, item.name)

    const result = await menuItems.updateOne(
      { vendorId: vendor.userId, name: item.name },
      {
        $set: {
          vendorId: vendor.userId,
          name: item.name,
          category: item.category,
          description: item.description,
          price: item.price,
          area: item.area,
          city,
          imageUrl,
          status: "approved",
          isActive: true,
          rejectionReason: null,
          seedSource: "sample-menu",
          updatedAt: now,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          createdAt: now,
        },
      },
      { upsert: true }
    )

    if (result.upsertedCount > 0) inserted += 1
    else updated += 1
  }

  console.log(
    `Seeded ${items.length} items for ${vendor.restaurantName}: ` +
      `${inserted} inserted, ${updated} updated. Menu images are hosted on ImgBB.`
  )
} finally {
  await client.close()
}
