// Server-side reads for the admin Stockists section. Import only from
// server components, route handlers and server actions — never from a
// "use client" file.
//
// Defense in depth: every exported function re-checks requireRole("admin")
// itself, same pattern as product-queries.ts.
//
// Affiliates aren't built yet, so affiliate counts/sales per stockist are
// queried defensively: if the affiliates table (or its stockist_id
// column) doesn't exist yet, this returns 0 instead of crashing the page.
// Once the Affiliates section adds that column, these numbers populate
// automatically with no change needed here.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

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

export type StockistStatus = "active" | "inactive";

export type StockistListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  region: string | null;
  status: StockistStatus;
  defaultProfitPercent: number;
  affiliateCount: number; // 0 until the Affiliates section exists
  updatedAt: string;
  hasAccount: boolean;
};

export type StockistListResult = {
  items: StockistListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type StockistAffiliateRow = {
  id: string;
  name: string;
  status: string;
  sales: number; // USD, 0 until Orders exists
};

export type StockistDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  region: string | null;
  status: StockistStatus;
  defaultProfitPercent: number;
  notes: string | null;
  // Populated once Affiliates/Orders exist; safe zeros/empty until then.
  assignedAffiliates: StockistAffiliateRow[];
  totalSales: number; // USD
  totalProfit: number; // USD
  createdAt: string;
  updatedAt: string;
  hasAccount: boolean;
};

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_PAGE_SIZE = 20;

export async function listStockists(params: {
  search?: string;
  status?: StockistStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<StockistListResult> {
  await requireRole("admin");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("stockists")
    .select(
      "id, name, email, phone, country, region, status, default_profit_percent,profile_id, updated_at",
      {
        count: "exact",
      },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  const search = params.search?.trim();
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isMissingTableOrColumn(error)) {
      return { items: [], total: 0, page, pageSize };
    }
    throw new Error(`Failed to load stockists: ${error.message}`);
  }

  const items: StockistListItem[] = await Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      country: row.country,
      region: row.region,
      status: row.status,
      defaultProfitPercent: num(row.default_profit_percent),
      affiliateCount: await countAffiliatesForStockist(row.id),
      updatedAt: row.updated_at,
      hasAccount: row.profile_id != null,
    })),
  );

  return { items, total: count ?? 0, page, pageSize };
}

// Isolated so a missing affiliates.stockist_id column never breaks the
// whole list — just shows 0 for that stockist until Affiliates exists.
async function countAffiliatesForStockist(stockistId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("affiliates")
    .select("id", { count: "exact", head: true })
    .eq("stockist_id", stockistId);

  if (error) {
    if (isMissingTableOrColumn(error)) return 0;
    return 0; // non-critical for a list view; never fail the page over this
  }
  return count ?? 0;
}

/* ------------------------------------------------------------------ */
/* Single stockist (for the edit form + detail view)                   */
/* ------------------------------------------------------------------ */

export async function getStockistById(
  id: string,
): Promise<StockistDetail | null> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stockists")
    .select(
      "id, name, email, phone, country, region, status, default_profit_percent,profile_id, notes, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTableOrColumn(error)) return null;
    throw new Error(`Failed to load stockist: ${error.message}`);
  }
  if (!data) return null;

  const assignedAffiliates = await getAssignedAffiliates(id);

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    country: data.country,
    region: data.region,
    status: data.status,
    defaultProfitPercent: num(data.default_profit_percent),
    notes: data.notes,
    assignedAffiliates,
    totalSales: assignedAffiliates.reduce((sum, a) => sum + a.sales, 0),
    totalProfit: 0, // populated once order_items.stockist_profit_amount exists
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    hasAccount: data.profile_id != null,
  };
}

async function getAssignedAffiliates(
  stockistId: string,
): Promise<StockistAffiliateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliates")
    // .select("id, status, profiles ( name )")
    .select("id, name, status")
    .eq("stockist_id", stockistId);

  if (error) {
    if (isMissingTableOrColumn(error)) return [];
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    //   (row.profiles as { name?: string } | null)?.name ?? "Unnamed affiliate",
    status: row.status,
    sales: 0, // populated once Orders exists
  }));
}

/* ------------------------------------------------------------------ */
/* Lookups used by the create/edit form                                 */
/* ------------------------------------------------------------------ */

// Used by the create form to catch a duplicate email before submit, and
// by the server action as a defensive re-check.
export async function isStockistEmailTaken(
  email: string,
  excludeId?: string,
): Promise<boolean> {
  await requireRole("admin");
  const supabase = await createClient();

  let query = supabase
    .from("stockists")
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

// For the Affiliates section's stockist dropdown, built now so that
// section doesn't need its own copy of this query later.
export type StockistOption = { id: string; name: string };

export async function listActiveStockistOptions(): Promise<StockistOption[]> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stockists")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  if (error) {
    if (isMissingTableOrColumn(error)) return [];
    throw new Error(`Failed to load stockists: ${error.message}`);
  }
  return data ?? [];
}
export type StockistFieldSuggestions = {
  country: string[];
  region: string[];
};

// Values for the Country and Region / City suggestions: everything already
// used by a stockist, plus the names in your countries table, so the very
// first stockist already sees options. Duplicates that differ only in
// capital letters are merged ("pakistan" and "Pakistan" count as one).
export async function getStockistFieldSuggestions(): Promise<StockistFieldSuggestions> {
  await requireRole("admin");
  const supabase = await createClient();

  const [stockists, countries] = await Promise.all([
    supabase.from("stockists").select("country, region"),
    supabase.from("countries").select("name").eq("active", true),
  ]);

  const uniq = (arr: (string | null | undefined)[]) => {
    const seen = new Map<string, string>();
    for (const raw of arr) {
      const value = raw?.trim();
      if (value && !seen.has(value.toLowerCase())) {
        seen.set(value.toLowerCase(), value);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  };

  const rows = stockists.data ?? [];
  return {
    country: uniq([
      ...rows.map((r) => r.country),
      ...(countries.data ?? []).map((c) => c.name),
    ]),
    region: uniq(rows.map((r) => r.region)),
  };
}
