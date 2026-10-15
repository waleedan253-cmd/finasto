import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getMyBulkOrder } from "@/lib/stockist/bulk-orders-queries";
import {
  BULK_STATUS_HINT,
  BulkOrderStatusBadge,
} from "@/components/stockist/bulk-orders/bulk-order-status-badge";
import { PaymentProofForm } from "@/components/stockist/bulk-orders/payment-proof-form";
import { CancelOrderButton } from "@/components/stockist/bulk-orders/cancel-order-button";

// One bulk order: what was asked for, what it costs, what to do next.
// A server component. getMyBulkOrder() calls requireRole("stockist") itself
// and returns nothing for an order that is not the signed-in stockist's, so
// someone else's order id shows a normal "not found" page.

export const metadata: Metadata = {
  title: "Bulk order",
};

// UTC on purpose, same as the rest of the app. The label says so.
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});
const stamp = (iso: string) => `${dateTimeFormat.format(new Date(iso))} UTC`;

export default async function StockistBulkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getMyBulkOrder(id);
  if (!order) notFound();

  const unitsTotal = order.items.reduce((sum, i) => sum + i.quantity, 0);

  // Dates the stockist cares about, in the order they happened.
  const timeline: { label: string; at: string }[] = [
    { label: "Requested", at: order.createdAt },
  ];
  if (order.quotedAt) {
    timeline.push({ label: "Payment details sent", at: order.quotedAt });
  }
  if (order.proofSubmittedAt) {
    timeline.push({
      label: "Proof of payment sent",
      at: order.proofSubmittedAt,
    });
  }
  if (order.decidedAt) {
    const label =
      order.status === "approved"
        ? "Approved"
        : order.status === "rejected"
          ? "Rejected"
          : "Cancelled";
    timeline.push({ label, at: order.decidedAt });
  }

  const showAdminNote =
    !!order.adminNote &&
    (order.status === "awaiting_payment" ||
      order.status === "rejected" ||
      order.status === "cancelled" ||
      order.status === "approved");

  return (
    <div className="max-w-3xl">
      <Link
        href="/stockist/bulk-orders"
        className="mb-3 inline-flex items-center gap-1 font-sans text-[13px] text-warm-gray transition-colors hover:text-copper"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Bulk orders
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          {order.displayNumber}
        </h1>
        <BulkOrderStatusBadge status={order.status} />
      </div>
      <p className="mt-2 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        {BULK_STATUS_HINT[order.status]}
      </p>

      {showAdminNote && (
        <div className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper">
          <span className="font-medium">Note from Finasto: </span>
          {order.adminNote}
        </div>
      )}

      {/* Payment: the one thing to do while the order is awaiting payment */}
      {order.status === "awaiting_payment" && (
        <section className="mt-6 rounded-2xl border border-border-strong p-5 sm:p-6">
          <h2 className="font-display text-[22px] leading-tight text-espresso">
            Pay {formatPrice(order.totalUsd, "USD")}
          </h2>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
            Send the payment using these details, then upload your proof of
            payment below.
          </p>

          <div className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-cream-soft px-4 py-3 font-sans text-[14px] leading-relaxed text-espresso">
            {order.bankDetails}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <PaymentProofForm orderId={order.id} />
          </div>
        </section>
      )}

      {/* Proof already sent (or the order is done): show what was sent */}
      {(order.status === "payment_submitted" ||
        order.status === "approved") && (
        <section className="mt-6 rounded-2xl border border-border p-5 sm:p-6">
          <h2 className="font-display text-[20px] leading-tight text-espresso">
            Payment
          </h2>
          <dl className="mt-3 grid gap-x-6 gap-y-3 font-sans text-[14px] sm:grid-cols-2">
            <div>
              <dt className="text-[12px] text-warm-gray">Amount</dt>
              <dd className="text-espresso">
                {formatPrice(order.totalUsd, "USD")}
              </dd>
            </div>
            {order.paymentReference && (
              <div>
                <dt className="text-[12px] text-warm-gray">Reference</dt>
                <dd className="break-words text-espresso">
                  {order.paymentReference}
                </dd>
              </div>
            )}
            {order.proofUrl && (
              <div>
                <dt className="text-[12px] text-warm-gray">Proof</dt>
                <dd>
                  <a
                    href={order.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-copper underline underline-offset-2"
                  >
                    View uploaded file
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Items */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border">
        <h2 className="px-4 py-3 font-display text-[20px] leading-tight text-espresso">
          Items
        </h2>
        <ul className="divide-y divide-border border-t border-border">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-sans text-[14px] font-medium text-espresso">
                  {item.productName}
                </p>
                <p className="font-sans text-[12px] text-warm-gray">
                  {item.packName} · {item.quantity} ×{" "}
                  {formatPrice(item.unitPriceUsd, "USD")}
                </p>
              </div>
              <p className="font-sans text-[14px] text-espresso">
                {formatPrice(item.lineTotalUsd, "USD")}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4 border-t border-border bg-cream-soft px-4 py-3">
          <div>
            <p className="font-sans text-[12px] text-warm-gray">
              {unitsTotal} {unitsTotal === 1 ? "pack" : "packs"} · your{" "}
              {order.discountPercent}% discount applied
            </p>
            <p className="font-sans text-[13px] text-espresso">Total</p>
          </div>
          <p className="font-display text-[24px] leading-tight text-espresso">
            {formatPrice(order.totalUsd, "USD")}
          </p>
        </div>
      </section>

      {order.stockistNote && (
        <section className="mt-6 rounded-2xl border border-border p-5">
          <h2 className="font-sans text-[12px] text-warm-gray">Your note</h2>
          <p className="mt-1 whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed text-espresso">
            {order.stockistNote}
          </p>
        </section>
      )}

      {/* Dates */}
      <section className="mt-6">
        <h2 className="font-sans text-[12px] text-warm-gray">History</h2>
        <ul className="mt-2 flex flex-col gap-1 font-sans text-[13px] text-espresso">
          {timeline.map((t) => (
            <li
              key={t.label}
              className="flex flex-wrap justify-between gap-x-4"
            >
              <span>{t.label}</span>
              <span className="text-warm-gray">{stamp(t.at)}</span>
            </li>
          ))}
        </ul>
      </section>

      {order.status === "requested" && (
        <div className="mt-6">
          <CancelOrderButton
            orderId={order.id}
            displayNumber={order.displayNumber}
          />
        </div>
      )}
    </div>
  );
}
