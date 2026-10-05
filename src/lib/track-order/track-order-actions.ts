"use server";

// Thin Server Action wrapper around track-order-queries.ts, so the
// client-side form can call it directly — same pattern as
// notification-actions.ts wrapping notifications.ts.

import {
  lookupOrderStatus,
  type LookupResult,
} from "@/lib/track-order/track-order-queries";

export async function lookupOrderStatusAction(input: {
  email: string;
  trackingCode: string;
}): Promise<LookupResult> {
  return lookupOrderStatus(input);
}
