// Server-side reads for the admin Payouts screens (list + one request).
// Import only from server components and server actions.
//
// Admin only: requireRole("admin") here, and RLS ("admin reads payout ...")
// in the database. Nothing here calculates money; every amount is read
// from the rows that request_payout() froze.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import type { PayoutStatus } from "@/lib/affiliate/payout-queries";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export const PAYOUT_STATUSES: PayoutStatus[] = [
  "requested",
  "approved",
  "paid",
  "rejected",
];

export type AdminPayoutRow = {
  id: string;
  requestNumber: string;
  status: PayoutStatus;
  holderName: string; // from the bank snapshot saved on the request
  orderCount: number;
  totalUsd: number;
  payoutCurrency: string;
  totalPayoutAmount: number | null;
  requestedAt: string;
};

export type AdminPayoutList = {
  rows: AdminPayoutRow[];
  total: number; // all rows matching the filter, for the pager
  page: number;
  pageSize: number;
};

export type AdminPayoutItem = {
  orderNumber: string;
  orderTotalUsd: number;
  commissionPercent: number;
  commissionUsd: number;
};

// Full bank details as frozen on the request. The admin needs the whole
// account number to make the payment, so it is NOT masked here.
export type AdminBankSnapshot = {
  accountHolderName: string;
  bankName: string;
  bankCountry: string;
  accountNumberOrIban: string;
  swiftBic: string | null;
  routingCode: string | null;
  payoutCurrency: string;
};

export type AdminPayoutEvent = {
  event: "requested" | "approved" | "rejected" | "paid";
  actorRole: string | null;
  note: string | null;
  createdAt: string;
};

