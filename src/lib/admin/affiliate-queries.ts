// Server-side reads for the admin Affiliates section. Import only from
// server components, route handlers and server actions, never from a
// "use client" file.
//
// Defense in depth: every exported function re-checks requireRole("admin"),
// same pattern as stockist-queries.ts.
//
// The admin only enters name, email and an optional stockist. Phone,
// country and region are filled in later by the affiliate from their own
// dashboard settings, so they are nullable here and a computed
// `profileComplete` flag tells the admin UI who still has to finish.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const MISSING_CODES = new Set(["PGRST205", "PGRST204", "42P01", "42703"]);

function isMissingTableOrColumn(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

// "deleted" exists in the database (soft delete) but is never shown in
// admin lists, so UI-facing types only carry the two visible states.
export type AffiliateStatus = "active" | "inactive";

// "all" = every non-deleted affiliate, "unassigned" = no stockist,
// otherwise a stockist id.
export type AffiliateStockistFilter = "all" | "unassigned" | (string & {});
// Bank details as the admin sees them. The full account number is
// included because the admin pays out manually.
export type AffiliateBankDetails = {
  accountHolderName: string;
  bankName: string;
  bankCountry: string;
  accountNumber: string;
  swiftBic: string | null;
  routingCode: string | null;
  payoutCurrency: string;
};

export type AffiliateListItem = {
  id: string;
  name: string;
  email: string;
  status: AffiliateStatus;
  stockistId: string | null;
  stockistName: string | null; // null = Unassigned
  hasAccount: boolean; // true once profile_id is set (invite succeeded)
  profileComplete: boolean; // phone + country filled in by the affiliate
  commissionPercent: number;
  bankComplete: boolean; // affiliate has saved bank details
  updatedAt: string;
};

export type AffiliateListResult = {
  items: AffiliateListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type AffiliateDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null; // affiliate-filled, read-only for admin
  country: string | null; // affiliate-filled, read-only for admin
  region: string | null; // affiliate-filled, read-only for admin
  status: AffiliateStatus;
  stockistId: string | null;
  stockistName: string | null;
  notes: string | null;
  hasAccount: boolean;
  profileComplete: boolean;
  commissionPercent: number;
  bankDetails: AffiliateBankDetails | null;
  bankComplete: boolean;
  // Safe zeros until the Orders section exists.
  totalSales: number; // USD
  totalCommission: number; // USD
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const isProfileComplete = (row: {
  phone: string | null;
  country: string | null;
}) => Boolean(row.phone?.trim() && row.country?.trim());

// Supabase types an embedded one-to-one relation as an object or a
// one-element array depending on generated types; accept both.
function embeddedStockistName(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  const name = (first as { name?: string } | null | undefined)?.name;
  return name ?? null;
}

// Commas, parentheses and wildcards would break PostgREST's .or() syntax.
const cleanSearch = (s: string) => s.replace(/[,()%*\\]/g, " ").trim();
// An embedded relation can come back as an object or a one-element array.
function embeddedOne<T>(value: unknown): T | null {
  const first = Array.isArray(value) ? value[0] : value;
  return (first as T | null | undefined) ?? null;
}

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_PAGE_SIZE = 20;

export async function listAffiliates(params: {
  search?: string;
  status?: AffiliateStatus | "all";
  stockist?: AffiliateStockistFilter;
  page?: number;
  pageSize?: number;
}): Promise<AffiliateListResult> {
  await requireRole("admin");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("affiliates")
    .select(
      "id, name, email, phone, country, status, stockist_id, profile_id, commission_percent, updated_at, stockists ( name ), affiliate_bank_details ( affiliate_id )",
      { count: "exact" },
    )
    .neq("status", "deleted") // soft-deleted rows never appear in the list
    .order("updated_at", { ascending: false })
    .range(from, to);

  const search = params.search ? cleanSearch(params.search) : "";
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.stockist === "unassigned") {
    query = query.is("stockist_id", null);
  } else if (params.stockist && params.stockist !== "all") {
    query = query.eq("stockist_id", params.stockist);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isMissingTableOrColumn(error)) {
      return { items: [], total: 0, page, pageSize };
    }
    throw new Error(`Failed to load affiliates: ${error.message}`);
  }

  const items: AffiliateListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    stockistId: row.stockist_id,
    stockistName: embeddedStockistName(row.stockists),
    hasAccount: row.profile_id != null,
    profileComplete: isProfileComplete(row),
    commissionPercent: num(row.commission_percent),
    bankComplete: embeddedOne(row.affiliate_bank_details) !== null,
    updatedAt: row.updated_at,
  }));

  return { items, total: count ?? 0, page, pageSize };
}

/* ------------------------------------------------------------------ */
/* Single affiliate (edit form + detail view)                          */
/* ------------------------------------------------------------------ */

export async function getAffiliateById(
  id: string,
): Promise<AffiliateDetail | null> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliates")
    .select(
      "id, name, email, phone, country, region, status, stockist_id, profile_id, commission_percent, notes, created_at, updated_at, stockists ( name ), affiliate_bank_details ( account_holder_name, bank_name, bank_country, account_number_or_iban, swift_bic, routing_code, payout_currency )",
    )
    .eq("id", id)
    .neq("status", "deleted")
    .maybeSingle();

  if (error) {
    if (isMissingTableOrColumn(error)) return null;
    throw new Error(`Failed to load affiliate: ${error.message}`);
  }
  if (!data) return null;
  const bank = embeddedOne<{
    account_holder_name: string;
    bank_name: string;
    bank_country: string;
    account_number_or_iban: string;
    swift_bic: string | null;
    routing_code: string | null;
    payout_currency: string;
  }>(data.affiliate_bank_details);

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    country: data.country,
    region: data.region,
    status: data.status,
    stockistId: data.stockist_id,
    stockistName: embeddedStockistName(data.stockists),
    notes: data.notes,
    hasAccount: data.profile_id != null,
    profileComplete: isProfileComplete(data),
    commissionPercent: num(data.commission_percent),
    bankDetails: bank
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
    bankComplete: bank !== null,
    totalSales: num(0), // populated once Orders exists
    totalCommission: num(0), // populated once Orders exists
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/* ------------------------------------------------------------------ */
/* Lookups used by the create/edit form                                 */
/* ------------------------------------------------------------------ */

// Duplicate-email check before submit, and a defensive re-check inside
// the server action. Counts soft-deleted rows too, because the unique
// constraint on affiliates.email still applies to them.
export async function isAffiliateEmailTaken(
  email: string,
  excludeId?: string,
): Promise<boolean> {
  await requireRole("admin");
  const supabase = await createClient();

  let query = supabase
    .from("affiliates")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) {
    if (isMissingTableOrColumn(error)) return false;
    throw new Error(`Failed to check email: ${error.message}`);
  }
  return (data?.length ?? 0) > 0;
}

// Options for the list's stockist filter: every stockist that currently
// has (or could have) affiliates. Reuses listActiveStockistOptions() from
// stockist-queries.ts for the form's Select, so no second copy is needed.
export type AffiliateOption = { id: string; name: string };

export async function listActiveAffiliateOptions(): Promise<AffiliateOption[]> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliates")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  if (error) {
    if (isMissingTableOrColumn(error)) return [];
    throw new Error(`Failed to load affiliates: ${error.message}`);
  }
  return data ?? [];
}
