// Server-side read for the admin Dashboard. Import only from server
// components, never from a "use client" file (client files may import the
// TYPES below, which are erased at build).
//
// One call, admin_dashboard(p_from, p_to), returns everything the page
// needs for the chosen period AND the equal-length period right before it
// (so the UI can show "+12.4% vs previous"). The previous period is worked
// out inside the database, so it is no longer sent from here.
//
// All amounts are USD. Visitors / clicks are not included yet (no tracking
// table exists until the visitor tracking step).

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import type { DateRange } from "@/lib/admin/date-range";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type DashboardKpis = {
  revenue: number; // paid, not cancelled retail orders
  revenuePrev: number;
  orders: number;
  ordersPrev: number;
  aov: number; // average order value
  aovPrev: number;
  refunds: number; // orders refunded in the period
  refundsPrev: number;
  refundsUsd: number;
  wholesaleUsd: number; // bulk orders approved in the period (separate from retail)
  wholesaleUsdPrev: number;
  commissionUsd: number; // affiliate commission earned on the period's orders
  payoutsPaidUsd: number; // payouts marked paid in the period
  payoutsPaidUsdPrev: number;
  newAffiliates: number;
  newAffiliatesPrev: number;
  activeAffiliates: number; // right now
  activeStockists: number; // right now
};

export type DashboardRangeInfo = {
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  days: number;
  bucket: "day" | "month"; // one point per day, or per month for long periods
};

export type SeriesPoint = {
  day: string; // "2026-10-08" (a UTC day; the first day of a month for "month")
  orders: number;
  revenue: number;
};

export type ChannelRow = {
  channel: "direct" | "affiliate";
  orders: number;
  revenue: number;
};

export type TopProduct = { name: string; units: number; revenue: number };

export type TopAffiliate = {
  name: string;
  stockist: string | null;
  orders: number;
  revenue: number;
};

export type TopStockist = { name: string; orders: number; revenue: number };

export type TopCountry = { country: string; orders: number; revenue: number };

// Everything waiting for an admin click.
export type Attention = {
  payoutsToReview: { count: number; amount: number };
  payoutsToPay: { count: number; amount: number };
  stockistRequests: number;
  bulkOrdersToReview: number;
  ordersToShip: number;
  lowStock: number;
  outOfStock: number;
};

export type RecentOrder = {
  id: string;
  number: string;
  customer: string;
  totalUsd: number;
  status: string;
  paymentStatus: string;
  affiliate: string | null;
  stockist: string | null;
  createdAt: string;
};

export type DashboardData = {
  range: DashboardRangeInfo;
  kpis: DashboardKpis;
  series: SeriesPoint[];
  channels: ChannelRow[];
  topProducts: TopProduct[];
  topAffiliates: TopAffiliate[];
  topStockists: TopStockist[];
  topCountries: TopCountry[];
  attention: Attention;
  recentOrders: RecentOrder[];
};

/* ------------------------------------------------------------------ */
/* Defensive parsing                                                    */
/* ------------------------------------------------------------------ */
// RPC results are untyped JSON (numerics can arrive as strings), so
// everything is coerced and defaulted instead of trusted.

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const strOrNull = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

const rec = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};

const list = <T>(v: unknown, map: (item: Record<string, unknown>) => T): T[] =>
  Array.isArray(v) ? v.map((item) => map(rec(item))) : [];