export type AdminPayoutDetail = {
  id: string;
  requestNumber: string;
  status: PayoutStatus;
  itemsTotalUsd: number;
  adjustmentsUsd: number;
  totalUsd: number;
  payoutCurrency: string;
  totalPayoutAmount: number | null;
  fxRateToUsd: number | null;
  fxRateUpdatedAt: string | null;
  bank: AdminBankSnapshot;
  requestedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  paidAmount: number | null;
  paidCurrency: string | null;
  proofUrl: string | null; // short-lived signed link
  items: AdminPayoutItem[];
  events: AdminPayoutEvent[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 20;
const PROOF_BUCKET = "payout-proofs";
const PROOF_LINK_SECONDS = 60 * 60; // 1 hour

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strOrNull = (v: unknown): string | null =>
  typeof v === "string" && v !== "" ? v : null;

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

export async function getAdminPayoutList(params: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<AdminPayoutList> {
  await requireRole("admin");

  const page = Math.max(1, Math.floor(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("payout_requests")
    .select(
      "id, request_number, status, total_usd, payout_currency, total_payout_amount, requested_at, holder:bank_snapshot->>account_holder_name, payout_request_items ( count )",
      { count: "exact" },
    )
    .order("requested_at", { ascending: false })
    .range(from, to);

  // Only a known status is used. Anything else = no status filter.
  if (
    params.status &&
    PAYOUT_STATUSES.includes(params.status as PayoutStatus)
  ) {
    query = query.eq("status", params.status);
  }

  // Search by request number. Remove the characters that mean something
  // in a LIKE pattern, so the admin's text is only ever plain text.
  const term = (params.search ?? "").replace(/[%_,()\\]/g, "").trim();
  if (term) {
    query = query.ilike("request_number", `%${term}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`Failed to load payout requests: ${error.message}`);
  }

  const rows: AdminPayoutRow[] = (
    (data ?? []) as unknown as Record<string, unknown>[]
  ).map((r) => {
    const counted = r.payout_request_items as { count: number }[] | null;
    return {
      id: r.id as string,
      requestNumber: r.request_number as string,
      status: r.status as PayoutStatus,
      holderName: str(r.holder),
      orderCount: counted?.[0]?.count ?? 0,
      totalUsd: num(r.total_usd),
      payoutCurrency: r.payout_currency as string,
      totalPayoutAmount:
        r.total_payout_amount == null ? null : num(r.total_payout_amount),
      requestedAt: r.requested_at as string,
    };
  });

  return { rows, total: count ?? 0, page, pageSize: PAGE_SIZE };
}

/* ------------------------------------------------------------------ */
/* One request                                                          */
/* ------------------------------------------------------------------ */

export async function getAdminPayoutDetail(
  id: string,
): Promise<AdminPayoutDetail | null> {
  await requireRole("admin");

  // A bad id in the URL is "not found", not a database error.
  if (!UUID_RE.test(id)) return null;

  const supabase = await createClient();

  const [requestResult, itemsResult, eventsResult] = await Promise.all([
    supabase.from("payout_requests").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("payout_request_items")
      .select(
        "order_number, order_total_usd, commission_percent, commission_usd",
      )
      .eq("payout_request_id", id)
      .order("order_number", { ascending: true }),
    supabase
      .from("payout_events")
      .select("event, actor_role, note, created_at")
      .eq("payout_request_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (requestResult.error) {
    throw new Error(`Failed to load request: ${requestResult.error.message}`);
  }
  if (itemsResult.error) {
    throw new Error(`Failed to load orders: ${itemsResult.error.message}`);
  }
  if (eventsResult.error) {
    throw new Error(`Failed to load history: ${eventsResult.error.message}`);
  }

  const r = requestResult.data as Record<string, unknown> | null;
  if (!r) return null;

  const snap = (r.bank_snapshot ?? {}) as Record<string, unknown>;

  /* Signed link for the payment proof (admin storage policy allows it). */
  let proofUrl: string | null = null;
  const proofPath = strOrNull(r.payment_proof_path);
  if (proofPath) {
    const { data: signed } = await supabase.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(proofPath, PROOF_LINK_SECONDS);
    proofUrl = signed?.signedUrl ?? null;
  }

  return {
    id: r.id as string,
    requestNumber: r.request_number as string,
    status: r.status as PayoutStatus,
    itemsTotalUsd: num(r.items_total_usd),
    adjustmentsUsd: num(r.adjustments_usd),
    totalUsd: num(r.total_usd),
    payoutCurrency: r.payout_currency as string,
    totalPayoutAmount:
      r.total_payout_amount == null ? null : num(r.total_payout_amount),
    fxRateToUsd: r.fx_rate_to_usd == null ? null : num(r.fx_rate_to_usd),
    fxRateUpdatedAt: strOrNull(r.fx_rate_updated_at),
    bank: {
      accountHolderName: str(snap.account_holder_name),
      bankName: str(snap.bank_name),
      bankCountry: str(snap.bank_country),
      accountNumberOrIban: str(snap.account_number_or_iban),
      swiftBic: strOrNull(snap.swift_bic),
      routingCode: strOrNull(snap.routing_code),
      payoutCurrency:
        str(snap.payout_currency) || (r.payout_currency as string),
    },
    requestedAt: r.requested_at as string,
    approvedAt: strOrNull(r.approved_at),
    rejectedAt: strOrNull(r.rejected_at),
    rejectionReason: strOrNull(r.rejection_reason),
    paidAt: strOrNull(r.paid_at),
    paymentReference: strOrNull(r.payment_reference),
    paidAmount: r.paid_amount == null ? null : num(r.paid_amount),
    paidCurrency: strOrNull(r.paid_currency),
    proofUrl,
    items: (itemsResult.data ?? []).map((i) => ({
      orderNumber: i.order_number as string,
      orderTotalUsd: num(i.order_total_usd),
      commissionPercent: num(i.commission_percent),
      commissionUsd: num(i.commission_usd),
    })),
    events: (eventsResult.data ?? []).map((e) => ({
      event: e.event as AdminPayoutEvent["event"],
      actorRole: (e.actor_role as string | null) ?? null,
      note: (e.note as string | null) ?? null,
      createdAt: e.created_at as string,
    })),
  };
}
