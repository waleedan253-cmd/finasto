// Server-side reads for the admin Bulk Orders section. Import only from
// server components, route handlers and server actions, never from a
// "use client" file.
//
// Read-only by design: every change to a bulk order goes through the
// database functions (quote / reject / return / approve / cancel), wrapped
// in bulk-order-actions.ts. Totals, discount and prices were saved on the
// order when the stockist submitted it, so nothing here recalculates money.
//
// Until the bulk-orders SQL has been run, every function returns a safe
// empty result instead of crashing the page.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "BO-000123", the number stockists and admins quote to each other.
// Computed here so client components receive it ready-made and never need
// to import this server-only file for a formatter.
function numberLabel(n: number): string {
  return `BO-${String(n).padStart(6, "0")}`;
}

// Commas and brackets break PostgREST's .or() filter syntax, and % / *
// act as wildcards, so strip them from anything the admin types.
function sanitizeSearch(value: string): string {
  return value.replace(/[,()%*]/g, " ").trim();
}

const BUCKET = "bulk-order-proofs";
const PROOF_URL_TTL_SECONDS = 300; // 5 minutes, regenerated on every page load

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type BulkOrderStatus =
  | "requested"
  | "awaiting_payment"
  | "payment_submitted"
  | "approved"
  | "rejected"
  | "cancelled";

export const BULK_ORDER_STATUSES: BulkOrderStatus[] = [
  "requested",
  "awaiting_payment",
  "payment_submitted",
  "approved",
  "rejected",
  "cancelled",
];

export type BulkOrderListItem = {
  id: string;
  number: number;
  numberLabel: string; // "BO-000123"
  stockistId: string;
  stockistName: string;
  stockistEmail: string;
  status: BulkOrderStatus;
  discountPercent: number;
  totalUsd: number;
  itemCount: number; // number of different packs
  units: number; // total quantity across all packs
  createdAt: string;
  updatedAt: string;
};

