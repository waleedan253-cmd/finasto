"use server";

// The ONE action this section performs: updating order_status
// (processing/shipped/delivered/cancelled). This file never touches
// payment_status, totals, or the affiliate/stockist snapshot — those
// are locked at checkout (or later, at the payment webhook) and this
// is purely a fulfillment status layer on top, exactly as we agreed.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// A forward-only progression, plus cancellation from any non-final
// state. Prevents nonsensical transitions like "delivered" back to
// "pending" from a stray click.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [], // final
  cancelled: [], // final
};

export type ActionResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export async function updateOrderStatus(
  orderId: string,
  nextStatus: z.infer<typeof orderStatusSchema>,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = orderStatusSchema.safeParse(nextStatus);
  if (!parsed.success) {
    return { success: false, error: "Invalid status." };
  }

  const supabase = await createClient();

  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, order_status")
    .eq("id", orderId)
    .maybeSingle();

  if (readError || !order) {
    return { success: false, error: "Order not found." };
  }

  const allowed = ALLOWED_TRANSITIONS[order.order_status] ?? [];
  if (!allowed.includes(parsed.data)) {
    return {
      success: false,
      error: `Can't move an order from "${order.order_status}" to "${parsed.data}".`,
    };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ order_status: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    return {
      success: false,
      error: `Could not update status: ${updateError.message}`,
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true, orderId };
}
