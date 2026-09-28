// Server-side loader for the exchange-rate table. Import it only from
// server components, route handlers and server actions.
//
// Table it reads (created in the backend step):
//   currency_rates(currency_code text primary key,
//                  rate_to_base   numeric not null,   -- USD per 1 unit
//                  updated_at     timestamptz not null)
//
// Direction matters: rate_to_base is how many USD equal ONE unit of the
// currency (IDR is roughly 0.00006, GBP is roughly 1.3). It is the same
// direction lib/currency.ts expects. USD needs no row.

import { cache } from "react";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper
import {
  BASE_CURRENCY,
  currencyCodeSchema,
  resolveCurrency,
  type RateMap,
} from "@/lib/currency";
import { readCurrencyCookie } from "@/lib/currency-server";

// "Table does not exist yet" is not an error while the backend step is
// still pending.
const MISSING_CODES = new Set(["PGRST205", "42P01"]);

/**
 * All known rates. cache() means several components in one request share
 * a single database call.
 *
 * It never throws. If rates cannot be loaded it returns an empty map, and
 * convert() then falls back to USD with fallback = true, so the UI shows
 * "rate unavailable" instead of a wrong number.
 */
export const getRates = cache(async (): Promise<RateMap> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("currency_rates")
    .select("currency_code, rate_to_base, updated_at");

  if (error) {
    if (!(error.code && MISSING_CODES.has(error.code))) {
      console.error("[rates] failed to load currency_rates:", error.message);
    }
    return {};
  }

  const rates: RateMap = {};
  for (const row of data ?? []) {
    const code = currencyCodeSchema.safeParse(row.currency_code);
    const rate = Number(row.rate_to_base);
    const updatedAt = typeof row.updated_at === "string" ? row.updated_at : "";

    if (!code.success || code.data === BASE_CURRENCY) continue;
    if (!Number.isFinite(rate) || rate <= 0) continue;
    if (Number.isNaN(Date.parse(updatedAt))) continue;

    rates[code.data] = { rateToBase: rate, updatedAt };
  }
  return rates;
});

/**
 * Rates plus the admin's chosen display currency, validated against those
 * rates (an unknown or unsupported currency falls back to USD). This is
 * the one call the dashboard components need.
 */
export async function getCurrencyContext(): Promise<{
  rates: RateMap;
  currency: string;
}> {
  const rates = await getRates();
  const currency = resolveCurrency(await readCurrencyCookie(), rates);
  return { rates, currency };
}
