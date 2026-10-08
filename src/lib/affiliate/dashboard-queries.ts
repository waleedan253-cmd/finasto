// src/lib/affiliate/dashboard-queries.ts
//
// One server-side function, getMyDashboard(), that gathers everything the
// affiliate dashboard shows:
//   - order counts + 30-day chart series  -> my_dashboard_stats()   (new)
//   - earnings (pending/available/...)    -> affiliate_earnings_summary()
//   - the 5 latest orders                 -> my_orders()
//
// Own data only: no affiliate id is passed from the browser. Every RPC
// identifies the signed-in affiliate from the session.

import { createClient } from "@/lib/supabase/server"; // adjust if your server client lives elsewhere

// ───────────────────────── Types ─────────────────────────

export type DailyPoint = {
  day: string; // "YYYY-MM-DD" (UTC day)
  orders: number;
  commission_usd: number;
};

export type DashboardStats = {
  total_orders: number;
  paid_orders: number;
  refunded_orders: number;
  days: number;
  daily: DailyPoint[];
};

export type DashboardEarnings = {
  pending_usd: number; // still in the refund window
  available_usd: number; // ready to request
  in_review_usd: number; // requested, being reviewed
  paid_usd: number; // already paid out
};

// Kept loose on purpose: my_orders() already exists and is used by the
// orders page, so the dashboard just passes its rows through.
export type RecentOrder = Record<string, unknown>;

export type AffiliateDashboard = {
  stats: DashboardStats;
  earnings: DashboardEarnings;
  recentOrders: RecentOrder[];
};

// ───────────────────────── Helpers ─────────────────────────

const RECENT_ORDERS_LIMIT = 5;
const CHART_DAYS = 30;

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

// affiliate_earnings_summary() may come back as an object or a one-row
// array depending on how it was declared, so accept both.
function normalizeEarnings(raw: unknown): DashboardEarnings {
  const row = (Array.isArray(raw) ? raw[0] : raw) as
    | Record<string, unknown>
    | null
    | undefined;

  return {
    pending_usd: num(row?.pending_usd),
    available_usd: num(row?.available_usd),
    in_review_usd: num(row?.in_review_usd),
    paid_usd: num(row?.paid_usd),
  };
}

function normalizeStats(raw: unknown): DashboardStats {
  const s = (raw ?? {}) as Record<string, unknown>;
  const daily = Array.isArray(s.daily) ? s.daily : [];

  return {
    total_orders: num(s.total_orders),
    paid_orders: num(s.paid_orders),
    refunded_orders: num(s.refunded_orders),
    days: num(s.days) || CHART_DAYS,
    daily: daily.map((d) => {
      const p = d as Record<string, unknown>;
      return {
        day: String(p.day ?? ""),
        orders: num(p.orders),
        commission_usd: num(p.commission_usd),
      };
    }),
  };
}

// ───────────────────────── Main query ─────────────────────────

export async function getMyDashboard(): Promise<AffiliateDashboard> {
  const supabase = await createClient();

  const [statsRes, earningsRes, ordersRes] = await Promise.all([
    supabase.rpc("my_dashboard_stats", { p_days: CHART_DAYS }),
    supabase.rpc("affiliate_earnings_summary"),
    supabase.rpc("my_orders"),
  ]);

  if (statsRes.error) throw new Error(statsRes.error.message);
  if (earningsRes.error) throw new Error(earningsRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

  return {
    stats: normalizeStats(statsRes.data),
    earnings: normalizeEarnings(earningsRes.data),
    recentOrders: orders.slice(0, RECENT_ORDERS_LIMIT) as RecentOrder[],
  };
}