function normaliseDashboard(raw: unknown, range: DateRange): DashboardData {
  const root = rec(raw);
  const r = rec(root.range);
  const k = rec(root.kpis);
  const a = rec(root.attention);
  const review = rec(a.payouts_to_review);
  const pay = rec(a.payouts_to_pay);

  return {
    range: {
      from: str(r.from, range.from),
      to: str(r.to, range.to),
      prevFrom: str(r.prev_from),
      prevTo: str(r.prev_to),
      days: num(r.days),
      bucket: r.bucket === "month" ? "month" : "day",
    },
    kpis: {
      revenue: num(k.revenue),
      revenuePrev: num(k.revenue_prev),
      orders: num(k.orders),
      ordersPrev: num(k.orders_prev),
      aov: num(k.aov),
      aovPrev: num(k.aov_prev),
      refunds: num(k.refunds),
      refundsPrev: num(k.refunds_prev),
      refundsUsd: num(k.refunds_usd),
      wholesaleUsd: num(k.wholesale_usd),
      wholesaleUsdPrev: num(k.wholesale_usd_prev),
      commissionUsd: num(k.commission_usd),
      payoutsPaidUsd: num(k.payouts_paid_usd),
      payoutsPaidUsdPrev: num(k.payouts_paid_usd_prev),
      newAffiliates: num(k.new_affiliates),
      newAffiliatesPrev: num(k.new_affiliates_prev),
      activeAffiliates: num(k.active_affiliates),
      activeStockists: num(k.active_stockists),
    },
    series: list(root.series, (i) => ({
      day: str(i.day),
      orders: num(i.orders),
      revenue: num(i.revenue),
    })),
    channels: list(root.channels, (i) => ({
      channel: i.channel === "affiliate" ? "affiliate" : "direct",
      orders: num(i.orders),
      revenue: num(i.revenue),
    })),
    topProducts: list(root.top_products, (i) => ({
      name: str(i.name, "Unnamed product"),
      units: num(i.units),
      revenue: num(i.revenue),
    })),
    topAffiliates: list(root.top_affiliates, (i) => ({
      name: str(i.name, "Affiliate"),
      stockist: strOrNull(i.stockist),
      orders: num(i.orders),
      revenue: num(i.revenue),
    })),
    topStockists: list(root.top_stockists, (i) => ({
      name: str(i.name, "Unnamed stockist"),
      orders: num(i.orders),
      revenue: num(i.revenue),
    })),
    topCountries: list(root.top_countries, (i) => ({
      country: str(i.country).toUpperCase(),
      orders: num(i.orders),
      revenue: num(i.revenue),
    })),
    attention: {
      payoutsToReview: { count: num(review.count), amount: num(review.amount) },
      payoutsToPay: { count: num(pay.count), amount: num(pay.amount) },
      stockistRequests: num(a.stockist_requests),
      bulkOrdersToReview: num(a.bulk_orders_to_review),
      ordersToShip: num(a.orders_to_ship),
      lowStock: num(a.low_stock),
      outOfStock: num(a.out_of_stock),
    },
    recentOrders: list(root.recent_orders, (i) => ({
      id: str(i.id),
      number: str(i.number),
      customer: str(i.customer, "Guest"),
      totalUsd: num(i.total_usd),
      status: str(i.status),
      paymentStatus: str(i.payment_status),
      affiliate: strOrNull(i.affiliate),
      stockist: strOrNull(i.stockist),
      createdAt: str(i.created_at),
    })),
  };
}

// PostgREST / Postgres codes for "this function or table does not exist
// yet". Treated as an empty dashboard, not a crash.
const MISSING_CODES = new Set(["PGRST202", "PGRST205", "42883", "42P01"]);

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export function emptyDashboard(range: DateRange): DashboardData {
  return normaliseDashboard(null, range);
}

export async function getDashboardData(
  range: DateRange,
): Promise<DashboardData> {
  await requireRole("admin");
  const supabase = await createClient();

  // Send UTC instants. The database counts "created_at >= from and
  // created_at < to" and builds the previous period of the same length.
  // range.toDate is 23:59:59.999 of the last day, so one millisecond is
  // added to send the start of the NEXT day (an exact, exclusive end).
  const { data, error } = await supabase.rpc("admin_dashboard", {
    p_from: range.fromDate.toISOString(),
    p_to: new Date(range.toDate.getTime() + 1).toISOString(),
  });

  if (error) {
    if (error.code && MISSING_CODES.has(error.code)) {
      return emptyDashboard(range);
    }
    // Real failures (permissions, bad SQL) must not look like "zero
    // sales". Let the Next.js error boundary handle it.
    throw new Error(`Dashboard query failed: ${error.message}`);
  }

  return normaliseDashboard(data, range);
}
