// Server-side read for the stockist Dashboard. Import only from server
// components, never from a "use client" file (client files may import the
// TYPES below, which are erased at build).
//
// Nothing is calculated in the browser. It gathers two things that already
// exist in the database and returns them as typed, camelCase data:
//   my_stockist_dashboard()   stock, affiliates, period totals, chart series
//   my_stockist_orders()      the latest orders (via listMyStockistOrders)
//
// Own data only: the stockist is found from the signed-in user, and the
// browser never sends a stockist id. The period list is shared with the
// affiliate dashboard (same ranges, same parseRange for the URL value).

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  listMyStockistOrders,
  type StockistOrderRow,
} from "@/lib/stockist/orders-queries";
import {
  DEFAULT_RANGE,
  type DashboardRange,
} from "@/lib/affiliate/dashboard-ranges";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type StockistDashboardDay = {
  day: string; // "2026-10-08" (a UTC day; the first day of a month for 12m)
  orders: number;
  units: number;
  salesUsd: number;
};

export type LowStockItem = {
  productName: string;
  packName: string;
  remaining: number;
};

// All amounts are USD.
export type StockistDashboard = {
  range: DashboardRange;
  bucket: "day" | "month"; // one point per day, or per month for 12m
  activeAffiliates: number;
  stockRemaining: number; // packs left now, not tied to the period
  lowStock: LowStockItem[]; // up to 5, lowest first
  period: { orders: number; units: number; salesUsd: number };
  daily: StockistDashboardDay[]; // oldest first, zeros included
  recentOrders: StockistOrderRow[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

type RawDashboard = {
  bucket?: string;
  active_affiliates?: number | string;
  stock_remaining?: number | string;
  low_stock?: {
    product_name: string;
    pack_name: string;
    remaining: number | string;
  }[];
  period?: {
    orders?: number | string;
    units?: number | string;
    sales_usd?: number | string;
  };
  daily?: {
    day: string;
    orders: number | string;
    units: number | string;
    sales_usd: number | string;
  }[];
};

const RECENT_ORDERS = 5;

/* ------------------------------------------------------------------ */
/* Read                                                                 */
/* ------------------------------------------------------------------ */

export async function getMyStockistDashboard(
  range: DashboardRange = DEFAULT_RANGE,
): Promise<StockistDashboard> {
  await requireRole("stockist");
  const supabase = await createClient();

  const [statsResult, recent] = await Promise.all([
    supabase.rpc("my_stockist_dashboard", { p_range: range }),
    listMyStockistOrders({ page: 1, pageSize: RECENT_ORDERS }),
  ]);

  if (statsResult.error) {
    throw new Error(`Failed to load dashboard: ${statsResult.error.message}`);
  }

  const s = (statsResult.data ?? {}) as RawDashboard;

  return {
    range,
    bucket: s.bucket === "month" ? "month" : "day",
    activeAffiliates: num(s.active_affiliates),
    stockRemaining: num(s.stock_remaining),
    lowStock: (s.low_stock ?? []).map((l) => ({
      productName: l.product_name,
      packName: l.pack_name,
      remaining: num(l.remaining),
    })),
    period: {
      orders: num(s.period?.orders),
      units: num(s.period?.units),
      salesUsd: num(s.period?.sales_usd),
    },
    daily: (s.daily ?? []).map((d) => ({
      day: d.day,
      orders: num(d.orders),
      units: num(d.units),
      salesUsd: num(d.sales_usd),
    })),
    recentOrders: recent.items,
  };
}
