import {
  menuItemsCollection,
  ordersCollection,
  vendorsCollection,
  type VendorDoc,
} from "@/lib/collections"
import { effectivePlan, isPremiumActive } from "@/lib/plans"

export type VendorDashboard = {
  vendor: VendorDoc | null
  plan: "free" | "premium"
  premium: boolean
  totalItems: number
  activeItems: number
  pendingOrders: number
  acceptedOrders: number
}

export async function getVendorDashboard(
  userId: string
): Promise<VendorDashboard> {
  const [vendor, totalItems, activeItems, pendingOrders, acceptedOrders] =
    await Promise.all([
      vendorsCollection.findOne({ userId }),
      menuItemsCollection.countDocuments({ vendorId: userId }),
      menuItemsCollection.countDocuments({
        vendorId: userId,
        status: "approved",
        isActive: true,
      }),
      ordersCollection.countDocuments({ vendorId: userId, status: "pending" }),
      ordersCollection.countDocuments({
        vendorId: userId,
        status: "accepted",
      }),
    ])

  return {
    vendor,
    plan: effectivePlan(vendor),
    premium: isPremiumActive(vendor),
    totalItems,
    activeItems,
    pendingOrders,
    acceptedOrders,
  }
}
