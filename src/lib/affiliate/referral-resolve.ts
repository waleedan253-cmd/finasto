// Server-only lookup used by the public /r/<code> route.
//
// Visitors are anonymous and RLS hides referral_links from them, so this
// calls the resolve_referral_link() database function. It returns a row
// only when the link, the affiliate and the product are all active, and it
// exposes ids only.

import { createClient } from "@/lib/supabase/server";

export type ResolvedLink = {
  linkId: string;
  productId: string;
  affiliateId: string;
  // The affiliate's own referral code: the value checkout's
  // resolveReferral() looks up in the finasto_ref cookie.
  referralCode: string;
};

// Codes are exactly 8 letters/digits (see the table's check constraint).
// Reject anything else before touching the database.
const CODE_PATTERN = /^[A-Za-z0-9]{8}$/;

export function isValidCodeFormat(code: string): boolean {
  return CODE_PATTERN.test(code);
}

export async function resolveReferralCode(
  code: string,
): Promise<ResolvedLink | null> {
  if (!isValidCodeFormat(code)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_referral_link", {
    p_code: code,
  });

  // A failed lookup must never break the visitor's trip: treat it as
  // "no valid link" and let the route send them to the normal shop.
  if (error || !data || data.length === 0) return null;

  const row = data[0] as {
    link_id: string;
    product_id: string;
    affiliate_id: string;
    referral_code: string;
  };

  return {
    linkId: row.link_id,
    productId: row.product_id,
    affiliateId: row.affiliate_id,
    referralCode: row.referral_code,
  };
}
