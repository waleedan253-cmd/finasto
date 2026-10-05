// Resolves a referral code (from the finasto_ref cookie) into the real
// affiliate + their CURRENT stockist. This is deliberately the only
// place that lookup happens — checkout-actions.ts calls this once and
// snapshots the result onto the order; it never re-derives attribution
// from the affiliate/stockist tables later.
//
// Import only from server code (server actions, server components).

import { createClient } from "@/lib/supabase/server";

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

export type ReferralAttribution = {
  affiliateId: string;
  affiliateName: string;
  affiliateProfileId: string;
  commissionPercent: number;
  stockistId: string | null; // null if this affiliate has no stockist
  stockistProfileId: string | null;
  stockistProfitPercent: number | null;
};

// Returns null for: no code, code doesn't match any affiliate, or that
// affiliate is suspended — in every case, the order is simply created
// with no referral attribution rather than blocking checkout.
export async function resolveReferral(
  code: string,
): Promise<ReferralAttribution | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliates")
    .select(
      `
      id,profile_id, status, commission_percent, referral_code,
      profiles ( name ),
      stockists ( id, profile_id,default_profit_percent )
    `,
    )
    .eq("referral_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return null;
    // A lookup failure must never block checkout — the order just
    // proceeds with no attribution, same as "no code at all".
    console.error("[referral] lookup failed:", error.message);
    return null;
  }
  if (!data) return null;

  const stockistsRaw = data.stockists as
    | {
        id: string;
        profile_id: string | null;
        default_profit_percent: number;
      }[]
    | null;
  const stockist = stockistsRaw?.[0] ?? null;
  return {
    affiliateId: data.id,
    affiliateProfileId: data.profile_id,
    affiliateName:
      (data.profiles as { name?: string } | null)?.name ?? "Affiliate",
    commissionPercent: Number(data.commission_percent) || 0,
    stockistId: stockist?.id ?? null,
    stockistProfileId: stockist?.profile_id ?? null,
    stockistProfitPercent: stockist
      ? Number(stockist.default_profit_percent) || 0
      : null,
  };
}
