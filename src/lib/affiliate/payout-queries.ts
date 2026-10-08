// Server-side reads for the affiliate Payout Requests page. Import only
// from server components and server actions, never from a "use client"
// file.
//
// Own data only: the affiliate is found from the signed-in user and the
// browser never sends an affiliate id. The database functions it calls
// (payable_orders, affiliate_earnings_summary) and RLS check the same
// rule again.
//
// Nothing here calculates money. The commission per order, the totals and
// the "payable" rule all come from the database (payouts.sql), so this
// page, the request action and the admin screens always agree.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type PayoutStatus = "requested" | "approved" | "paid" | "rejected";

// One order the affiliate can tick and request right now.
export type EligibleOrder = {
  orderId: string;
  orderNumber: string;
  orderedAt: string;
  shippedAt: string | null;
  refundWindowEndsAt: string | null;
  orderTotalUsd: number;
  commissionPercent: number;
  commissionUsd: number;
};

export type EarningsSummary = {
  pendingUsd: number; // paid, but not payable yet (window still open)
  availableUsd: number; // payable now, after refund adjustments
  refundAdjustmentsUsd: number; // the (negative) adjustment part of available
  inReviewUsd: number; // requested or approved, waiting to be paid
  paidUsd: number; // already paid out
};

// The saved bank details, shown in the confirmation step so the affiliate
// can check them. The account number is shortened.
export type BankSummary = {
  accountHolderName: string;
  bankName: string;
  bankCountry: string;
  accountMasked: string; // e.g. "•••• 4821"
  payoutCurrency: string;
};

export type MyPayoutRequest = {
  id: string;
  requestNumber: string;
  status: PayoutStatus;
  orderCount: number;
  itemsTotalUsd: number;
  adjustmentsUsd: number;
  totalUsd: number;
  payoutCurrency: string;
  totalPayoutAmount: number | null; // indicative, only when a fresh rate existed
  requestedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  paidAt: string | null;
};

