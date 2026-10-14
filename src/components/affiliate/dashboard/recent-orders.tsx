"use client";

// The 5 latest orders, with a "View all" link to the Orders page.
//
// Same look as the rest of the dashboard: Ant Design Card + Table and
// the theme colors. The order number and the commission show in green.
// It is a client component because the chosen currency comes from
// useMarket(). Rows come from my_orders() via getMyDashboard(), which
// already limits what is shown to first name and masked email. Field
// names match MyOrderRow in orders-queries.ts.
//
// Amounts stay USD. The currency chosen in the header menu is shown
// beside them as "approx." (same rule as withApprox).

import Link from "next/link";
import { Empty } from "antd";
import { ArrowUpRight } from "lucide-react";
import type {
  CommissionState,
  MyOrderRow,
} from "@/lib/affiliate/orders-queries";

import { withApprox, type RateMap } from "@/lib/currency";

// Fixed time zone, so the server and the browser print the same text.
const shortDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "-";

// What the affiliate sees for where each commission stands.
const COMMISSION_LABEL: Record<CommissionState, string> = {
  refunded: "Refunded",
  cancelled: "Cancelled",
  paid_out: "Paid out",
  in_request: "In payout request",
  none: "No commission",
  unpaid: "Awaiting payment",
  awaiting_shipment: "Awaiting shipment",
  in_window: "In refund window",
  ready: "Ready to request",
};

export function RecentOrders({
  orders,
  rates,
  currency,
  // Change this if your Orders page lives at a different path.
  href = "/affiliate/orders",
}: {
  orders: MyOrderRow[];
  rates: RateMap;
  currency: string;
  href?: string;
}) {
  // The currency chosen in the header menu. Amounts stay USD; the chosen
  // currency is shown beside them as "approx.".

  // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
  const amount = (n: number) => withApprox(n, "USD", currency, rates);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border-strong bg-white shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] dark:border-border dark:shadow-none">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />
      <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-5">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
          Recent orders
        </p>
        {orders.length > 0 && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 font-sans text-[12px] font-medium text-copper hover:underline"
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 pb-6">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No orders yet. When someone buys through your link, the order shows up here."
          />
        </div>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto px-4 sm:px-5">
          {orders.map((o) => {
            const a = amount(o.commissionUsd);
            return (
              <li
                key={o.orderNumber}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-[13px] font-medium text-espresso">
                    {o.orderNumber}
                  </p>
                  <p className="mt-0.5 truncate font-sans text-[12px] text-warm-gray">
                    {o.customerFirstName} · {shortDate(o.orderedAt)}
                  </p>
                </div>
                <div
                  className="shrink-0 text-right"
                  title={a.approx ?? undefined}
                >
                  <p className="font-sans text-[13px] font-semibold tabular-nums text-green">
                    {a.original}
                  </p>

                  <p className="mt-0.5 font-sans text-[11px] text-warm-gray">
                    {COMMISSION_LABEL[o.commissionState] ?? o.commissionState}
                  </p>
                  {a.approx && (
                    <p className="font-sans text-[11px] tabular-nums text-warm-gray">
                      {a.approx}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
