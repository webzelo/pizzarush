import { redirect } from "next/navigation"

import { vendorsCollection, type VendorDoc } from "@/lib/collections"

export async function getVendorByUserId(userId: string) {
  return vendorsCollection.findOne({ userId })
}

/** Pages that need a completed restaurant profile use this. */
export async function requireVendorProfile(
  userId: string
): Promise<VendorDoc> {
  const vendor = await getVendorByUserId(userId)

  if (!vendor) {
    redirect("/vendor/profile?setup=1")
  }

  return vendor
}
