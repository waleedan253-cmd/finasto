// Server-side reads for the affiliate Orders pages. Import only from
// server components and server actions, never from a "use client" file
// (client files may import the TYPES below, which are erased at build).
//
// Own data and privacy are enforced in the database: affiliates cannot
// read the orders table directly any more, only through my_orders() and
// my_order(), which return the customer's first name and a masked email
// and nothing else about the customer. These functions are thin wrappers
// that call them and turn the JSON into typed, camelCase objects.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Where the commission on this order stands (calculated in the database
// with the same rules as the payout flow).
export type CommissionState =
  | "refunded"
  | "cancelled"
  | "paid_out"
  | "in_request"
  | "none"
  | "unpaid"
  | "awaiting_shipment"
  | "in_window"
  | "ready";

export type MyOrderRow = {
  orderNumber: string;
  orderedAt: string;
  customerFirstName: string;
  customerEmailMasked: string | null; // e.g. "j***@gmail.com"
  itemCount: number;
  totalAmount: number; // in orderCurrency, what the customer paid
  orderCurrency: string;
  totalUsd: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  shippedAt: string | null;
  refundWindowEndsAt: string | null;
  refundedAt: string | null;
  commissionPercent: number;
  commissionUsd: number;
  commissionState: CommissionState;
  payoutRequestNumber: string | null; // set when the order is in a request
};

export type MyOrderItem = {
  productName: string;
  variantName: string;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
};

export type MyOrderDetail = MyOrderRow & { items: MyOrderItem[] };

export type MyOrdersResult = {
  rows: MyOrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

/* ------------------------------------------------------------------ */
/* Raw shapes returned by the database functions                       */
/* ------------------------------------------------------------------ */

type RawRow = {
  order_number: string;
  ordered_at: string;
  customer_first_name: string | null;
  customer_email_masked: string | null;
  item_count: number | string | null;
  total_amount: number | string | null;
  order_currency: string;
  total_usd: number | string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  paid_at: string | null;
  shipped_at: string | null;
  refund_window_ends_at: string | null;
  refunded_at: string | null;
  commission_percent: number | string | null;
  commission_usd: number | string | null;
  commission_state: CommissionState;
  payout_request_number: string | null;
};

type RawItem = {
  product_name: string;
  variant_name: string | null;
  quantity: number | string;
  unit_price_usd: number | string | null;
  line_total_usd: number | string | null;
};

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function mapRow(r: RawRow): MyOrderRow {
  return {
    orderNumber: r.order_number,
    orderedAt: r.ordered_at,
    customerFirstName: r.customer_first_name ?? "Customer",
    customerEmailMasked: r.customer_email_masked,
    itemCount: num(r.item_count),
    totalAmount: num(r.total_amount),
    orderCurrency: r.order_currency,
    totalUsd: num(r.total_usd),
    status: r.status,
    paymentStatus: r.payment_status,
    paidAt: r.paid_at,
    shippedAt: r.shipped_at,
    refundWindowEndsAt: r.refund_window_ends_at,
    refundedAt: r.refunded_at,
    commissionPercent: num(r.commission_percent),
    commissionUsd: num(r.commission_usd),
    commissionState: r.commission_state,
    payoutRequestNumber: r.payout_request_number,
  };
}

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_PAGE_SIZE = 20;

// The page already whitelists every filter value from the URL, and the
// database function validates them again, so a tampered value is rejected
// there instead of reaching a query.
export async function listMyOrders(params: {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  commissionState?: CommissionState;
  page?: number;
  pageSize?: number;
}): Promise<MyOrdersResult> {
  await requireRole("affiliate");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    100,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE),
  );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_orders", {
    p_search: params.search?.trim() || null,
    p_status: params.status ?? null,
    p_payment_status: params.paymentStatus ?? null,
    p_commission_state: params.commissionState ?? null,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (error) throw new Error(`Failed to load orders: ${error.message}`);

  const payload = (data ?? { total: 0, rows: [] }) as {
    total: number | string;
    rows: RawRow[];
  };

  return {
    rows: (payload.rows ?? []).map(mapRow),
    total: num(payload.total),
    page,
    pageSize,
  };
}

/* ------------------------------------------------------------------ */
/* One order                                                            */
/* ------------------------------------------------------------------ */

// Order numbers look like FIN-20261007-XS7Z. Anything else is rejected
// before it reaches the database.
const ORDER_NUMBER_PATTERN = /^[A-Za-z0-9-]{6,40}$/;

// Returns null when the order does not exist OR belongs to another
// affiliate (the database treats both the same).
export async function getMyOrder(
  orderNumber: string,
): Promise<MyOrderDetail | null> {
  await requireRole("affiliate");

  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_order", {
    p_order_number: orderNumber,
  });

  if (error) throw new Error(`Failed to load the order: ${error.message}`);
  if (!data) return null;

  const raw = data as RawRow & { items?: RawItem[] };

  return {
    ...mapRow(raw),
    items: (raw.items ?? []).map((i) => ({
      productName: i.product_name,
      variantName: i.variant_name ?? "",
      quantity: num(i.quantity),
      unitPriceUsd: num(i.unit_price_usd),
      lineTotalUsd: num(i.line_total_usd),
    })),
  };
}
