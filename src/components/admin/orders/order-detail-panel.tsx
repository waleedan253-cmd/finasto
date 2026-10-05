"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, Select, Divider, Typography, message } from "antd";
import { Loader2, Mail, Store, User, Users } from "lucide-react";
import type { OrderDetail, OrderStatus } from "@/lib/admin/order-queries";
import { updateOrderStatus } from "@/lib/admin/order-actions";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/orders/order-status-badge";

const moneyFmt = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

// Mirrors the server-side ALLOWED_TRANSITIONS in order-actions.ts — this
// copy is for the UI only (which options to even show); the server
// re-validates independently and is the actual authority, so a stale
// copy here would only ever show a wrong option, never allow a bad one.
const NEXT_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderDetailPanel({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  const nextOptions = NEXT_OPTIONS[order.orderStatus];

  function handleStatusChange(next: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, next);
      if (result.success) {
        messageApi.success(`Order marked as ${STATUS_LABELS[next]}`);
        router.refresh();
      } else {
        messageApi.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {contextHolder}

      <Breadcrumb
        items={[
          { title: <Link href="/admin/orders">Orders</Link> },
          { title: order.trackingCode },
        ]}
      />

      {/* Header */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Typography.Text className="!font-sans !text-[12px] !uppercase !tracking-[0.12em] !text-warm-gray">
              Tracking Code
            </Typography.Text>
            <Typography.Title
              level={1}
              className="!mt-1 !font-display !text-[30px] !leading-tight !text-espresso"
            >
              {order.trackingCode}
            </Typography.Title>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>

            {nextOptions.length > 0 && (
              <Select
                value={undefined}
                placeholder={isPending ? "Updating..." : "Update status"}
                onChange={handleStatusChange}
                disabled={isPending}
                suffixIcon={
                  isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : undefined
                }
                options={nextOptions.map((s) => ({
                  value: s,
                  label: `Mark as ${STATUS_LABELS[s]}`,
                }))}
                style={{ width: 200, height: 40 }}
              />
            )}
          </div>
        </div>

        <Divider className="!my-6 !border-border" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 font-sans text-[13px] font-medium text-warm-gray">
              <User className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              Customer
            </h3>
            <p className="mt-2 font-sans text-[14px] text-espresso">
              {order.customerName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[13px] text-warm-gray">
              <Mail
                className="h-3.5 w-3.5"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              {order.customerEmail}
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-sans text-[13px] font-medium text-warm-gray">
              <Users className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              Referral Attribution
            </h3>
            {order.affiliateName ? (
              <>
                <p className="mt-2 font-sans text-[14px] text-espresso">
                  {order.affiliateName}
                  {order.affiliateCommissionPercent != null && (
                    <span className="ml-2 font-sans text-[12px] text-copper">
                      {order.affiliateCommissionPercent}% commission
                    </span>
                  )}
                </p>
                {order.stockistName && (
                  <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[13px] text-warm-gray">
                    <Store
                      className="h-3.5 w-3.5"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    via {order.stockistName}
                    {order.stockistProfitPercent != null && (
                      <span className="text-copper">
                        · {order.stockistProfitPercent}% profit
                      </span>
                    )}
                  </p>
                )}
                <p className="mt-2 font-sans text-[11px] text-warm-gray">
                  Snapshotted at checkout — stays accurate even if this
                  affiliate is later reassigned.
                </p>
              </>
            ) : (
              <p className="mt-2 font-sans text-[14px] text-warm-gray">
                Direct — no referral
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <h2 className="font-display text-[20px] leading-tight text-espresso">
          Items
        </h2>

        <ul className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-sans text-[14px] text-espresso">
                  {item.productName}
                </p>
                <p className="font-sans text-[12px] text-warm-gray">
                  {item.variantName} · Qty {item.quantity}
                </p>
              </div>
              <span className="shrink-0 font-sans text-[13px] tabular-nums text-espresso">
                {moneyFmt(item.totalUsd, "USD")}
              </span>
            </li>
          ))}
        </ul>

        <Divider className="!my-4 !border-border" />

        <div className="flex items-center justify-between">
          <span className="font-sans text-[14px] text-espresso/80">Total</span>
          <span className="font-sans text-[18px] font-semibold text-espresso">
            {moneyFmt(order.totalOriginal, order.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
