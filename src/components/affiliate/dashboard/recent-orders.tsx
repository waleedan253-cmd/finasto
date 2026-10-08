// src/components/affiliate/dashboard/recent-orders.tsx
//
// The 5 latest orders with a "View all" link.
// Server component: it only renders what getMyDashboard() returns.
//
// my_orders() rows are passed through loosely typed (see dashboard-queries.ts),
// so ALL column names used here live in readOrder() below. If your columns
// are named differently, that is the only function to edit.

import Link from "next/link";
import type { RecentOrder } from "@/lib/affiliate/dashboard-queries";

// Change this if your orders page lives at a different path.
const ORDERS_HREF = "/affiliate/orders";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// UTC on purpose, to match the chart's UTC days.
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type OrderView = {
  key: string;
  reference: string;
  date: string;
  paymentStatus: string;
  status: string;
  commission: number;
};

function readOrder(row: RecentOrder, index: number): OrderView {
  const id = row.id ?? row.order_id ?? index;
  const reference = String(row.order_number ?? row.reference ?? id);

  const ordered = row.ordered_at ? new Date(String(row.ordered_at)) : null;
  const date =
    ordered && !Number.isNaN(ordered.getTime()) ? dateFmt.format(ordered) : "-";

  const commission = Number(row.commission_usd);

  return {
    key: String(id),
    reference,
    date,
    paymentStatus: String(row.payment_status ?? ""),
    status: String(row.status ?? ""),
    commission: Number.isFinite(commission) ? commission : 0,
  };
}

// One short label per order. Refunds and cancellations matter most to an
// affiliate (no commission), so they win over the plain statuses.
function statusLabel(o: OrderView): {
  text: string;
  tone: "good" | "bad" | "neutral";
} {
  if (o.paymentStatus === "refunded") return { text: "Refunded", tone: "bad" };
  if (o.status === "cancelled") return { text: "Cancelled", tone: "bad" };
  if (o.paymentStatus === "paid") return { text: "Paid", tone: "good" };
  const raw = o.status || o.paymentStatus;
  if (!raw) return { text: "-", tone: "neutral" };
  const text = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ");
  return { text, tone: "neutral" };
}

const toneClass = {
  good: "text-emerald-700 dark:text-emerald-400",
  bad: "text-red-700 dark:text-red-400",
  neutral: "text-slate-600 dark:text-slate-400",
} as const;

type Props = {
  orders: RecentOrder[];
};

export default function RecentOrders({ orders }: Props) {
  const rows = orders.map(readOrder);

  return (
    <section
      aria-labelledby="recent-orders-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="recent-orders-heading"
          className="text-base font-semibold text-slate-900 dark:text-slate-50"
        >
          Recent orders
        </h2>
        {rows.length > 0 ? (
          <Link
            href={ORDERS_HREF}
            className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            View all
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          No orders yet. Share your affiliate link and orders will show up here.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Order
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Date
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Status
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const s = statusLabel(o);
                return (
                  <tr
                    key={o.key}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
                      {o.reference}
                    </td>
                    <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                      {o.date}
                    </td>
                    <td className={`py-2 pr-4 ${toneClass[s.tone]}`}>
                      {s.text}
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-900 dark:text-slate-50">
                      {usd.format(o.commission)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
