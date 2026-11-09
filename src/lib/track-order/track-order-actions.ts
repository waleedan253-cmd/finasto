"use server";

// Thin Server Action wrapper around track-order-queries.ts, so the
// client-side form can call it directly. Reads the caller's IP so the
// lookup can be rate-limited per IP as well as per email.

import { headers } from "next/headers";
import {
  lookupOrderStatus,
  type LookupResult,
} from "@/lib/track-order/track-order-queries";

export async function lookupOrderStatusAction(input: {
  email: string;
  trackingCode: string;
}): Promise<LookupResult> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return lookupOrderStatus(input, ip);
}