import { apiClient, type ApiResult } from "@/lib/api-client"
import type { OrderStatus, PaymentStatus } from "@/lib/collections"

/**
 * Browser-side helpers for updating an order through the Express API.
 *
 * `UpdateOrderPayload` is the contract the backend accepts (PATCH
 * `/api/orders/:id`); keep them in sync. Only the fields an updatable order
 * should expose are listed here — the backend rejects everything else.
 */
export type UpdateOrderPayload = {
  status?: OrderStatus
  deliveryDate?: string
  deliveryAddress?: string
  customerMessage?: string
  paymentStatus?: PaymentStatus
  paymentReference?: string | null
}

/**
 * Save/update updatable order info.
 * - Customer: their own order while still pending (delivery details).
 * - Vendor: their own orders (payment info).
 * - Admin: any order.
 */
export async function updateOrder(
  orderId: string,
  fields: UpdateOrderPayload
): Promise<ApiResult<UpdateOrderPayload>> {
  return apiClient<UpdateOrderPayload>(
    `/api/orders/${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(fields),
    }
  )
}
