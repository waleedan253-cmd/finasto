"use client";

import Link from "next/link";
import { Divider, Image as AntImage } from "antd";
import { Boxes, ExternalLink, FileText, Mail, Store } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import type {
  BulkOrderDetail,
  BulkOrderStatus,
} from "@/lib/admin/bulk-order-queries";
import {
  BulkOrderStatusBadge,
  bulkOrderNeedsAction,
} from "@/components/admin/bulk-orders/bulk-order-status-badge";
import { BulkOrderActions } from "@/components/admin/bulk-orders/bulk-order-actions";

// Full view of one bulk order. Every price and the discount shown here
// were saved on the order when the stockist submitted it, so later price
// or rate changes never alter what is displayed.

const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const fmt = (iso: string | null) =>
  iso ? dateTimeFmt.format(new Date(iso)) : null;

// One plain sentence telling the admin what this status means for them.
function nextStepHint(status: BulkOrderStatus, name: string): string {
  switch (status) {
    case "requested":
      return "New request. Check the packs, then send the bank details or reject it.";
    case "awaiting_payment":
      return `Waiting for ${name} to pay and upload proof. Shop stock stays reserved until you approve or cancel.`;
    case "payment_submitted":
      return "Proof uploaded. Check it against your bank account, then approve the payment or return it.";
    case "approved":
      return `Completed. The packs are now in ${name}'s stock.`;
    case "rejected":
      return "Rejected. The stockist can see your note.";
    case "cancelled":
      return "Cancelled. Any reserved shop stock was put back.";
  }
}

