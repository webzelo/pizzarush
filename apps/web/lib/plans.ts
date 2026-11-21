import type { Plan, VendorDoc } from "@/lib/collections"

type PlanVendor = Pick<VendorDoc, "plan" | "planExpiresAt">

/** Premium only counts while it has not expired. */
export function isPremiumActive(vendor: PlanVendor | null | undefined) {
  if (!vendor || vendor.plan !== "premium" || !vendor.planExpiresAt) {
    return false
  }

  return vendor.planExpiresAt.getTime() > Date.now()
}

export function effectivePlan(
  vendor: PlanVendor | null | undefined
): Plan {
  return isPremiumActive(vendor) ? "premium" : "free"
}

export const planFeatures: Record<Plan, string[]> = {
  free: [
    "Up to 3 active menu items",
    "Basic vendor dashboard",
    "Order management",
  ],
  premium: [
    "Unlimited active menu items",
    "Premium vendor badge",
    "Featured placement on the homepage",
    "Everything included in Free",
  ],
}
