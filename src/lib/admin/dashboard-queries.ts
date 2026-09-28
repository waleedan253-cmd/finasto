// // Server-side data layer for the admin dashboard.
// // Import this only from server components or route handlers, never from
// // a "use client" file.
// //
// // Contract-first: one Postgres function, `admin_dashboard`, does all the
// // aggregation in the database and returns a single JSON document. That
// // avoids pulling raw rows through PostgREST (which silently caps results
// // at 1000 rows) and keeps the page to one round trip. The function is
// // written in this section's backend step and must call is_admin() inside,
// // because SECURITY DEFINER functions bypass Row Level Security.
// //
// // Until that function and its tables exist, every value is an honest zero
// // and the UI shows its empty states.

// import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper
// import { previousRange, type DateRange } from "@/lib/admin/date-range";

// // Major units per ISO currency code, e.g. { IDR: 1850000, GBP: 42.5 }.
// // Never summed across currencies here; conversion to the display
// // currency happens in the UI using the existing currency helper.
// export type MoneyByCurrency = Record<string, number>;

// export type DashboardData = {
//   range: { from: string; to: string };
//   kpis: {
//     revenue: MoneyByCurrency;
//     revenuePrev: MoneyByCurrency;
//     orders: number;
//     ordersPrev: number;
//     clicks: number;
//     clicksPrev: number;
//     activeAffiliates: number;
//     newAffiliates: number;
//   };
//   commissions: {
//     pending: MoneyByCurrency;
//     approved: MoneyByCurrency;
//     paid: MoneyByCurrency;
//   };
//   stockists: {
//     total: number;
//     active: number;
//     profitPending: MoneyByCurrency;
//     profitPaid: MoneyByCurrency;
//     top: TopStockist[];
//   };
//   salesSeries: SalesPoint[];
//   topProducts: TopProduct[];
//   topAffiliates: TopAffiliate[];
//   recentOrders: RecentOrder[];
//   pending: {
//     withdrawals: { count: number; amount: MoneyByCurrency };
//     stockistRequests: number;
//     lowStock: number;
//   };
// };

// export type SalesPoint = {
//   date: string; // YYYY-MM-DD
//   orders: number;
//   sales: MoneyByCurrency;
// };

// export type TopProduct = {
//   id: string;
//   name: string;
//   units: number;
//   sales: MoneyByCurrency;
// };

// export type TopAffiliate = {
//   id: string;
//   name: string;
//   stockist: string | null;
//   orders: number;
//   sales: MoneyByCurrency;
// };

// export type TopStockist = {
//   id: string;
//   name: string;
//   affiliates: number;
//   sales: MoneyByCurrency;
//   profit: MoneyByCurrency;
// };

// export type RecentOrder = {
//   id: string;
//   number: string;
//   customer: string;
//   total: number;
//   currency: string;
//   paymentStatus: string;
//   orderStatus: string;
//   affiliate: string | null;
//   stockist: string | null;
//   createdAt: string;
// };

// // ── Defensive parsing ──────────────────────────────────────────────
// // RPC results are untyped JSON (numerics can arrive as strings), so
// // everything is coerced and defaulted instead of trusted.

// const num = (v: unknown): number => {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : 0;
// };

// const str = (v: unknown, fallback = ""): string =>
//   typeof v === "string" ? v : fallback;

// const strOrNull = (v: unknown): string | null =>
//   typeof v === "string" && v.length > 0 ? v : null;

// const rec = (v: unknown): Record<string, unknown> =>
//   v && typeof v === "object" && !Array.isArray(v)
//     ? (v as Record<string, unknown>)
//     : {};

// const list = <T>(v: unknown, map: (item: Record<string, unknown>) => T): T[] =>
//   Array.isArray(v) ? v.map((item) => map(rec(item))) : [];

// function money(v: unknown): MoneyByCurrency {
//   const out: MoneyByCurrency = {};
//   for (const [currency, amount] of Object.entries(rec(v))) {
//     out[currency.toUpperCase()] = num(amount);
//   }
//   return out;
// }

// function normaliseDashboard(raw: unknown, range: DateRange): DashboardData {
//   const root = rec(raw);
//   const k = rec(root.kpis);
//   const c = rec(root.commissions);
//   const s = rec(root.stockists);
//   const p = rec(root.pending);
//   const w = rec(p.withdrawals);

