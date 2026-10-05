import "server-only";
import { cookies } from "next/headers";

// Server-side read of the referral cookie middleware.ts sets. Kept in
// its own file (not inlined into checkout-actions.ts) since track-order
// and any future referral-aware page will need the same read.

export const REFERRAL_COOKIE = "finasto_ref";

export async function readReferralCode(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(REFERRAL_COOKIE)?.value;
  return value && value.trim() !== "" ? value.trim() : null;
}
