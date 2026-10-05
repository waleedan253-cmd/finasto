"use client";

import { Steps, Tag, Divider, Typography } from "antd";
import { PackageCheck, PackageX } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import type { OrderStatusResult } from "@/lib/track-order/track-order-queries";

// Shows a found order's status. Built on antd's <Steps> for the status
// progression, themed via Finasto tokens (not antd's default blue),
// matching the "high standard, international, not generic" direction.

const STEP_ORDER = ["pending", "processing", "shipped", "delivered"] as const;

const STEP_LABELS: Record<(typeof STEP_ORDER)[number], string> = {
  pending: "Order Received",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export function TrackOrderResult({ order }: { order: OrderStatusResult }) {
  const isCancelled = order.orderStatus === "cancelled";
  const currentStepIndex = STEP_ORDER.indexOf(
    order.orderStatus as (typeof STEP_ORDER)[number],
  );

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Typography.Text className="!font-sans !text-[12px] !uppercase !tracking-[0.12em] !text-warm-gray">
            Tracking Code
          </Typography.Text>
          <Typography.Title
            level={2}
            className="!mt-1 !font-display !text-[26px] !leading-tight !text-espresso"
          >
            {order.trackingCode}
          </Typography.Title>
        </div>

        <Tag
          bordered={false}
          style={{
            backgroundColor:
              order.paymentStatus === "paid"
                ? "color-mix(in srgb, var(--color-green) 12%, transparent)"
                : "color-mix(in srgb, var(--color-copper) 12%, transparent)",
            color:
              order.paymentStatus === "paid"
                ? "var(--color-green)"
                : "var(--color-copper)",
            borderRadius: 9999,
            paddingInline: 10,
            paddingBlock: 3,
            fontFamily: "inherit",
          }}
        >
          Payment {order.paymentStatus === "paid" ? "Confirmed" : "Pending"}
        </Tag>
      </div>

      <Divider className="!my-6 !border-border" />

      {isCancelled ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red/10 text-red">
            <PackageX
              className="h-6 w-6"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <p className="mt-3 font-sans text-[14px] font-medium text-espresso">
            This order was cancelled
          </p>
        </div>
      ) : (
        <Steps
          current={currentStepIndex}
          items={STEP_ORDER.map((key) => ({ title: STEP_LABELS[key] }))}
          className="finasto-track-steps"
        />
      )}

      <Divider className="!my-6 !border-border" />

      <div>
        <Typography.Text className="!font-sans !text-[13px] !font-medium !text-espresso">
          Order Items
        </Typography.Text>
        <ul className="mt-3 flex flex-col gap-2.5">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3">
              <span className="font-sans text-[13px] text-espresso/80">
                {item.productName} · {item.variantName}
              </span>
              <span className="font-sans text-[13px] tabular-nums text-warm-gray">
                × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Divider className="!my-6 !border-border" />

      <div className="flex items-center justify-between">
        <span className="font-sans text-[14px] text-espresso/80">Total</span>
        <span className="font-sans text-[18px] font-semibold text-espresso">
          {formatMoney(order.totalOriginal, order.currency)}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-cream-soft px-4 py-3">
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
  );
}