//   return {
//     range: { from: range.from, to: range.to },
//     kpis: {
//       revenue: money(k.revenue),
//       revenuePrev: money(k.revenuePrev),
//       orders: num(k.orders),
//       ordersPrev: num(k.ordersPrev),
//       clicks: num(k.clicks),
//       clicksPrev: num(k.clicksPrev),
//       activeAffiliates: num(k.activeAffiliates),
//       newAffiliates: num(k.newAffiliates),
//     },
//     commissions: {
//       pending: money(c.pending),
//       approved: money(c.approved),
//       paid: money(c.paid),
//     },
//     stockists: {
//       total: num(s.total),
//       active: num(s.active),
//       profitPending: money(s.profitPending),
//       profitPaid: money(s.profitPaid),
//       top: list(s.top, (i) => ({
//         id: str(i.id),
//         name: str(i.name, "Unnamed stockist"),
//         affiliates: num(i.affiliates),
//         sales: money(i.sales),
//         profit: money(i.profit),
//       })),
//     },
//     salesSeries: list(root.salesSeries, (i) => ({
//       date: str(i.date),
//       orders: num(i.orders),
//       sales: money(i.sales),
//     })),
//     topProducts: list(root.topProducts, (i) => ({
//       id: str(i.id),
//       name: str(i.name, "Unnamed product"),
//       units: num(i.units),
//       sales: money(i.sales),
//     })),
//     topAffiliates: list(root.topAffiliates, (i) => ({
//       id: str(i.id),
//       name: str(i.name, "Unnamed affiliate"),
//       stockist: strOrNull(i.stockist),
//       orders: num(i.orders),
//       sales: money(i.sales),
//     })),
//     recentOrders: list(root.recentOrders, (i) => ({
//       id: str(i.id),
//       number: str(i.number),
//       customer: str(i.customer, "Guest"),
//       total: num(i.total),
//       currency: str(i.currency).toUpperCase(),
//       paymentStatus: str(i.paymentStatus),
//       orderStatus: str(i.orderStatus),
//       affiliate: strOrNull(i.affiliate),
//       stockist: strOrNull(i.stockist),
//       createdAt: str(i.createdAt),
//     })),
//     pending: {
//       withdrawals: { count: num(w.count), amount: money(w.amount) },
//       stockistRequests: num(p.stockistRequests),
//       lowStock: num(p.lowStock),
//     },
//   };
// }

// // PostgREST / Postgres codes for "this function or table does not exist
// // yet". Treated as an empty dashboard, not a crash.
// const MISSING_CODES = new Set(["PGRST202", "PGRST205", "42883", "42P01"]);

// // ── Public API ─────────────────────────────────────────────────────

// export function emptyDashboard(range: DateRange): DashboardData {
//   return normaliseDashboard(null, range);
// }

// export async function getDashboardData(
//   range: DateRange,
// ): Promise<DashboardData> {
//   const prev = previousRange(range);
//   const supabase = await createClient();

//   const { data, error } = await supabase.rpc("admin_dashboard", {
//     p_from: range.fromDate.toISOString(),
//     p_to: range.toDate.toISOString(),
//     p_prev_from: prev.fromDate.toISOString(),
//     p_prev_to: prev.toDate.toISOString(),
//   });

//   if (error) {
//     if (error.code && MISSING_CODES.has(error.code)) {
//       return emptyDashboard(range);
//     }
//     // Real failures (permissions, bad SQL) must not look like "zero
//     // sales". Let the Next.js error boundary handle it.
//     throw new Error(`Dashboard query failed: ${error.message}`);
//   }

//   return normaliseDashboard(data, range);
// }
// Server-side data layer for the admin dashboard.
// Import this only from server components or route handlers, never from
// a "use client" file.
//
// Contract-first: one Postgres function, `admin_dashboard`, does all the
// aggregation in the database and returns a single JSON document. That
// avoids pulling raw rows through PostgREST (which silently caps results
// at 1000 rows) and keeps the page to one round trip. The function is
// written in this section's backend step and must call is_admin() inside,
// because SECURITY DEFINER functions bypass Row Level Security.
//
// Money rules (they match lib/currency.ts):
//  - Revenue and sales figures are plain numbers in BASE currency (USD).
//    The UI converts them with money() at the live rate.
//  - Commissions, stockist profit and withdrawals keep their ORIGINAL
//    currency (CurrencyMap). The UI shows them with withApprox().
//
// Until that function and its tables exist, every value is an honest zero
// and the UI shows its empty states.

import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper
import { previousRange, type DateRange } from "@/lib/admin/date-range";

// Major units per ISO currency code, e.g. { IDR: 1850000, GBP: 42.5 }.
export type CurrencyMap = Record<string, number>;