export function BulkOrderDetailPanel({ order }: { order: BulkOrderDetail }) {
  const needsAction = bulkOrderNeedsAction(order.status);
  const showPayment =
    !!order.bankDetails || !!order.proofUrl || !!order.proofSubmittedAt;
  const timeline = [
    { label: "Requested", value: fmt(order.createdAt) },
    { label: "Bank details sent", value: fmt(order.quotedAt) },
    { label: "Proof submitted", value: fmt(order.proofSubmittedAt) },
    { label: "Closed", value: fmt(order.decidedAt) },
  ].filter((t) => t.value);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[12px] uppercase tracking-[0.12em] text-warm-gray">
              Bulk order
            </p>
            <h1 className="mt-1 font-display text-[30px] leading-tight tabular-nums text-espresso">
              {order.numberLabel}
            </h1>
          </div>
          <BulkOrderStatusBadge status={order.status} />
        </div>

        <div
          className={
            needsAction
              ? "mt-5 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper"
              : "mt-5 rounded-xl bg-cream-soft px-4 py-3 font-sans text-[13px] leading-relaxed text-warm-gray"
          }
        >
          {nextStepHint(order.status, order.stockistName)}
        </div>

        <div className="mt-5">
          <BulkOrderActions order={order} />
        </div>

        <Divider className="!my-6 !border-border" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 font-sans text-[13px] font-medium text-warm-gray">
              <Store className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              Stockist
            </h3>
            <Link
              href={`/admin/stockists/${order.stockistId}`}
              className="mt-2 block font-sans text-[14px] text-espresso hover:text-copper"
            >
              {order.stockistName}
            </Link>
            {order.stockistEmail && (
              <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[13px] text-warm-gray">
                <Mail
                  className="h-3.5 w-3.5"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                {order.stockistEmail}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-sans text-[13px] font-medium text-warm-gray">
              Stockist rate
            </h3>
            <p className="mt-2 font-sans text-[14px] text-espresso">
              {order.discountPercent}% off regular price
            </p>
            <p className="mt-0.5 font-sans text-[12px] text-warm-gray">
              Saved on this order. Later rate changes do not affect it.
            </p>
          </div>
        </div>

        {order.stockReserved && (
          <p className="mt-5 flex items-center gap-2 font-sans text-[12px] text-warm-gray">
            <Boxes
              className="h-4 w-4 text-copper"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            Shop stock is currently reserved for this order.
          </p>
        )}
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <h2 className="font-display text-[20px] leading-tight text-espresso">
          Packs
        </h2>

        <ul className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-sans text-[14px] text-espresso">
                  {item.productName}
                </p>
                <p className="font-sans text-[12px] text-warm-gray">
                  {item.packName} · {item.quantity} ×{" "}
                  {formatMoney(item.unitPriceUsd, "USD")}
                </p>
                {item.retailUsd !== item.unitPriceUsd && (
                  <p className="font-sans text-[11px] text-warm-gray line-through">
                    Regular {formatMoney(item.retailUsd, "USD")}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-sans text-[13px] tabular-nums text-espresso">
                {formatMoney(item.lineTotalUsd, "USD")}
              </span>
            </li>
          ))}
        </ul>

        <Divider className="!my-4 !border-border" />

        <dl className="flex flex-col gap-2 font-sans text-[13px]">
          <div className="flex items-center justify-between">
            <dt className="text-warm-gray">At regular prices</dt>
            <dd className="tabular-nums text-espresso/80">
              {formatMoney(order.retailTotalUsd, "USD")}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-warm-gray">
              Stockist discount ({order.discountPercent}%)
            </dt>
            <dd className="tabular-nums text-green">
              −{formatMoney(order.savingsUsd, "USD")}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <dt className="text-[14px] text-espresso">Total payable</dt>
            <dd className="text-[18px] font-semibold tabular-nums text-espresso">
              {formatMoney(order.totalUsd, "USD")}
            </dd>
          </div>
        </dl>
        <p className="mt-3 font-sans text-[11px] text-warm-gray">
          All amounts in USD.
        </p>
      </div>

      {/* Payment */}
      {showPayment && (
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
          <h2 className="font-display text-[20px] leading-tight text-espresso">
            Payment
          </h2>

          {order.bankDetails && (
            <div className="mt-4">
              <h3 className="font-sans text-[13px] font-medium text-warm-gray">
                Bank details sent to the stockist
              </h3>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-cream-soft px-4 py-3 font-sans text-[13px] leading-relaxed text-espresso">
                {order.bankDetails}
              </pre>
            </div>
          )}

          {order.paymentReference && (
            <p className="mt-4 font-sans text-[13px] text-warm-gray">
              Payment reference:{" "}
              <span className="text-espresso">{order.paymentReference}</span>
            </p>
          )}

          <div className="mt-4">
            <h3 className="font-sans text-[13px] font-medium text-warm-gray">
              Proof of payment
            </h3>
            {order.proofUrl ? (
              order.proofIsPdf ? (
                <a
                  href={order.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 font-sans text-[13px] text-espresso transition-colors hover:border-copper"
                >
                  <FileText
                    className="h-4 w-4"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  Open proof (PDF)
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </a>
              ) : (
                <div className="mt-2 w-fit overflow-hidden rounded-xl border border-border">
                  <AntImage
                    src={order.proofUrl}
                    alt={`Proof of payment for ${order.numberLabel}`}
                    width={240}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )
            ) : order.proofSubmittedAt ? (
              <p className="mt-2 font-sans text-[13px] text-copper">
                A proof was uploaded but its link could not be created. Refresh
                the page to try again.
              </p>
            ) : (
              <p className="mt-2 font-sans text-[13px] text-warm-gray">
                No proof uploaded yet.
              </p>
            )}
            {order.proofUrl && (
              <p className="mt-2 font-sans text-[11px] text-warm-gray">
                The file is private. This link expires after 5 minutes, so
                refresh the page for a new one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Messages and timeline */}
      {(order.stockistNote || order.adminNote || timeline.length > 0) && (
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
          <h2 className="font-display text-[20px] leading-tight text-espresso">
            Notes & history
          </h2>

          {order.stockistNote && (
            <div className="mt-4">
              <h3 className="font-sans text-[13px] font-medium text-warm-gray">
                From the stockist
              </h3>
              <p className="mt-1 whitespace-pre-wrap font-sans text-[14px] text-espresso">
                {order.stockistNote}
              </p>
            </div>
          )}

          {order.adminNote && (
            <div className="mt-4">
              <h3 className="font-sans text-[13px] font-medium text-warm-gray">
                Your latest message to the stockist
              </h3>
              <p className="mt-1 whitespace-pre-wrap font-sans text-[14px] text-espresso">
                {order.adminNote}
              </p>
            </div>
          )}

          <ul className="mt-5 flex flex-col gap-1.5 border-t border-border pt-4 font-sans text-[12px] text-warm-gray">
            {timeline.map((t) => (
              <li
                key={t.label}
                className="flex items-center justify-between gap-3"
              >
                <span>{t.label}</span>
                <span className="tabular-nums">{t.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
