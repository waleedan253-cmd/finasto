// Resolves a referral code (from the finasto_ref cookie) into the real
// affiliate + their CURRENT stockist. This is deliberately the only
// place that lookup happens: checkout-actions.ts calls this once and
// snapshots the result onto the order; it never re-derives attribution
// from the affiliate/stockist tables later.
//
// Checkout runs as an anonymous visitor, and RLS (correctly) hides the
// affiliates and stockists tables from them. So the lookup goes through
// the resolve_referral_attribution() database function, which returns a
// row only for an ACTIVE affiliate that has a login, and exposes ids and
// rates only (never email, phone or bank details).
//
// Import only from server code (server actions, server components).

import { createClient } from "@/lib/supabase/server";

export type ReferralAttribution = {
  affiliateId: string; // affiliates.id
  affiliateName: string;
  affiliateProfileId: string; // profiles.id, what orders.affiliate_id stores
  commissionPercent: number;
  stockistId: string | null; // null if this affiliate has no active stockist
  stockistProfileId: string | null; // profiles.id, what orders.stockist_id stores
  stockistProfitPercent: number | null;
};

type AttributionRow = {
  affiliate_id: string;
  affiliate_profile_id: string;
  affiliate_name: string | null;
  commission_percent: number | string | null;
  stockist_id: string | null;
  stockist_profile_id: string | null;
  stockist_profit_percent: number | string | null;
};

// Returns null for: no code, code doesn't match any affiliate, or that
// affiliate is paused/deleted. In every case the order is simply created
// with no referral attribution rather than blocking checkout.
export async function resolveReferral(
  code: string,
): Promise<ReferralAttribution | null> {
  const trimmed = code.trim();
  if (!trimmed || trimmed.length > 64) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_referral_attribution", {
    p_code: trimmed,
  });

  if (error) {
    // A lookup failure must never block checkout: the order just
    // proceeds with no attribution, same as "no code at all".
    console.error("[referral] lookup failed:", error.message);
    return null;
  }

  const rows = (data ?? []) as AttributionRow[];
  const row = rows[0];
  if (!row) return null;

  return {
    affiliateId: row.affiliate_id,
    affiliateName: row.affiliate_name ?? "Affiliate",
    affiliateProfileId: row.affiliate_profile_id,
    commissionPercent: Number(row.commission_percent) || 0,
    stockistId: row.stockist_id,
    stockistProfileId: row.stockist_profile_id,
    stockistProfitPercent:
      row.stockist_id != null ? Number(row.stockist_profit_percent) || 0 : null,
  };
}