export type DashboardData = {
  range: { from: string; to: string };
  kpis: {
    revenue: number; // USD
    revenuePrev: number; // USD
    orders: number;
    ordersPrev: number;
    clicks: number;
    clicksPrev: number;
    activeAffiliates: number;
    newAffiliates: number;
  };
  commissions: {
    pending: CurrencyMap;
    approved: CurrencyMap;
    paid: CurrencyMap;
  };
  stockists: {
    total: number;
    active: number;
    profitPending: CurrencyMap;
    profitPaid: CurrencyMap;
    top: TopStockist[];
  };
  salesSeries: SalesPoint[];
  topProducts: TopProduct[];
  topAffiliates: TopAffiliate[];
  recentOrders: RecentOrder[];
  pending: {
    withdrawals: { count: number; amount: CurrencyMap };
    stockistRequests: number;
    lowStock: number;
  };
};

export type SalesPoint = {
  date: string; // YYYY-MM-DD
  orders: number;
  sales: number; // USD
};

export type TopProduct = {
  id: string;
  name: string;
  units: number;
  sales: number; // USD
};

export type TopAffiliate = {
  id: string;
  name: string;
  stockist: string | null;
  orders: number;
  sales: number; // USD
};

export type TopStockist = {
  id: string;
  name: string;
  affiliates: number;
  sales: number; // USD
  profit: CurrencyMap; // original currency
};

export type RecentOrder = {
  id: string;
  number: string;
  customer: string;
  total: number; // in the order's own currency
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  affiliate: string | null;
  stockist: string | null;
  createdAt: string;
};

// ── Defensive parsing ──────────────────────────────────────────────
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

function currencyMap(v: unknown): CurrencyMap {
  const out: CurrencyMap = {};
  for (const [currency, amount] of Object.entries(rec(v))) {
    out[currency.toUpperCase()] = num(amount);
  }
  return out;
}

function normaliseDashboard(raw: unknown, range: DateRange): DashboardData {
  const root = rec(raw);
  const k = rec(root.kpis);
  const c = rec(root.commissions);
  const s = rec(root.stockists);
  const p = rec(root.pending);
  const w = rec(p.withdrawals);

  return {
    range: { from: range.from, to: range.to },
    kpis: {
      revenue: num(k.revenue),
      revenuePrev: num(k.revenuePrev),
      orders: num(k.orders),
      ordersPrev: num(k.ordersPrev),
      clicks: num(k.clicks),
      clicksPrev: num(k.clicksPrev),
      activeAffiliates: num(k.activeAffiliates),
      newAffiliates: num(k.newAffiliates),
    },
    commissions: {
      pending: currencyMap(c.pending),
      approved: currencyMap(c.approved),
      paid: currencyMap(c.paid),
    },
    stockists: {
      total: num(s.total),
      active: num(s.active),
      profitPending: currencyMap(s.profitPending),
      profitPaid: currencyMap(s.profitPaid),
      top: list(s.top, (i) => ({
        id: str(i.id),
        name: str(i.name, "Unnamed stockist"),
        affiliates: num(i.affiliates),
        sales: num(i.sales),
        profit: currencyMap(i.profit),
      })),
    },
    salesSeries: list(root.salesSeries, (i) => ({
      date: str(i.date),
      orders: num(i.orders),
      sales: num(i.sales),
    })),
    topProducts: list(root.topProducts, (i) => ({
      id: str(i.id),
      name: str(i.name, "Unnamed product"),
      units: num(i.units),
      sales: num(i.sales),
    })),
    topAffiliates: list(root.topAffiliates, (i) => ({
      id: str(i.id),
      name: str(i.name, "Unnamed affiliate"),
      stockist: strOrNull(i.stockist),
      orders: num(i.orders),
      sales: num(i.sales),
    })),
    recentOrders: list(root.recentOrders, (i) => ({
      id: str(i.id),
      number: str(i.number),
      customer: str(i.customer, "Guest"),
      total: num(i.total),
      currency: str(i.currency).toUpperCase(),
      paymentStatus: str(i.paymentStatus),
      orderStatus: str(i.orderStatus),
      affiliate: strOrNull(i.affiliate),
      stockist: strOrNull(i.stockist),
      createdAt: str(i.createdAt),
    })),
    pending: {
      withdrawals: { count: num(w.count), amount: currencyMap(w.amount) },
      stockistRequests: num(p.stockistRequests),
      lowStock: num(p.lowStock),
    },
  };
}

// PostgREST / Postgres codes for "this function or table does not exist
// yet". Treated as an empty dashboard, not a crash.
const MISSING_CODES = new Set(["PGRST202", "PGRST205", "42883", "42P01"]);

// ── Public API ─────────────────────────────────────────────────────

export function emptyDashboard(range: DateRange): DashboardData {
  return normaliseDashboard(null, range);
}

export async function getDashboardData(
  range: DateRange,
): Promise<DashboardData> {
  const prev = previousRange(range);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_dashboard", {
    p_from: range.fromDate.toISOString(),
    p_to: range.toDate.toISOString(),
    p_prev_from: prev.fromDate.toISOString(),
    p_prev_to: prev.toDate.toISOString(),
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
