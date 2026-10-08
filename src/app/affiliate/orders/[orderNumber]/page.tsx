import { notFound } from "next/navigation";
import { getMyOrder } from "@/lib/affiliate/orders-queries";
import { OrderDetailPanel } from "@/components/affiliate/orders/order-detail-panel";
import { createClient } from "@/lib/supabase/server";
import type { RateMap } from "@/lib/currency";

// /affiliate/orders/<order number>   e.g. /affiliate/orders/FIN-20261007-XS7Z
//
// The URL carries the customer-facing order number, never an internal id.
// getMyOrder() returns null both when the order does not exist and when it
// belongs to another affiliate, so both look the same (a 404) and order
// numbers cannot be probed.

export default async function AffiliateOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await getMyOrder(decodeURIComponent(orderNumber));
  if (!order) notFound();

  // Exchange rates for the "approx." amounts (display only).
  const supabase = await createClient();
  const { data: rateRows } = await supabase
    .from("currency_rates")
    .select("currency_code, rate_to_base, updated_at");
  const rates: RateMap = {};
  for (const r of rateRows ?? []) {
    rates[String(r.currency_code).toUpperCase()] = {
      rateToBase: Number(r.rate_to_base),
      updatedAt: r.updated_at as string,
    };
  }

  return <OrderDetailPanel order={order} rates={rates} />;
}
