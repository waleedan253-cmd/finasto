// The two list cards under the stat cards on the stockist Dashboard:
// "Low stock" (packs that need a new bulk order) and "Recent orders" (the
// latest 5). Plain server components in the same card style as the rest of
// the dashboard. Read-only; every row comes from getMyStockistDashboard(),
// so customers appear as first name only, with no commission.

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { StockistDashboard } from "@/lib/stockist/dashboard-queries";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/affiliate/orders/order-status-badge";

// UTC on purpose, same as the other tables.
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const CARD =
  "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-white p-4 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] dark:border-border dark:shadow-none sm:p-5";

function CardHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
        {title}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-sans text-[12px] text-espresso hover:text-copper"
      >
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Low stock                                                            */
/* ------------------------------------------------------------------ */

export function LowStockCard({
  items,
}: {
  items: StockistDashboard["lowStock"];
}) {
  return (
    <div className={CARD}>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />
      <CardHeader
        title="Low stock"
        href="/stockist/inventory"
        linkLabel="Inventory"
      />

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <CheckCircle2
            className="h-6 w-6 text-green"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="mt-2 font-sans text-[14px] text-espresso">
            All packs are well stocked
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-border">
            {items.map((i) => (
              <li
                key={`${i.productName}-${i.packName}`}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-[14px] text-espresso">
                    {i.productName}
                  </p>
                  <p className="font-sans text-[12px] text-warm-gray">
                    {i.packName}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 font-sans text-[12px] font-medium tabular-nums",
                    i.remaining === 0
                      ? "bg-espresso/5 text-warm-gray"
                      : "bg-copper/10 text-copper",
                  )}
                >
                  {i.remaining === 0 ? "Out of stock" : `${i.remaining} left`}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/stockist/bulk-orders/new"
            className="mt-auto pt-4 font-sans text-[13px] text-espresso underline hover:text-copper"
          >
            Request more packs
          </Link>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recent orders                                                        */
/* ------------------------------------------------------------------ */

export function RecentOrdersCard({
  orders,
}: {
  orders: StockistDashboard["recentOrders"];
}) {
  return (
    <div className={CARD}>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />
      <CardHeader
        title="Recent orders"
        href="/stockist/orders"
        linkLabel="View all"
      />

      {orders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8 text-center">
          <p className="font-sans text-[14px] text-warm-gray">
            No orders yet. Orders from your affiliates will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {orders.map((o) => (
            <li
              key={o.orderNumber}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate font-sans text-[14px] font-medium text-espresso">
                  {o.orderNumber}
                </p>
                <p className="truncate font-sans text-[12px] text-warm-gray">
                  {o.affiliateName} · {dateFmt.format(new Date(o.orderedAt))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={o.status} />
                <PaymentStatusBadge status={o.paymentStatus} />
                <span className="font-sans text-[13px] font-medium tabular-nums text-espresso">
                  {formatPrice(o.totalUsd, "USD")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