export type BulkOrderListResult = {
  items: BulkOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type BulkOrderItemDetail = {
  id: string;
  productName: string;
  packName: string;
  quantity: number;
  retailUsd: number; // regular price per pack at submit time
  unitPriceUsd: number; // after the stockist's discount
  lineTotalUsd: number;
};

export type BulkOrderDetail = {
  id: string;
  number: number;
  numberLabel: string;
  status: BulkOrderStatus;
  stockistId: string;
  stockistName: string;
  stockistEmail: string;
  discountPercent: number;
  totalUsd: number;
  retailTotalUsd: number; // what the same packs cost at regular price
  savingsUsd: number; // retailTotalUsd - totalUsd
  stockistNote: string | null;
  adminNote: string | null;
  bankDetails: string | null;
  paymentReference: string | null;
  stockReserved: boolean;
  items: BulkOrderItemDetail[];
  // Short-lived signed link to the private proof file, or null when the
  // stockist hasn't uploaded one (or the link couldn't be created).
  proofUrl: string | null;
  proofIsPdf: boolean;
  quotedAt: string | null;
  proofSubmittedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_PAGE_SIZE = 20;

export async function listBulkOrders(params: {
  search?: string;
  status?: BulkOrderStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<BulkOrderListResult> {
  await requireRole("admin");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const empty: BulkOrderListResult = { items: [], total: 0, page, pageSize };

  const supabase = await createClient();

  let query = supabase
    .from("bulk_orders")
    .select(
      `
      id, number, stockist_id, status, discount_percent, total_usd,
      created_at, updated_at,
      stockists ( name, email ),
      bulk_order_items ( quantity )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  // Search by order number ("BO-000123" or just "123") or by stockist
  // name/email. Stockist names live in another table, so look the
  // matching stockist ids up first and filter on those.
  const search = sanitizeSearch(params.search ?? "");
  if (search) {
    const asNumber = search.replace(/^bo-?/i, "");
    if (/^\d+$/.test(asNumber)) {
      query = query.eq("number", Number(asNumber));
    } else {
      const { data: matches, error: matchError } = await supabase
        .from("stockists")
        .select("id")
        .or(`name.ilike.%${search}%,email.ilike.%${search}%`);

      if (matchError) {
        if (isMissingTable(matchError)) return empty;
        throw new Error(`Failed to search stockists: ${matchError.message}`);
      }
      const ids = (matches ?? []).map((m) => m.id);
      if (ids.length === 0) return empty;
      query = query.in("stockist_id", ids);
    }
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isMissingTable(error)) return empty;
    throw new Error(`Failed to load bulk orders: ${error.message}`);
  }

  const items: BulkOrderListItem[] = (data ?? []).map((row) => {
    const stockist = row.stockists as { name?: string; email?: string } | null;
    const lines = Array.isArray(row.bulk_order_items)
      ? row.bulk_order_items
      : [];
    const number = num(row.number);

    return {
      id: row.id,
      number,
      numberLabel: numberLabel(number),
      stockistId: row.stockist_id,
      stockistName: stockist?.name ?? "Unknown stockist",
      stockistEmail: stockist?.email ?? "",
      status: row.status,
      discountPercent: num(row.discount_percent),
      totalUsd: num(row.total_usd),
      itemCount: lines.length,
      units: lines.reduce((sum, l) => sum + num(l.quantity), 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return { items, total: count ?? 0, page, pageSize };
}

/* ------------------------------------------------------------------ */
/* Status counts (for the filter tabs)                                  */
/* ------------------------------------------------------------------ */

export type BulkOrderStatusCounts = Record<BulkOrderStatus | "all", number>;

export async function getBulkOrderStatusCounts(): Promise<BulkOrderStatusCounts> {
  await requireRole("admin");
  const supabase = await createClient();

  const zero = Object.fromEntries(
    [...BULK_ORDER_STATUSES, "all"].map((s) => [s, 0]),
  ) as BulkOrderStatusCounts;

  const results = await Promise.all(
    BULK_ORDER_STATUSES.map(async (status) => {
      const { count, error } = await supabase
        .from("bulk_orders")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      return { status, count: error ? 0 : (count ?? 0) };
    }),
  );

  const counts = { ...zero };
  for (const { status, count } of results) {
    counts[status] = count;
    counts.all += count;
  }
  return counts;
}

/* ------------------------------------------------------------------ */
/* Single order                                                         */
/* ------------------------------------------------------------------ */

export async function getBulkOrderById(
  id: string,
): Promise<BulkOrderDetail | null> {
  await requireRole("admin");
  if (!UUID_RE.test(id)) return null; // a malformed id is "not found", not a crash

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bulk_orders")
    .select(
      `
      id, number, status, stockist_id, discount_percent, total_usd,
      stockist_note, admin_note, bank_details, payment_reference,
      proof_path, stock_reserved,
      quoted_at, proof_submitted_at, decided_at, created_at, updated_at,
      stockists ( name, email ),
      bulk_order_items (
        id, product_name, pack_name, quantity,
        retail_usd, unit_price_usd, line_total_usd
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return null;
    throw new Error(`Failed to load bulk order: ${error.message}`);
  }
  if (!data) return null;

  const stockist = data.stockists as { name?: string; email?: string } | null;
  const number = num(data.number);

  const items: BulkOrderItemDetail[] = (data.bulk_order_items ?? [])
    .map((i) => ({
      id: i.id,
      productName: i.product_name,
      packName: i.pack_name,
      quantity: num(i.quantity),
      retailUsd: num(i.retail_usd),
      unitPriceUsd: num(i.unit_price_usd),
      lineTotalUsd: num(i.line_total_usd),
    }))
    .sort(
      (a, b) =>
        a.productName.localeCompare(b.productName) ||
        a.packName.localeCompare(b.packName),
    );

  const totalUsd = num(data.total_usd);
  const retailTotalUsd = items.reduce(
    (sum, i) => sum + i.retailUsd * i.quantity,
    0,
  );

  // The proof sits in a PRIVATE bucket, so it needs a short-lived signed
  // link. The admin read policy on storage.objects allows this.
  let proofUrl: string | null = null;
  if (data.proof_path) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(data.proof_path, PROOF_URL_TTL_SECONDS);
    proofUrl = signed?.signedUrl ?? null;
  }

  return {
    id: data.id,
    number,
    numberLabel: numberLabel(number),
    status: data.status,
    stockistId: data.stockist_id,
    stockistName: stockist?.name ?? "Unknown stockist",
    stockistEmail: stockist?.email ?? "",
    discountPercent: num(data.discount_percent),
    totalUsd,
    retailTotalUsd,
    savingsUsd: Math.max(0, retailTotalUsd - totalUsd),
    stockistNote: data.stockist_note,
    adminNote: data.admin_note,
    bankDetails: data.bank_details,
    paymentReference: data.payment_reference,
    stockReserved: !!data.stock_reserved,
    items,
    proofUrl,
    proofIsPdf:
      !!data.proof_path && data.proof_path.toLowerCase().endsWith(".pdf"),
    quotedAt: data.quoted_at,
    proofSubmittedAt: data.proof_submitted_at,
    decidedAt: data.decided_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
