import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { StockistOrderList } from "@/lib/stockist/orders-queries";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/affiliate/orders/order-status-badge";

// Read-only order list for the stockist: search, status filter, table on
// desktop, cards on mobile, plain-link paging. Everything lives in the URL
// (?q=&status=&page=), so this is a server component with no client state.
// Only safe customer fields exist on the rows (first name, masked email).

const BASE = "/stockist/orders";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

// UTC on purpose, same as the other tables.
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const itemsLabel = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

function href(q: string, status: string, page?: number) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (status) p.set("status", status);
  if (page && page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `${BASE}?${qs}` : BASE;
}

export function StockistOrdersTable({
  result,
  q,
  status,
}: {
  result: StockistOrderList;
  q: string;
  status: string;
}) {
  const { items, total, page, pageSize } = result;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = Boolean(q || status);

  return (
    <div>
      {/* Search + status filter */}
      <div className="mb-4 flex flex-col gap-3">
        <form action={BASE} method="get" className="relative max-w-sm">
          {status && <input type="hidden" name="status" value={status} />}
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search order number or affiliate"
            className="w-full rounded-lg border border-border-strong bg-white py-2 pl-9 pr-3 font-sans text-[14px] text-espresso outline-none focus:border-copper"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => {
            const active = t.value === status;
            return (
              <Link
                key={t.value || "all"}
                href={href(q, t.value)}
                className={
                  "rounded-full border px-3 py-1 font-sans text-[13px] " +
                  (active
                    ? "border-espresso bg-espresso text-white"
                    : "border-border-strong bg-white text-espresso hover:border-copper")
                }
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
          <ShoppingBag
            className="h-6 w-6 text-warm-gray"
            strokeWidth={1.4}
            aria-hidden="true"
          />
          <p className="mt-3 font-sans text-[14px] text-espresso">
            No orders found
          </p>
          <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
            {filtered
              ? "Try a different search or filter."
              : "Orders from your affiliates will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-white md:block">
            <table className="w-full text-left font-sans text-[14px]">
              <thead>
                <tr className="border-b border-border text-[12px] uppercase tracking-wide text-warm-gray">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Affiliate</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr
                    key={o.orderNumber}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-espresso">
                        {o.orderNumber}
                      </p>
                      <p className="text-[12px] text-warm-gray">
                        {itemsLabel(o.itemCount)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-espresso">
                      {o.affiliateName}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-espresso">{o.customerFirstName}</p>
                      {o.customerEmailMasked && (
                        <p className="text-[12px] text-warm-gray">
                          {o.customerEmailMasked}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-espresso">
                      {formatPrice(o.totalUsd, "USD")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <OrderStatusBadge status={o.status} />
                        <PaymentStatusBadge status={o.paymentStatus} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-espresso/80">
                      {dateFmt.format(new Date(o.orderedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-3 md:hidden">
            {items.map((o) => (
              <li
                key={o.orderNumber}
                className="rounded-2xl border border-border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[15px] font-medium text-espresso">
                      {o.orderNumber}
                    </p>
                    <p className="mt-0.5 font-sans text-[12px] text-warm-gray">
                      {itemsLabel(o.itemCount)} ·{" "}
                      {dateFmt.format(new Date(o.orderedAt))}
                    </p>
                  </div>
                  <span className="shrink-0 font-sans text-[14px] font-medium tabular-nums text-espresso">
                    {formatPrice(o.totalUsd, "USD")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OrderStatusBadge status={o.status} />
                  <PaymentStatusBadge status={o.paymentStatus} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-y-1.5 font-sans text-[13px]">
                  <dt className="text-warm-gray">Affiliate</dt>
                  <dd className="truncate text-right text-espresso">
                    {o.affiliateName}
                  </dd>
                  <dt className="text-warm-gray">Customer</dt>
                  <dd className="min-w-0 text-right text-espresso">
                    <span className="block truncate">
                      {o.customerFirstName}
                    </span>
                    {o.customerEmailMasked && (
                      <span className="block truncate text-[12px] text-warm-gray">
                        {o.customerEmailMasked}
                      </span>
                    )}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>

          {/* Paging */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between font-sans text-[13px] text-warm-gray">
              {page > 1 ? (
                <Link
                  href={href(q, status, page - 1)}
                  className="text-espresso hover:text-copper"
                >
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span>
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={href(q, status, page + 1)}
                  className="text-espresso hover:text-copper"
                >
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
