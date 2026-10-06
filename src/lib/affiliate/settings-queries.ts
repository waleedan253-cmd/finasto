// Server-side reads for the affiliate Settings page. Import only from
// server components and server actions, never from a "use client" file.
//
// "Own data only": the affiliate is always found by profile_id = the
// signed-in auth user. The client never sends an affiliate id, so one
// affiliate can never read another's settings. RLS enforces the same
// rule again at the database.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

// Bank details exactly as saved. The affiliate sees their own full
// account number and can edit it.
export type MyBankDetails = {
  accountHolderName: string;
  bankName: string;
  bankCountry: string;
  accountNumber: string;
  swiftBic: string | null;
  routingCode: string | null;
  payoutCurrency: string;
};

export type MySettings = {
  affiliateId: string;
  name: string;
  email: string; // login identity, shown read-only
  phone: string | null;
  country: string | null;
  region: string | null;
  commissionPercent: number; // set by the admin, read-only here
  bank: MyBankDetails | null; // null until the affiliate saves them
  countries: string[]; // suggestions for the Country field
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// An embedded relation can come back as an object or a one-element array.
function embeddedOne<T>(value: unknown): T | null {
  const first = Array.isArray(value) ? value[0] : value;
  return (first as T | null | undefined) ?? null;
}

type BankRow = {
  account_holder_name: string;
  bank_name: string;
  bank_country: string;
  account_number_or_iban: string;
  swift_bic: string | null;
  routing_code: string | null;
  payout_currency: string;
};

/* ------------------------------------------------------------------ */
/* Read                                                                 */
/* ------------------------------------------------------------------ */

export async function getMySettings(): Promise<MySettings | null> {
  const { user } = await requireRole("affiliate");
  const supabase = await createClient();

  const [affiliateResult, countriesResult] = await Promise.all([
    supabase
      .from("affiliates")
      .select(
        "id, name, email, phone, country, region, commission_percent, affiliate_bank_details ( account_holder_name, bank_name, bank_country, account_number_or_iban, swift_bic, routing_code, payout_currency )",
      )
      .eq("profile_id", user.id)
      .neq("status", "deleted")
      .maybeSingle(),
    supabase.from("countries").select("name").eq("active", true).order("name"),
  ]);

  const { data, error } = affiliateResult;
  if (error) throw new Error(`Failed to load settings: ${error.message}`);
  if (!data) return null;

  const bank = embeddedOne<BankRow>(data.affiliate_bank_details);

  // If the countries table can't be read, the form falls back to typing a
  // country by hand, so this never fails the page.
  const countries = (countriesResult.data ?? [])
    .map((c) => c.name as string)
    .filter(Boolean);

  return {
    affiliateId: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    country: data.country,
    region: data.region,
    commissionPercent: num(data.commission_percent),
    bank: bank
      ? {
          accountHolderName: bank.account_holder_name,
          bankName: bank.bank_name,
          bankCountry: bank.bank_country,
          accountNumber: bank.account_number_or_iban,
          swiftBic: bank.swift_bic,
          routingCode: bank.routing_code,
          payoutCurrency: bank.payout_currency,
        }
      : null,
    countries,
  };
}
