// Server-side reads for the affiliate Dashboard. Import only from server
// components, never from a "use client" file (client files may import the
// TYPES below, which are erased at build).
//
// Nothing here is calculated in the browser or typed in by anyone: it
// gathers three things that already exist in the database and returns
// them as typed, camelCase data:
//   my_dashboard_stats()          order counts + the daily chart series
//   affiliate_earnings_summary()  pending / available / in review / paid
//   my_orders()                   the latest orders (via listMyOrders)
//
// Own data only: the affiliate is found from the signed-in user, and the
// browser never sends an affiliate id.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { listMyOrders, type MyOrderRow } from "@/lib/affiliate/orders-queries";
import {
  DEFAULT_RANGE,
  type DashboardRange,
} from "@/lib/affiliate/dashboard-ranges";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type DashboardCounts = {
  totalOrders: number; // every order placed through the affiliate's links
  paidOrders: number;
  refundedOrders: number;
};

// All amounts are USD, the base currency.
export type DashboardEarnings = {
  pendingUsd: number; // paid, but the refund window is still open
  availableUsd: number; // can be requested now (net of refund adjustments)
  refundAdjustmentsUsd: number; // negative, the adjustment part of available
  inReviewUsd: number; // in a payout request that is not paid yet
  paidUsd: number; // already paid out
};

export type DashboardDay = {
  day: string; // "2026-10-08" (a UTC day)
  orders: number;
  commissionUsd: number;
};

export type MyDashboard = {
  counts: DashboardCounts;
  earnings: DashboardEarnings;
  daily: DashboardDay[]; // one entry per day, oldest first, zeros included
  range: DashboardRange; // the period the chart shows
  bucket: "day" | "month"; // one bar per day, or per month for 12m
  recentOrders: MyOrderRow[];
  canRequestPayout: boolean; // something is available to request
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

type RawStats = {
  total_orders?: number | string;
  paid_orders?: number | string;
  refunded_orders?: number | string;
  bucket?: string;
  daily?: {
    day: string;
    orders: number | string;
    commission_usd: number | string;
  }[];
};

type RawEarnings = {
  pending_usd: number | string | null;
  available_usd: number | string | null;
  refund_adjustments_usd: number | string | null;
  in_review_usd: number | string | null;
  paid_usd: number | string | null;
};

const RECENT_ORDERS = 5;

/* ------------------------------------------------------------------ */
/* Read                                                                 */
/* ------------------------------------------------------------------ */

// Returns null when the login has no affiliate row (the layout normally
// blocks that first, so this is only a safety net).
export async function getMyDashboard(
  range: DashboardRange = DEFAULT_RANGE,
): Promise<MyDashboard | null> {
  const { user } = await requireRole("affiliate");
  const supabase = await createClient();

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!affiliate) return null;

  const [statsResult, earningsResult, recent] = await Promise.all([
    supabase.rpc("my_dashboard_stats", { p_range: range }),
    supabase.rpc("affiliate_earnings_summary", {
      p_affiliate_id: affiliate.id,
    }),
    listMyOrders({ page: 1, pageSize: RECENT_ORDERS }),
  ]);

  if (statsResult.error) {
    throw new Error(`Failed to load dashboard: ${statsResult.error.message}`);
  }
  if (earningsResult.error) {
    throw new Error(`Failed to load earnings: ${earningsResult.error.message}`);
  }

  const stats = (statsResult.data ?? {}) as RawStats;

  // A function that returns a table comes back as a list of rows; take
  // the single row (and accept a bare object too).
  const earningsData = earningsResult.data as
    | RawEarnings[]
    | RawEarnings
    | null;
  const e = (Array.isArray(earningsData) ? earningsData[0] : earningsData) ?? {
    pending_usd: 0,
    available_usd: 0,
    refund_adjustments_usd: 0,
    in_review_usd: 0,
    paid_usd: 0,
  };

  const earnings: DashboardEarnings = {
    pendingUsd: num(e.pending_usd),
    availableUsd: num(e.available_usd),
    refundAdjustmentsUsd: num(e.refund_adjustments_usd),
    inReviewUsd: num(e.in_review_usd),
    paidUsd: num(e.paid_usd),
  };

  return {
    counts: {
      totalOrders: num(stats.total_orders),
      paidOrders: num(stats.paid_orders),
      refundedOrders: num(stats.refunded_orders),
    },
    earnings,
    daily: (stats.daily ?? []).map((d) => ({
      day: d.day,
      orders: num(d.orders),
      commissionUsd: num(d.commission_usd),
    })),
    range,
    bucket: stats.bucket === "month" ? "month" : "day",
    recentOrders: recent.rows,
    canRequestPayout: earnings.availableUsd > 0,
  };
}
