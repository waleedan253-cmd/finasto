// Server-side reads for the admin Orders section. Import only from
// server components, route handlers and server actions.
//
// This is a pure read + status-management layer, exactly as we agreed —
// it never recalculates money. Every money figure here is whatever was
// snapshotted onto the order at checkout time (checkout-actions.ts),
// never re-derived from current affiliate/stockist rates.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderListItem = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  totalOriginal: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  affiliateName: string | null;
  stockistName: string | null;
  itemCount: number;
  createdAt: string;
};

export type OrderListResult = {
  items: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type OrderItemDetail = {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
};

export type OrderDetail = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  totalUsd: number;
  totalOriginal: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItemDetail[];
  // Snapshotted at checkout — never re-derived from current rates.
  affiliateId: string | null;
  affiliateName: string | null;
  affiliateCommissionPercent: number | null;
  stockistId: string | null;
  stockistName: string | null;
  stockistProfitPercent: number | null;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_PAGE_SIZE = 20;

export async function listOrders(params: {
  search?: string;
  orderStatus?: OrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<OrderListResult> {
  await requireRole("admin");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      `
      id, order_number, customer_name, customer_email, order_currency, total_amount,
      status, payment_status, created_at,
      order_items ( id ),
      affiliate:profiles!orders_affiliate_id_fkey ( name ),
      stockist:profiles!orders_stockist_id_fkey ( name )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const search = params.search?.trim();
  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`,
    );
  }
  if (params.orderStatus && params.orderStatus !== "all") {
    query = query.eq("status", params.orderStatus);
  }
  if (params.paymentStatus && params.paymentStatus !== "all") {
    query = query.eq("payment_status", params.paymentStatus);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isMissingTable(error)) {
      return { items: [], total: 0, page, pageSize };
    }
    throw new Error(`Failed to load orders: ${error.message}`);
  }

  const items: OrderListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    trackingCode: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    currency: row.order_currency,
    totalOriginal: num(row.total_amount),
    orderStatus: row.status,
    paymentStatus: row.payment_status,
    affiliateName: (row.affiliate as { name?: string } | null)?.name ?? null,
    stockistName: (row.stockist as { name?: string } | null)?.name ?? null,
    itemCount: Array.isArray(row.order_items) ? row.order_items.length : 0,
    createdAt: row.created_at,
  }));

  return { items, total: count ?? 0, page, pageSize };
}

/* ------------------------------------------------------------------ */
/* Single order                                                         */
/* ------------------------------------------------------------------ */

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, customer_name, customer_email, order_currency,
      total_base, total_amount, status, payment_status,
      affiliate_id, affiliate_commission_percent,
      stockist_id, stockist_profit_percent,
      created_at, updated_at,
      order_items ( id, product_name, variant_name, quantity, unit_price, line_total ),
      affiliate:profiles!orders_affiliate_id_fkey ( name ),
      stockist:profiles!orders_stockist_id_fkey ( name )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return null;
    throw new Error(`Failed to load order: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    trackingCode: data.order_number,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    currency: data.order_currency,
    totalUsd: num(data.total_base),
    totalOriginal: num(data.total_amount),
    orderStatus: data.status,
    paymentStatus: data.payment_status,
    items: (data.order_items ?? []).map((i) => ({
      id: i.id,
      productName: i.product_name,
      variantName: i.variant_name,
      quantity: i.quantity,
      unitPriceUsd: num(i.unit_price),
      totalUsd: num(i.line_total),
    })),
    affiliateId: data.affiliate_id,
    affiliateName: (data.affiliate as { name?: string } | null)?.name ?? null,
    affiliateCommissionPercent:
      data.affiliate_commission_percent != null
        ? num(data.affiliate_commission_percent)
        : null,
    stockistId: data.stockist_id,
    stockistName: (data.stockist as { name?: string } | null)?.name ?? null,
    stockistProfitPercent:
      data.stockist_profit_percent != null
        ? num(data.stockist_profit_percent)
        : null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
