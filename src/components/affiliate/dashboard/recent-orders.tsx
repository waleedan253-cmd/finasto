"use client";

// The 5 latest orders, with a "View all" link to the Orders page.
//
// Same look as the rest of the dashboard: plain Tailwind with the aff-*
// theme colors. Status badges use gold for "in progress" and the two
// status colors for success and error.
// It is a client component because the chosen currency comes from
// useMarket(). Rows come from my_orders() via getMyDashboard(), which
// already limits what is shown to first name and masked email. Field
// names match MyOrderRow in orders-queries.ts.
//
// Amounts stay USD. The currency chosen in the header menu is shown
// beside them as "approx." (same rule as withApprox).

import Link from "next/link";
import { Empty } from "antd";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
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

// Badge colours for each state. Full class names, so Tailwind can see them.
const TONES = {
  green: "border-[#2F9E6B]/30 bg-[#2F9E6B]/10 text-[#1F6F4A]",
  gold: "border-aff-gold-500/40 bg-aff-gold-300/20 text-aff-green-900",
  red: "border-[#C8553D]/30 bg-[#C8553D]/10 text-[#C8553D]",
  gray: "border-aff-border bg-aff-ivory text-aff-muted",
} as const;

const STATE_TONE: Record<CommissionState, keyof typeof TONES> = {
  paid_out: "green",
  ready: "green",
  in_request: "gold",
  in_window: "gold",
  awaiting_shipment: "gold",
  refunded: "red",
  cancelled: "red",
  none: "gray",
  unpaid: "gray",
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


  // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
  const amount = (n: number) => withApprox(n, "USD", currency, rates);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-aff-border bg-gradient-to-b from-aff-ivory to-white">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-600 opacity-70"
      />
      <div className="flex items-center justify-between gap-3 border-b border-aff-border px-4 pb-3 pt-5 sm:px-5">
        <p className="flex items-center gap-2 font-sans text-[13px] font-semibold text-aff-green-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-aff-green-900 text-aff-gold-300">
            <ShoppingBag
              className="h-3.5 w-3.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
          Recent orders
        </p>
        {orders.length > 0 && (
          <Link
            href={href}
            className="group inline-flex min-h-[40px] touch-manipulation items-center gap-1 rounded-full border border-aff-gold-500/40 px-4 py-2 font-sans text-[12px] font-medium text-aff-green-900 transition-colors hover:bg-aff-gold-300/20 active:bg-aff-gold-300/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aff-gold-600"
          >
            View all
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-active:-translate-y-0.5 group-active:translate-x-0.5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
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
        <ul className="min-h-0 flex-1 divide-y divide-aff-border overflow-y-auto px-6 py-1 sm:px-7">
          {orders.map((o) => {
            const a = amount(o.commissionUsd);
            return (
              <li
                key={o.orderNumber}
                className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors duration-200 [@media(hover:hover)]:hover:bg-aff-ivory"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aff-green-900 font-sans text-[13px] font-semibold text-aff-gold-300 ring-1 ring-aff-gold-500/40"
                  >
                    {(o.customerFirstName?.[0] ?? "?").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[13px] font-semibold text-aff-green-900">
                      {o.orderNumber}
                    </p>
                    <p className="mt-0.5 truncate font-sans text-[12px] text-aff-muted">
                      {o.customerFirstName} · {shortDate(o.orderedAt)}
                    </p>
                  </div>
                </div>
                <div
                  className="shrink-0 text-right"
                  title={a.approx ?? undefined}
                >
                  <p className="font-sans text-[14px] font-semibold text-aff-green-900 [font-variant-numeric:tabular-nums]">
                    {a.original}
                  </p>
                  {a.approx && (
                    <p className="ffont-sans text-[12px] text-aff-muted [font-variant-numeric:tabular-nums]">
                      {a.approx}
                    </p>
                  )}
                  <span
                    className={`mt-1 inline-block rounded-full border px-2 py-0.5 font-sans text-[10.5px] font-medium ${
                      TONES[STATE_TONE[o.commissionState] ?? "gray"]
                    }`}
                  >
                    {COMMISSION_LABEL[o.commissionState] ?? o.commissionState}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
