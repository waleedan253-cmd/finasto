"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Check,
  ClipboardCheck,
  Copy,
  Package,
  PackageCheck,
  PackageX,
  Truck,
} from "lucide-react";
import { formatMoney } from "@/lib/currency";
import type { OrderStatusResult } from "@/lib/track-order/track-order-queries";

// Shows a found order's status as a custom stepper (no antd defaults),
// themed with Finasto tokens to match the premium track-order page.

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { key: "pending", label: "Order Received", icon: ClipboardCheck },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
] as const;

const HEADLINES: Record<(typeof STEPS)[number]["key"], string> = {
  pending: "We've received your order",
  processing: "Your order is being prepared",
  shipped: "Your order is on its way",
  delivered: "Your order has been delivered",
};

export function TrackOrderResult({ order }: { order: OrderStatusResult }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const isCancelled = order.orderStatus === "cancelled";
  const rawIndex = STEPS.findIndex((s) => s.key === order.orderStatus);
  const currentIndex = Math.max(rawIndex, 0);
  const lastIndex = STEPS.length - 1;
  const progress = (currentIndex / lastIndex) * 100;
  const isPaid = order.paymentStatus === "paid";

  function copyCode() {
    navigator.clipboard
      ?.writeText(order.trackingCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-copper/25 bg-white shadow-[0_30px_80px_-24px_rgba(35,77,42,0.45),0_0_0_6px_rgba(255,255,255,0.35)]">
      {/* top accent line */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent"
      />

      {/* ───────── HEADER ───────── */}
      <div className="relative bg-gradient-to-br from-green-deep via-[#17391f] to-espresso-deep px-6 py-7 sm:px-9 sm:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper/25 blur-[70px]"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-copper-light">
              Tracking Code
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <h2 className="font-display text-[26px] leading-tight text-white sm:text-[30px]">
                {order.trackingCode}
              </h2>
              <button
                type="button"
                onClick={copyCode}
                aria-label={copied ? "Copied" : "Copy tracking code"}
                style={{ cursor: "pointer" }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light/60"
              >
                {copied ? (
                  <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-[12px] font-medium ${
              isPaid
                ? "border-[#8cc79a]/40 bg-[#8cc79a]/15 text-[#c4efcf]"
                : "border-copper-light/40 bg-copper/15 text-copper-light"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                isPaid ? "bg-[#8cc79a]" : "bg-copper-light"
              }`}
            />
            Payment {isPaid ? "Confirmed" : "Pending"}
          </span>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-9 sm:py-10">
        {/* ───────── STATUS ───────── */}
        {isCancelled ? (
          <div className="flex flex-col items-center rounded-2xl border border-red/20 bg-red/5 px-5 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red">
              <PackageX className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-[22px] text-espresso">
              This order was cancelled
            </p>
          </div>
        ) : (
          <div>
            <p className="text-center font-display text-[22px] leading-tight text-espresso sm:text-[26px]">
              {HEADLINES[STEPS[currentIndex].key]}
            </p>

            <div className="relative mt-9">
              {/* track */}
              <div
                aria-hidden="true"
                className="absolute left-[12.5%] right-[12.5%] top-6 h-[3px] overflow-hidden rounded-full bg-border sm:top-7"
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-green to-copper"
                  initial={{ width: reduce ? `${progress}%` : "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
                />
              </div>

              <ol className="relative grid grid-cols-4">
                {STEPS.map(({ key, label, icon: Icon }, i) => {
                  const done =
                    i < currentIndex ||
                    (currentIndex === lastIndex && i === currentIndex);
                  const current = i === currentIndex && !done;
                  return (
                    <li
                      key={key}
                      aria-current={current || (done && i === currentIndex) ? "step" : undefined}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="relative">
                        {current && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 animate-ping rounded-full bg-copper/30"
                          />
                        )}
                        <span
                          className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all sm:h-14 sm:w-14 ${
                            done
                              ? "bg-gradient-to-b from-green to-green-deep text-white shadow-[0_10px_22px_-8px_rgba(35,77,42,0.7),inset_0_1px_0_0_rgba(255,255,255,0.25)]"
                              : current
                                ? "border-2 border-copper bg-white text-copper shadow-[0_10px_26px_-8px_rgba(201,130,69,0.7)]"
                                : "border border-border-strong bg-cream-soft text-warm-gray/70"
                          }`}
                        >
                          {done ? (
                            <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} aria-hidden="true" />
                          ) : (
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.6} aria-hidden="true" />
                          )}
                        </span>
                      </div>
                      <p
                        className={`mt-3 max-w-[84px] font-sans text-[11px] leading-snug sm:max-w-none sm:text-[13px] ${
                          current || (done && i === currentIndex)
                            ? "font-semibold text-espresso"
                            : done
                              ? "font-medium text-espresso/80"
                              : "text-warm-gray"
                        }`}
                      >
                        {label}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        {/* ───────── ITEMS ───────── */}
        <div className="mt-10">
          <h3 className="font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-copper">
            Order Items
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-cream-soft/60 px-4 py-3"
              >
                <span className="font-sans text-[13px] text-espresso/85 sm:text-[14px]">
                  {item.productName}{" "}
                  <span className="text-warm-gray">· {item.variantName}</span>
                </span>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 font-sans text-[12px] font-medium tabular-nums text-espresso shadow-[0_1px_3px_rgba(50,30,24,0.12)]">
                  × {item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ───────── TOTAL ───────── */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-green-bg px-5 py-4">
          <span className="font-sans text-[14px] text-espresso/80">Total</span>
          <span className="font-display text-[26px] leading-none text-green-deep">
            {formatMoney(order.totalOriginal, order.currency)}
          </span>
        </div>

        {/* ───────── FOOTER ───────── */}
        <div className="mt-6 flex items-center gap-2.5 border-t border-border pt-5">
          <PackageCheck
            className="h-4 w-4 shrink-0 text-green"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <p className="font-sans text-[12px] text-warm-gray">
            Placed by {order.customerName} on{" "}
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(order.createdAt))}
          </p>
        </div>
      </div>
    </div>
  );
}