export type PayoutPageData = {
  summary: EarningsSummary;
  eligibleOrders: EligibleOrder[];
  bank: BankSummary | null; // null = no bank details saved yet
  minPayoutUsd: number; // 0 = no minimum
  requests: MyPayoutRequest[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const maskAccount = (value: string) => {
  const v = value.replace(/\s+/g, "");
  return v.length <= 4 ? "••••" : `•••• ${v.slice(-4)}`;
};

async function getOwnAffiliateId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("affiliates")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

/* ------------------------------------------------------------------ */
/* Page data                                                            */
/* ------------------------------------------------------------------ */

export async function getMyPayoutPageData(): Promise<PayoutPageData | null> {
  const { user } = await requireRole("affiliate");

  const affiliateId = await getOwnAffiliateId(user.id);
  if (!affiliateId) return null;

  const supabase = await createClient();

  const [summaryResult, eligibleResult, bankResult, requestsResult, minResult] =
    await Promise.all([
      supabase.rpc("affiliate_earnings_summary", {
        p_affiliate_id: affiliateId,
      }),
      supabase.rpc("payable_orders", { p_affiliate_id: affiliateId }),
      supabase
        .from("affiliate_bank_details")
        .select(
          "account_holder_name, bank_name, bank_country, account_number_or_iban, payout_currency",
        )
        .eq("affiliate_id", affiliateId)
        .maybeSingle(),
      supabase
        .from("payout_requests")
        .select(
          "id, request_number, status, items_total_usd, adjustments_usd, total_usd, payout_currency, total_payout_amount, requested_at, approved_at, rejected_at, rejection_reason, paid_at, payout_request_items ( count )",
        )
        .eq("affiliate_id", affiliateId)
        .order("requested_at", { ascending: false })
        .limit(50),
      supabase.rpc("get_min_payout_usd"),
    ]);

  if (summaryResult.error) {
    throw new Error(`Failed to load earnings: ${summaryResult.error.message}`);
  }
  if (eligibleResult.error) {
    throw new Error(`Failed to load orders: ${eligibleResult.error.message}`);
  }
  if (bankResult.error) {
    throw new Error(`Failed to load bank details: ${bankResult.error.message}`);
  }
  if (requestsResult.error) {
    throw new Error(`Failed to load requests: ${requestsResult.error.message}`);
  }

  /* Earnings summary: the function returns exactly one row. */
  const s = ((summaryResult.data ?? []) as Record<string, unknown>[])[0] ?? {};
  const summary: EarningsSummary = {
    pendingUsd: num(s.pending_usd),
    availableUsd: num(s.available_usd),
    refundAdjustmentsUsd: num(s.refund_adjustments_usd),
    inReviewUsd: num(s.in_review_usd),
    paidUsd: num(s.paid_usd),
  };

  /* Orders the affiliate can request right now. */
  const eligibleOrders: EligibleOrder[] = (
    (eligibleResult.data ?? []) as Record<string, unknown>[]
  ).map((o) => ({
    orderId: o.order_id as string,
    orderNumber: o.order_number as string,
    orderedAt: o.ordered_at as string,
    shippedAt: (o.shipped_at as string | null) ?? null,
    refundWindowEndsAt: (o.refund_window_ends_at as string | null) ?? null,
    orderTotalUsd: num(o.order_total_usd),
    commissionPercent: num(o.commission_percent),
    commissionUsd: num(o.commission_usd),
  }));

  /* Saved bank details (shortened account number). */
  const bankRow = bankResult.data;
  const bank: BankSummary | null = bankRow
    ? {
        accountHolderName: bankRow.account_holder_name,
        bankName: bankRow.bank_name,
        bankCountry: bankRow.bank_country,
        accountMasked: maskAccount(bankRow.account_number_or_iban),
        payoutCurrency: String(bankRow.payout_currency).toUpperCase(),
      }
    : null;

  /* Request history. The embedded count comes back as [{ count: n }]. */
  const requests: MyPayoutRequest[] = (requestsResult.data ?? []).map((r) => {
    const counted = r.payout_request_items as { count: number }[] | null;
    return {
      id: r.id,
      requestNumber: r.request_number,
      status: r.status as PayoutStatus,
      orderCount: counted?.[0]?.count ?? 0,
      itemsTotalUsd: num(r.items_total_usd),
      adjustmentsUsd: num(r.adjustments_usd),
      totalUsd: num(r.total_usd),
      payoutCurrency: r.payout_currency,
      totalPayoutAmount:
        r.total_payout_amount == null ? null : num(r.total_payout_amount),
      requestedAt: r.requested_at,
      approvedAt: r.approved_at,
      rejectedAt: r.rejected_at,
      rejectionReason: r.rejection_reason,
      paidAt: r.paid_at,
    };
  });

  return {
    summary,
    eligibleOrders,
    bank,
    // If the minimum can't be read, show no minimum rather than breaking
    // the page. The database still enforces it when a request is sent.
    minPayoutUsd: minResult.error ? 0 : num(minResult.data),
    requests,
  };
}
/* ------------------------------------------------------------------ */
/* Paid payouts (Accounts page)                                         */
/* ------------------------------------------------------------------ */

export type PaidPayoutOrder = {
  orderNumber: string;
  orderTotalUsd: number;
  commissionUsd: number;
};

export type PaidPayout = {
  id: string;
  requestNumber: string;
  totalUsd: number;
  paidAmount: number | null; // what the admin actually sent
  paidCurrency: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  proofUrl: string | null; // short-lived signed link, null if it failed
  orders: PaidPayoutOrder[];
};

const PROOF_BUCKET = "payout-proofs";
const PROOF_LINK_SECONDS = 60 * 60; // the link works for 1 hour

export async function getMyPaidPayouts(): Promise<PaidPayout[] | null> {
  const { user } = await requireRole("affiliate");

  const affiliateId = await getOwnAffiliateId(user.id);
  if (!affiliateId) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payout_requests")
    .select(
      "id, request_number, total_usd, paid_amount, paid_currency, paid_at, payment_reference, payment_proof_path, payout_request_items ( order_number, order_total_usd, commission_usd )",
    )
    .eq("affiliate_id", affiliateId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to load paid payouts: ${error.message}`);
  }

  const rows = data ?? [];

  /* One call creates all the signed links. The storage policy lets an
     affiliate sign only files inside their own request folders. */
  const paths = rows
    .map((r) => r.payment_proof_path as string | null)
    .filter((p): p is string => !!p);

  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from(PROOF_BUCKET)
      .createSignedUrls(paths, PROOF_LINK_SECONDS);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl && !s.error) urlByPath.set(s.path, s.signedUrl);
    }
  }

  return rows.map((r) => {
    const items = (r.payout_request_items ?? []) as {
      order_number: string;
      order_total_usd: unknown;
      commission_usd: unknown;
    }[];
    const proofPath = r.payment_proof_path as string | null;

    return {
      id: r.id,
      requestNumber: r.request_number,
      totalUsd: num(r.total_usd),
      paidAmount: r.paid_amount == null ? null : num(r.paid_amount),
      paidCurrency: r.paid_currency ?? null,
      paidAt: r.paid_at ?? null,
      paymentReference: r.payment_reference ?? null,
      proofUrl: proofPath ? (urlByPath.get(proofPath) ?? null) : null,
      orders: items
        .map((i) => ({
          orderNumber: i.order_number,
          orderTotalUsd: num(i.order_total_usd),
          commissionUsd: num(i.commission_usd),
        }))
        .sort((a, b) => a.orderNumber.localeCompare(b.orderNumber)),
    };
  });
}
