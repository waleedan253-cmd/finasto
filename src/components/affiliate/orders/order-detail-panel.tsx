"use client";

import Link from "next/link";
import { ArrowLeft, Check, Circle, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { MyOrderDetail } from "@/lib/affiliate/orders-queries";
import {
  CommissionStateBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./order-status-badge";
import { Breadcrumb } from "antd";

import { withApprox, type RateMap } from "@/lib/currency";

// Detail view for ONE of the affiliate's orders: the items, the customer
// (first name and masked email only), the commission and where it stands,
// and a timeline of the order. Server component: no state needed.
//
// Item prices are in USD (the currency they are stored in). The order
// total is shown in the customer's currency and in USD.

// UTC on purpose: server and browser print the same text, and the time
// zone is stated so nobody has to guess it.
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const fmtDateTime = (iso: string) => `${dateTimeFmt.format(new Date(iso))} UTC`;

// One plain-language sentence about the commission on this order.
function commissionNote(order: MyOrderDetail): string {
  switch (order.commissionState) {
    case "unpaid":
      return "The customer's payment has not been confirmed yet.";
    case "awaiting_shipment":
      return "Payment is confirmed. The refund window starts when the order ships.";
    case "in_window":
      return order.refundWindowEndsAt
        ? `Your commission becomes available after the refund window ends on ${fmtDateTime(order.refundWindowEndsAt)}.`
        : "Your commission becomes available once the refund window ends.";
    case "ready":
      return "This order is ready. You can add it to a payout request.";
    case "in_request":
      return "This order is part of a payout request that is being reviewed.";
    case "paid_out":
      return "Your commission for this order has been paid.";
    case "refunded":
      return "This order was refunded, so no commission is paid on it.";
    case "cancelled":
      return "This order was cancelled, so no commission is paid on it.";
    case "none":
      return "No commission applies to this order.";
  }
}

type Step = { label: string; at: string | null; done: boolean };

function buildTimeline(order: MyOrderDetail): Step[] {
  const windowOver =
    !!order.refundWindowEndsAt &&
    new Date(order.refundWindowEndsAt).getTime() <= Date.now();

  const steps: Step[] = [
    { label: "Order placed", at: order.orderedAt, done: true },
    {
      label: "Payment confirmed",
      at: order.paidAt,
      done: order.paidAt !== null,
    },
    { label: "Shipped", at: order.shippedAt, done: order.shippedAt !== null },
    {
      label: windowOver ? "Refund window ended" : "Refund window ends",
      at: order.refundWindowEndsAt,
      done: windowOver,
    },
  ];

  if (order.refundedAt) {
    steps.push({ label: "Refunded", at: order.refundedAt, done: true });
  }
  return steps;
}

export function OrderDetailPanel({
  order,
  rates,
  currency,
}: {
  order: MyOrderDetail;
  rates: RateMap;
  currency: string;
}) {
  // The currency chosen in the header menu. Amounts keep their own
  // currency; the chosen one is shown as a small "approx." line.
  const approxUsd = (n: number) => withApprox(n, "USD", currency, rates).approx;
  const approxPaid = withApprox(
    order.totalAmount,
    order.orderCurrency,
    currency,
    rates,
  ).approx;

  const timeline = buildTimeline(order);
  const showCommissionAmount = !["refunded", "cancelled", "none"].includes(
    order.commissionState,
  );
  const sameCurrency = order.orderCurrency === "USD";

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <Breadcrumb
          items={[
            {
              title: <Link href="/affiliate/orders">Orders</Link>,
            },
            {
              title: order.orderNumber,
            },
          ]}
        />

        <header className="mt-4 rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
          <div className="relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 -z-10 h-48 w-48 rounded-full bg-aff-gold-400/15 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
            />
            <div className="relative z-10 flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div className="min-w-0">
                <h1 className="break-all font-display text-[22px] font-semibold leading-tight text-aff-gold-300 sm:text-[30px]">
                  {order.orderNumber}
                </h1>
                <p className="mt-1.5 font-sans text-[13px] text-aff-cream-50/75 sm:text-[14px]">
                  Placed {fmtDateTime(order.orderedAt)}
                </p>
              </div>
              {/* Light chip so the status badges stay readable on dark green */}
              <div className="flex w-fit max-w-full flex-wrap gap-2 rounded-2xl bg-aff-ivory p-1.5">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>
        </header>
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* ─────────── Main column ─────────── */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-2">
          {/* Items */}
          <section className="aff-card p-4 sm:p-6">
            <h2 className="font-display text-[20px] leading-tight text-aff-green-900">
              Items
            </h2>

            <ul className="mt-4 divide-y divide-aff-border">
              {order.items.map((item, index) => (
                <li
                  key={`${item.productName}-${index}`}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[14px] font-medium text-aff-green-900">
                      {item.productName}
                    </p>
                    <p className="font-sans text-[12px] 	text-aff-muted">
                      {item.variantName ? `${item.variantName} · ` : ""}
                      {item.quantity} × {formatPrice(item.unitPriceUsd, "USD")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="font-sans text-[14px] tabular-nums text-aff-green-900">
                      {formatPrice(item.lineTotalUsd, "USD")}
                    </span>
                    {approxUsd(item.lineTotalUsd) && (
                      <span className="font-sans text-[11px] 	text-aff-muted">
                        {approxUsd(item.lineTotalUsd)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-2 space-y-1.5 border-t border-aff-border pt-4 font-sans text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="	text-aff-muted">Order total (USD)</dt>
                <dd className="text-right tabular-nums text-aff-green-900">
                  {formatPrice(order.totalUsd, "USD")}
                  {approxUsd(order.totalUsd) && (
                    <span className="block text-[11px] 	text-aff-muted">
                      {approxUsd(order.totalUsd)}
                    </span>
                  )}
                </dd>
              </div>
              {!sameCurrency && (
                <div className="flex justify-between gap-4">
                  <dt className="	text-aff-muted">
                    Customer paid ({order.orderCurrency})
                  </dt>
                  <dd className="text-right tabular-nums text-aff-green-900">
                    {formatPrice(order.totalAmount, order.orderCurrency)}
                    {approxPaid && (
                      <span className="block text-[11px] 	text-aff-muted">
                        {approxPaid}
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-3 font-sans text-[12px] 	text-aff-muted">
              Item prices are shown in USD.
            </p>
          </section>

          {/* Timeline */}
          <section className="aff-card p-4 sm:p-6">
            <h2 className="font-display text-[20px] leading-tight text-aff-green-900">
              Order timeline
            </h2>

            <ol className="mt-4 flex flex-col gap-4">
              {timeline.map((step) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span
                    className={
                      step.done
                        ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aff-green-900 text-aff-gold-300"
                        : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-aff-border 	text-aff-muted"
                    }
                  >
                    {step.done ? (
                      <Check
                        className="h-3 w-3"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="h-2 w-2"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={
                        step.done
                          ? "font-sans text-[14px] text-aff-green-900"
                          : "font-sans text-[14px] 	text-aff-muted"
                      }
                    >
                      {step.label}
                    </p>
                    <p className="font-sans text-[12px] 	text-aff-muted">
                      {step.at ? fmtDateTime(step.at) : "Not yet"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ─────────── Side column ─────────── */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Commission */}
          <section className="aff-card p-4 sm:p-6">
            <h2 className="font-display text-[20px] leading-tight text-aff-green-900">
              Your commission
            </h2>

            <p className="mt-4 font-display text-[30px] font-semibold tabular-nums text-aff-green-900 sm:text-[34px]">
              {showCommissionAmount
                ? formatPrice(order.commissionUsd, "USD")
                : "—"}
            </p>
            {showCommissionAmount && approxUsd(order.commissionUsd) && (
              <p className="font-sans text-[12px] 	text-aff-muted">
                {approxUsd(order.commissionUsd)}
              </p>
            )}
            {showCommissionAmount && (
              <p className="font-sans text-[12px] 	text-aff-muted">
                {order.commissionPercent}% of{" "}
                {formatPrice(order.totalUsd, "USD")}
              </p>
            )}

            <div className="mt-3">
              <CommissionStateBadge state={order.commissionState} />
            </div>
            <p className="mt-3 font-sans text-[13px] leading-relaxed 	text-aff-muted">
              {commissionNote(order)}
            </p>

            {order.payoutRequestNumber && (
              <p className="mt-3 font-sans text-[13px] 	text-aff-muted">
                Payout request:{" "}
                <Link
                  href="/affiliate/payouts"
                  className="font-medium text-aff-green-900 hover:text-aff-gold-600"
                >
                  {order.payoutRequestNumber}
                </Link>
              </p>
            )}
          </section>

          {/* Customer */}
          <section className="aff-card p-4 sm:p-6">
            <h2 className="font-display text-[20px] leading-tight text-aff-green-900">
              Customer
            </h2>

            <p className="mt-4 font-sans text-[14px] text-aff-green-900">
              {order.customerFirstName}
            </p>
            {order.customerEmailMasked && (
              <p className="font-sans text-[13px] 	text-aff-muted">
                {order.customerEmailMasked}
              </p>
            )}

            <p className="mt-4 flex items-start gap-2 font-sans text-[12px] leading-relaxed 	text-aff-muted">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              Customer contact details are kept private to protect your
              customers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
