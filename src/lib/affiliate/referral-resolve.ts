// Resolves the code in a /r/<code> link into the affiliate's referral
// code (the value the finasto_ref cookie stores and checkout reads).
//
// Visitors are anonymous and RLS hides the affiliates table from them, so
// the lookup goes through the resolve_affiliate_referral() database
// function. It returns a code only for an active affiliate that has a
// login, and never exposes name, email, phone or bank data.
//
// Import only from server code (route handlers, server actions).

import { createClient } from "@/lib/supabase/server";

export type ResolvedReferral = {
  referralCode: string; // the affiliate's code, saved in the cookie
};

type AffiliateRow = { referral_code: string };

// Returns null for: empty or oversized code, unknown code, or an
// affiliate that is no longer active. The route then sends the visitor
// to the normal shop with no cookie and no error.
export async function resolveReferralCode(
  code: string,
): Promise<ResolvedReferral | null> {
  const trimmed = code.trim();
  if (!trimmed || trimmed.length > 64) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_affiliate_referral", {
    p_code: trimmed,
  });

  if (error) {
    // A lookup failure must never break the visit: no cookie, normal shop.
    console.error("[referral] lookup failed:", error.message);
    return null;
  }

  const row = ((data ?? []) as AffiliateRow[])[0];
  if (!row) return null;

  return { referralCode: row.referral_code };
}
