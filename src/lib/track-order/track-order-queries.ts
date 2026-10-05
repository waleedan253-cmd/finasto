// Public order lookup — no authentication, just email + tracking code
// together (never tracking code alone, since that would let anyone
// enumerate codes and see a stranger's order). Rate-limited per caller
// to slow down brute-force guessing of the 4-character code.
//
// This is the ONLY place a non-admin, non-owner can read order data.

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

const lookupInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  trackingCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^FIN-\d{8}-[A-Z0-9]{4}$/,
      "That doesn't look like a valid tracking code",
    ),
});

export type OrderStatusResult = {
  trackingCode: string;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  currency: string;
  totalOriginal: number;
  createdAt: string;
  items: { productName: string; variantName: string; quantity: number }[];
};

/* ------------------------------------------------------------------ */
/* In-memory rate limit                                                 */
/* ------------------------------------------------------------------ */
// Simple per-process limiter: 5 attempts per email per 10 minutes.
// Good enough for a single Node instance; if this app ever runs on
// multiple serverless instances concurrently, this should move to a
// shared store (Redis/Upstash) instead — flagged here rather than
// silently assumed to scale.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > MAX_ATTEMPTS;
}

/* ------------------------------------------------------------------ */
/* Lookup                                                               */
/* ------------------------------------------------------------------ */

export type LookupResult =
  | { success: true; order: OrderStatusResult }
  | { success: false; error: string };

export async function lookupOrderStatus(input: {
  email: string;
  trackingCode: string;
}): Promise<LookupResult> {
  const parsed = lookupInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check your email and tracking code.",
    };
  }
  const { email, trackingCode } = parsed.data;

  if (isRateLimited(email)) {
    return {
      success: false,
      error: "Too many attempts. Please try again in a few minutes.",
    };
  }

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "tracking_code, order_status, payment_status, customer_name, currency, total_original, created_at, order_items ( product_name, variant_name, quantity )",
    )
    .eq("tracking_code", trackingCode)
    .eq("customer_email", email) // both must match — this is the access control
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) {
      return { success: false, error: "No order found with those details." };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
  if (!order) {
    // Deliberately the same generic message as "table missing" and as
    // any other non-match — never reveal whether the email exists, the
    // code exists, or which one was wrong.
    return { success: false, error: "No order found with those details." };
  }

  return {
    success: true,
    order: {
      trackingCode: order.tracking_code,
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      customerName: order.customer_name,
      currency: order.currency,
      totalOriginal: Number(order.total_original) || 0,
      createdAt: order.created_at,
      items: (order.order_items ?? []).map((i) => ({
        productName: i.product_name,
        variantName: i.variant_name,
        quantity: i.quantity,
      })),
    },
  };
}
