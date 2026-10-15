// Server-side reads for the stockist Bulk Orders pages. Import only from
// server components and server actions, never from a "use client" file
// (client files may import the TYPES and formatBulkOrderNumber below, which
// are plain and safe).
//
// A stockist has no direct access to the bulk order tables. Everything is
// read through my_bulk_orders() and my_bulk_order(), which return only the
// signed-in stockist's own orders. The browser never sends a stockist id.
//
// The proof of payment lives in a private bucket, so the detail read turns
// it into a short-lived signed link (the stockist may read only their own
// folder).

import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type BulkOrderStatus =
  | "requested" // submitted, waiting for the admin
  | "awaiting_payment" // admin sent bank details, stockist must pay
  | "payment_submitted" // proof uploaded, waiting for the admin
  | "approved" // paid, packs added to the stockist's stock
  | "rejected" // admin declined the request
  | "cancelled";

// All amounts are USD.
export type BulkOrderRow = {
  id: string;
  number: number;
  displayNumber: string; // "BO-000123"
  status: BulkOrderStatus;
  totalUsd: number;
  itemCount: number; // different packs on the order
  units: number; // total quantity
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BulkOrderListResult = {
  items: BulkOrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type BulkOrderItem = {
  id: string;
  productName: string;
  packName: string;
  quantity: number;
  retailUsd: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
};

export type BulkOrderDetail = {
  id: string;
  number: number;
  displayNumber: string;
  status: BulkOrderStatus;
  discountPercent: number;
  totalUsd: number;
  stockistNote: string | null;
  adminNote: string | null;
  // Only filled once the admin has sent them.
  bankDetails: string | null;
  paymentReference: string | null;
  // Short-lived link to the uploaded proof (null if none or unreadable).
  proofUrl: string | null;
  hasProof: boolean;
  items: BulkOrderItem[];
  createdAt: string;
  quotedAt: string | null;
  proofSubmittedAt: string | null;
  decidedAt: string | null;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

export const PROOF_BUCKET = "bulk-order-proofs";
const PROOF_LINK_SECONDS = 60 * 60; // one hour
const DEFAULT_PAGE_SIZE = 20;

const idSchema = z.string().uuid();

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function formatBulkOrderNumber(n: number): string {
  return `BO-${String(n).padStart(6, "0")}`;
}

type RawRow = {
  id: string;
  number: number | string;
  status: BulkOrderStatus;
  total_usd: number | string;
  item_count: number | string;
  units: number | string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  total_count: number | string;
};

type RawDetail = {
  id: string;
  number: number | string;
  status: BulkOrderStatus;
  discount_percent: number | string;
  total_usd: number | string;
  stockist_note: string | null;
  admin_note: string | null;
  bank_details: string | null;
  proof_path: string | null;
  payment_reference: string | null;
  quoted_at: string | null;
  proof_submitted_at: string | null;
  decided_at: string | null;
  created_at: string;
  items: {
    id: string;
    product_name: string;
    pack_name: string;
    quantity: number | string;
    retail_usd: number | string;
    unit_price_usd: number | string;
    line_total_usd: number | string;
  }[];
};

/* ------------------------------------------------------------------ */
/* My orders (list)                                                     */
/* ------------------------------------------------------------------ */

export async function listMyBulkOrders(
  params: { page?: number; pageSize?: number } = {},
): Promise<BulkOrderListResult> {
  await requireRole("stockist");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    100,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE),
  );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_bulk_orders", {
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (error) {
    throw new Error(`Failed to load your bulk orders: ${error.message}`);
  }

  const rows = (data ?? []) as RawRow[];

  return {
    items: rows.map((r) => ({
      id: r.id,
      number: num(r.number),
      displayNumber: formatBulkOrderNumber(num(r.number)),
      status: r.status,
      totalUsd: num(r.total_usd),
      itemCount: num(r.item_count),
      units: num(r.units),
      adminNote: r.admin_note,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    total: rows.length > 0 ? num(rows[0].total_count) : 0,
    page,
    pageSize,
  };
}

/* ------------------------------------------------------------------ */
/* One order                                                            */
/* ------------------------------------------------------------------ */

// Returns null for an invalid id or an order that is not the signed-in
// stockist's (the database returns nothing for someone else's order).
export async function getMyBulkOrder(
  orderId: string,
): Promise<BulkOrderDetail | null> {
  await requireRole("stockist");

  if (!idSchema.safeParse(orderId).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_bulk_order", {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(`Failed to load the order: ${error.message}`);
  }

  const raw = data as RawDetail | null;
  if (!raw) return null;

  // The proof is in a private bucket: make a link that works for an hour.
  let proofUrl: string | null = null;
  if (raw.proof_path) {
    const signed = await supabase.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(raw.proof_path, PROOF_LINK_SECONDS);
    if (signed.error) {
      console.error("[bulk-orders] proof link failed:", signed.error.message);
    } else {
      proofUrl = signed.data.signedUrl;
    }
  }

  return {
    id: raw.id,
    number: num(raw.number),
    displayNumber: formatBulkOrderNumber(num(raw.number)),
    status: raw.status,
    discountPercent: num(raw.discount_percent),
    totalUsd: num(raw.total_usd),
    stockistNote: raw.stockist_note,
    adminNote: raw.admin_note,
    bankDetails: raw.bank_details,
    paymentReference: raw.payment_reference,
    proofUrl,
    hasProof: raw.proof_path != null,
    items: (raw.items ?? []).map((i) => ({
      id: i.id,
      productName: i.product_name,
      packName: i.pack_name,
      quantity: num(i.quantity),
      retailUsd: num(i.retail_usd),
      unitPriceUsd: num(i.unit_price_usd),
      lineTotalUsd: num(i.line_total_usd),
    })),
    createdAt: raw.created_at,
    quotedAt: raw.quoted_at,
    proofSubmittedAt: raw.proof_submitted_at,
    decidedAt: raw.decided_at,
  };
}
