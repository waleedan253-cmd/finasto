import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { BASE_CURRENCY, currencyCodeSchema } from "@/lib/currency";

// Daily exchange-rate refresh, triggered by Vercel Cron (see vercel.json).
//
// - Only Vercel (or someone holding CRON_SECRET) can call it.
// - Writes with the service-role key, so the public can never change rates.
// - Updates only the currencies that already have a row in currency_rates,
//   so the admin decides which currencies the store supports.
// - Rejects a rate that is missing, not positive, or moved more than 10%
//   from the last good value, so one bad API response never reaches prices.
// - Every accepted rate is also saved to currency_rates_history.
// - Safe to run twice: Vercel can occasionally fire the same cron more than
//   once, and the upsert simply writes the same values again.

export const dynamic = "force-dynamic";

// Free provider, no API key. Swap this URL and the parsing below to change it.
const RATES_URL = "https://open.er-api.com/v6/latest/USD";
const MAX_MOVE = 0.1; // 10%
const STALE_MS = 7 * 24 * 60 * 60 * 1000; // old rows are not trusted as a baseline

function fail(message: string, extra?: Record<string, unknown>) {
  console.error("[cron/rates]", message, extra ?? "");
  return NextResponse.json(
    { ok: false, error: message, ...extra },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey)
    return fail("Missing Supabase environment variables");

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Which currencies does the store support?
  const { data: existing, error: readError } = await supabase
    .from("currency_rates")
    .select("currency_code, rate_to_base, updated_at");
  if (readError)
    return fail(`Could not read currency_rates: ${readError.message}`);

  // 2. Fetch today's rates (USD -> 1 USD in each currency).
  let payload: any;
  try {
    const res = await fetch(RATES_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    payload = await res.json();
  } catch (e) {
    return fail(`Rate provider request failed: ${(e as Error).message}`);
  }
  if (payload?.result !== "success" || typeof payload.rates !== "object") {
    return fail("Rate provider returned an unexpected response");
  }

  // Use the provider's own timestamp, so a provider that stops updating
  // shows up as an old rate instead of looking fresh.
  const providerUnix = Number(payload.time_last_update_unix);
  const updatedAt =
    Number.isFinite(providerUnix) && providerUnix > 0
      ? new Date(providerUnix * 1000).toISOString()
      : new Date().toISOString();

  // 3. Validate each rate.
  const rows: {
    currency_code: string;
    rate_to_base: number;
    updated_at: string;
  }[] = [];
  const skipped: Record<string, string> = {};

  for (const row of existing ?? []) {
    const parsed = currencyCodeSchema.safeParse(row.currency_code);
    if (!parsed.success || parsed.data === BASE_CURRENCY) continue;
    const code = parsed.data;

    const perUsd = Number(payload.rates[code]);
    if (!Number.isFinite(perUsd) || perUsd <= 0) {
      skipped[code] = "provider has no valid rate";
      continue;
    }

    // Our table stores USD per 1 unit of the currency.
    const rateToBase = Number((1 / perUsd).toPrecision(8));

    const prev = Number(row.rate_to_base);
    const prevAge = Date.now() - Date.parse(row.updated_at);
    const prevUsable = Number.isFinite(prev) && prev > 0 && prevAge <= STALE_MS;
    if (prevUsable && Math.abs(rateToBase / prev - 1) > MAX_MOVE) {
      skipped[code] =
        `moved more than ${MAX_MOVE * 100}% (was ${prev}, got ${rateToBase})`;
      continue;
    }

    rows.push({
      currency_code: code,
      rate_to_base: rateToBase,
      updated_at: updatedAt,
    });
  }

  if (rows.length === 0) {
    return fail("No rates were updated", { skipped });
  }

  // 4. Save.
  const { error: upsertError } = await supabase
    .from("currency_rates")
    .upsert(rows, { onConflict: "currency_code" });
  if (upsertError) return fail(`Could not save rates: ${upsertError.message}`);

  const { error: historyError } = await supabase
    .from("currency_rates_history")
    .insert(
      rows.map((r) => ({
        currency_code: r.currency_code,
        rate_to_base: r.rate_to_base,
        provider_updated_at: r.updated_at,
      })),
    );
  if (historyError)
    console.error("[cron/rates] history insert failed:", historyError.message);

  if (Object.keys(skipped).length > 0) {
    console.error("[cron/rates] some currencies were skipped:", skipped);
  }

  revalidatePath("/shop");
  revalidatePath("/");

  return NextResponse.json({
    ok: true,
    updated: rows.map((r) => r.currency_code),
    skipped,
  });
}
