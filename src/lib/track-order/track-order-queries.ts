// Public order lookup — no authentication, just email + tracking code
// together (never tracking code alone, since that would let anyone
// enumerate codes and see a stranger's order). Rate-limited per email
// and per IP to slow down brute-force guessing.
//
// Data is read ONLY through the track_order() database function
// (security definer). Guests have no direct access to the orders table.

import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";

const lookupInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  trackingCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^FIN-\d{8}-[A-Z0-9]{4,8}$/,
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
/* Rate limit (Upstash — shared across all serverless instances)        */
/* ------------------------------------------------------------------ */
// Two limits: per email (stops guessing one person's order) and per IP
// (stops one attacker trying many emails). Skipped when the env vars
// are missing, so local development still works.

const redisReady =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisReady ? Redis.fromEnv() : null;

const emailLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "track:email",
    })
  : null;

const ipLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 m"),
      prefix: "track:ip",
    })
  : null;

async function isRateLimited(email: string, ip: string): Promise<boolean> {
  if (!emailLimiter || !ipLimiter) return false;
  try {
    const [byEmail, byIp] = await Promise.all([
      emailLimiter.limit(email),
      ipLimiter.limit(ip),
    ]);
    return !byEmail.success || !byIp.success;
  } catch {
    // Redis down: don't block real customers. The DB still requires
    // email + code to match, so this is not the only protection.
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Lookup                                                               */
/* ------------------------------------------------------------------ */

export type LookupResult =
  | { success: true; order: OrderStatusResult }
  | { success: false; error: string };

export async function lookupOrderStatus(
  input: { email: string; trackingCode: string },
  ip = "unknown",
): Promise<LookupResult> {
  const parsed = lookupInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check your email and tracking code.",
    };
  }
  const { email, trackingCode } = parsed.data;

  if (await isRateLimited(email, ip)) {
    return {
      success: false,
      error: "Too many attempts. Please try again in a few minutes.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("track_order", {
    p_order_number: trackingCode,
    p_email: email,
  });

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }
  if (!data) {
    // Same message for wrong code or wrong email: never reveal which failed.
    return { success: false, error: "No order found with those details." };
  }

  const order = data as OrderStatusResult;
  return {
    success: true,
    order: { ...order, totalOriginal: Number(order.totalOriginal) || 0 },
  };
}