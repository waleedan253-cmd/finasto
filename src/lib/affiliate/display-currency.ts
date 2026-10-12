// The signed-in affiliate's display currency and the exchange rates, in
// one call. Import only from server components and server actions.
//
// The currency is the one saved on the affiliate row when the profile was
// completed and locked (set by complete_affiliate_profile() in
// affiliate-profile-lock.sql). It is never read from a cookie or the URL,
// so it cannot be switched from the browser.
//
// Display only: payouts, commissions and the database stay in USD.

import { cache } from "react";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { BASE_CURRENCY, resolveCurrency, type RateMap } from "@/lib/currency";

export type AffiliateDisplay = {
  currency: string; // currency code the pages convert to
  rates: RateMap;
  profileLocked: boolean; // false = the profile still needs completing
};

// cache(): the layout and the page can both call this in one request and
// the database is only asked once.
export const getAffiliateDisplay = cache(
  async (): Promise<AffiliateDisplay> => {
    const { user } = await requireRole("affiliate");
    const supabase = await createClient();

    const [affiliateResult, ratesResult] = await Promise.all([
      supabase
        .from("affiliates")
        .select("display_currency, profile_locked_at")
        .eq("profile_id", user.id)
        .maybeSingle(),
      supabase
        .from("currency_rates")
        .select("currency_code, rate_to_base, updated_at"),
    ]);

    // If the rates can't be read, every amount simply stays in USD.
    const rates: RateMap = {};
    for (const r of ratesResult.data ?? []) {
      rates[String(r.currency_code).toUpperCase()] = {
        rateToBase: Number(r.rate_to_base),
        updatedAt: r.updated_at as string,
      };
    }

    const row = affiliateResult.data;
    const profileLocked = !!row?.profile_locked_at;

    // Not locked yet, or no saved currency: USD until the profile is done.
    // resolveCurrency() also falls back to USD for a code with no rate row.
    const currency = profileLocked
      ? resolveCurrency(row?.display_currency, rates)
      : BASE_CURRENCY;

    return { currency, rates, profileLocked };
  },
);
