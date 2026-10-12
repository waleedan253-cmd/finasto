// Server-side read for the affiliate Referral Link page. Import only from
// server components, never from a "use client" file (client files may
// import the TYPE below, which is erased at build).
//
// Each affiliate has ONE link, built from the referral_code the database
// created for them. Nothing is stored or generated here: the link is the
// site address plus that code.
//
// Own data only: the affiliate is found from the signed-in user, and the
// browser never sends an id. RLS on affiliates enforces the same rule.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export type MyReferralLink = {
  code: string; // e.g. "0F468661"
  url: string; // full shareable link, e.g. https://site.com/r/0F468661
  isActive: boolean; // only an active affiliate's link earns commission
};

// The public link is built here, once, so the browser never has to guess
// the site address.
export function buildReferralUrl(code: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return `${base}/r/${code}`;
}

// Returns null when the login has no affiliate row (the layout normally
// blocks that first, so this is only a safety net).
export async function getMyReferralLink(): Promise<MyReferralLink | null> {
  const { user } = await requireRole("affiliate");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliates")
    .select("referral_code, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load your referral link: ${error.message}`);
  }
  if (!data || !data.referral_code) return null;

  return {
    code: data.referral_code,
    url: buildReferralUrl(data.referral_code),
    isActive: data.status === "active",
  };
}
