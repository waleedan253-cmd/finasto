// Server-side read for the stockist Orders page (read-only). Import only from
// server components. A stockist has no direct access to the orders tables:
// everything comes through my_stockist_orders(), which returns only the
// signed-in stockist's own orders, with the customer's first name and a masked
// email (no phone, address or commission).

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export type StockistOrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type StockistPaymentStatus = "pending" | "paid" | "failed" | "refunded";

// All amounts are USD.
export type StockistOrderRow = {
  orderNumber: string;
  orderedAt: string;
  affiliateName: string;
  customerFirstName: string;
  customerEmailMasked: string;
  itemCount: number;
  totalUsd: number;
  status: StockistOrderStatus;
  paymentStatus: StockistPaymentStatus;
};

export type StockistOrderList = {
  items: StockistOrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

type RawRow = {
  order_number: string | number;
  ordered_at: string;
  affiliate_name: string | null;
  customer_first_name: string | null;
  customer_email_masked: string | null;
  item_count: number | string;
  total_usd: number | string;
  status: StockistOrderStatus;
  payment_status: StockistPaymentStatus;
};

const DEFAULT_PAGE_SIZE = 20;

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const num = (v: number | string | null | undefined) => Number(v ?? 0);

export async function listMyStockistOrders(
  params: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<StockistOrderList> {
  await requireRole("stockist");

  const page = Math.max(1, Math.floor(params.page ?? 1) || 1);
  const pageSize = Math.min(
    100,
    Math.max(
      1,
      Math.floor(params.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE,
    ),
  );

  // Ignore anything that is not a known filter value (the URL is user input).
  const status =
    params.status && STATUSES.includes(params.status) ? params.status : null;
  const paymentStatus =
    params.paymentStatus && PAYMENT_STATUSES.includes(params.paymentStatus)
      ? params.paymentStatus
      : null;
  const search = params.search?.trim().slice(0, 80) || null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_stockist_orders", {
    p_search: search,
    p_status: status,
    p_payment_status: paymentStatus,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (error) {
    throw new Error(`Failed to load your orders: ${error.message}`);
  }

  const result = (data ?? { total: 0, rows: [] }) as {
    total: number | string;
    rows: RawRow[] | null;
  };

  return {
    items: (result.rows ?? []).map((r) => ({
      orderNumber: String(r.order_number),
      orderedAt: r.ordered_at,
      affiliateName: r.affiliate_name ?? "Affiliate",
      customerFirstName: r.customer_first_name ?? "",
      customerEmailMasked: r.customer_email_masked ?? "",
      itemCount: num(r.item_count),
      totalUsd: num(r.total_usd),
      status: r.status,
      paymentStatus: r.payment_status,
    })),
    total: num(result.total),
    page,
    pageSize,
  };
}
