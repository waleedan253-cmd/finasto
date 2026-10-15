import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, ScrollText } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { BulkOrderListResult } from "@/lib/stockist/bulk-orders-queries";
import { BulkOrderStatusBadge } from "@/components/stockist/bulk-orders/bulk-order-status-badge";

// The stockist's list of bulk orders, newest first. A server component:
// the data comes from the page (listMyBulkOrders) and paging is plain
// links (?page=2), so there is no client state to keep in sync.

// UTC on purpose, same as the rest of the app, so every viewer sees the
// same date.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const BASE = "/stockist/bulk-orders";

export function BulkOrdersTable({ result }: { result: BulkOrderListResult }) {
  const { items, total, page, pageSize } = result;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[14px] text-warm-gray">
          {total === 0
            ? "No orders yet"
            : `${total} ${total === 1 ? "order" : "orders"}`}
        </p>
        <Link
          href={`${BASE}/new`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New request
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-border px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <ScrollText
              className="h-5 w-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            Make your first bulk order
          </h2>
          <p className="mt-2 max-w-sm font-sans text-[14px] leading-relaxed text-warm-gray">
            Choose the packs you want at your discounted price. Finasto reviews
            your request and sends the payment details.
          </p>
          <Link
            href={`${BASE}/new`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper"
          >
            New request
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {items.map((order) => {
            const showNote =
              order.adminNote &&
              (order.status === "awaiting_payment" ||
                order.status === "rejected" ||
                order.status === "cancelled");

            return (
              <li
                key={order.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4"
              >
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-sans text-[14px] font-medium text-espresso">
                    {order.displayNumber}
                  </p>
                  <p className="font-sans text-[12px] text-warm-gray">
                    {dateFormat.format(new Date(order.createdAt))}
                    {" · "}
                    {order.units} {order.units === 1 ? "pack" : "packs"}
                    {order.itemCount > 1 && ` · ${order.itemCount} products`}
                  </p>
                  {showNote && (
                    <p className="mt-1 line-clamp-2 font-sans text-[12px] leading-relaxed text-copper">
                      {order.adminNote}
                    </p>
                  )}
                </div>

                <BulkOrderStatusBadge status={order.status} />

                <p className="basis-24 text-right font-sans text-[15px] font-medium text-espresso">
                  {formatPrice(order.totalUsd, "USD")}
                </p>

                <Link
                  href={`${BASE}/${order.id}`}
                  className={
                    order.status === "awaiting_payment"
                      ? "inline-flex h-10 items-center justify-center rounded-full bg-espresso px-4 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
                      : "inline-flex h-10 items-center justify-center rounded-full border border-border-strong px-4 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper"
                  }
                >
                  {order.status === "awaiting_payment" ? "Pay now" : "View"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pages"
          className="mt-4 flex items-center justify-between"
        >
          {page > 1 ? (
            <Link
              href={`${BASE}?page=${page - 1}`}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border-strong px-4 font-sans text-[14px] text-espresso transition-colors hover:border-copper"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="font-sans text-[13px] text-warm-gray">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`${BASE}?page=${page + 1}`}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border-strong px-4 font-sans text-[14px] text-espresso transition-colors hover:border-copper"
            >
              Older
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
