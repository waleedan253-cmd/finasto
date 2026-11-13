"use client";

import Link from "next/link";
import { Table, type TableColumnsType } from "antd";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { MyOrderRow } from "@/lib/affiliate/orders-queries";
import {
  CommissionStateBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./order-status-badge";

import { withApprox, type RateMap } from "@/lib/currency";

// The affiliate's order list: a table on desktop, cards on mobile, same
// split as affiliate-table.tsx. Only the safe customer fields exist on
// MyOrderRow (first name and a masked email), so nothing more can be
// shown here by accident.

// UTC on purpose: the server and the browser must print the same text,
// otherwise React reports a hydration mismatch.
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const detailHref = (order: MyOrderRow) =>
  `/affiliate/orders/${order.orderNumber}`;

// No commission to show for these, so the amount is replaced by a dash.
const hasCommissionAmount = (order: MyOrderRow) =>
  !["refunded", "cancelled", "none"].includes(order.commissionState);

const itemsLabel = (count: number) =>
  `${count} ${count === 1 ? "item" : "items"}`;

// "approx. PKR 1,200" in the currency chosen in the header menu, or null
// when it is the same currency or no usable rate exists.
function makeApprox(rates: RateMap, currency: string) {
  return {
    total: (o: MyOrderRow) =>
      withApprox(o.totalAmount, o.orderCurrency, currency, rates).approx,
    commission: (o: MyOrderRow) =>
      hasCommissionAmount(o)
        ? withApprox(o.commissionUsd, "USD", currency, rates).approx
        : null,
  };
}

export function OrdersTable({
  orders,
  page,
  pageSize,
  rates,
  currency,
}: {
  orders: MyOrderRow[];
  page: number;
  pageSize: number;
  rates: RateMap;
  currency: string;
}) {
  const startIndex = (page - 1) * pageSize;
  const approx = makeApprox(rates, currency);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-aff-gold-500/50 bg-aff-ivory px-4 py-14 text-center sm:py-16">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-aff-gold-400/50 bg-aff-green-900 text-aff-gold-300">
          <ShoppingBag className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="mt-3 font-sans text-[14px] text-aff-green-900">
          No orders found
        </p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-aff-muted">
          Try a different search or filter. Orders placed through your referral
          links will appear here.
        </p>
      </div>
    );
  }

  const columns: TableColumnsType<MyOrderRow> = [
    {
      title: "#",
      key: "sr",
      width: 60,
      render: (_, __, index) => (
        <span className="tabular-nums text-aff-muted">
          {startIndex + index + 1}
        </span>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderNumber",
      render: (_, order) => (
        <div className="min-w-0">
          <Link
            href={detailHref(order)}
            className="block truncate font-sans text-[14px] font-medium text-aff-green-900 hover:text-aff-gold-600"
          >
            {order.orderNumber}
          </Link>
          <p className="font-sans text-[12px] text-aff-muted">
            {itemsLabel(order.itemCount)}
          </p>
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerFirstName",
      render: (_, order) => (
        <div className="min-w-0">
          <p className="truncate font-sans text-[14px] text-aff-green-900">
            {order.customerFirstName}
          </p>
          {order.customerEmailMasked && (
            <p className="truncate font-sans text-[12px] text-aff-muted">
              {order.customerEmailMasked}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      align: "right",
      render: (_, order) => (
        <div className="flex flex-col items-end">
          <span className="font-sans text-[13px] tabular-nums text-aff-green-900">
            {formatPrice(order.totalAmount, order.orderCurrency)}
          </span>
          {approx.total(order) && (
            <span className="font-sans text-[11px] text-aff-muted">
              {approx.total(order)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, order) => (
        <div className="flex flex-col items-start gap-1">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      ),
    },
    {
      title: "Commission",
      dataIndex: "commissionUsd",
      render: (_, order) => (
        <div className="flex flex-col items-start gap-1">
          <span className="font-sans text-[13px] tabular-nums text-aff-green-900">
            {hasCommissionAmount(order)
              ? `${formatPrice(order.commissionUsd, "USD")} (${order.commissionPercent}%)`
              : "—"}
          </span>
          {approx.commission(order) && (
            <span className="font-sans text-[11px] text-aff-muted">
              {approx.commission(order)}
            </span>
          )}
          <CommissionStateBadge state={order.commissionState} />
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "orderedAt",
      render: (_, order) => (
        <span className="font-sans text-[13px] text-aff-green-900/80">
          {dateFmt.format(new Date(order.orderedAt))}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Desktop table */}
      <div className="relative hidden overflow-hidden rounded-2xl border border-aff-border bg-white shadow-[0_10px_30px_-22px_rgba(172,131,78,0.45)] md:block">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
        />
        <Table<MyOrderRow>
          columns={columns}
          dataSource={orders}
          rowKey="orderNumber"
          pagination={false}
          scroll={{ x: 880 }}
          className="aff-orders-table"
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {orders.map((order) => (
          <OrderCard
            key={order.orderNumber}
            order={order}
            rates={rates}
            currency={currency}
          />
        ))}
      </ul>
    </>
  );
}

function OrderCard({
  order,
  rates,
  currency,
}: {
  order: MyOrderRow;
  rates: RateMap;
  currency: string;
}) {
  const approx = makeApprox(rates, currency);
  return (
    <li className="relative overflow-hidden rounded-2xl border border-aff-border bg-white p-4 shadow-[0_10px_30px_-22px_rgba(172,131,78,0.45)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={detailHref(order)}
            className="block truncate py-0.5 font-sans text-[15px] font-semibold text-aff-green-900 hover:text-aff-gold-600"
          >
            {order.orderNumber}
          </Link>
          <p className="mt-0.5 font-sans text-[12px] text-aff-muted">
            {itemsLabel(order.itemCount)} ·{" "}
            {dateFmt.format(new Date(order.orderedAt))}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-sans text-[14px] font-medium tabular-nums text-aff-green-900">
            {formatPrice(order.totalAmount, order.orderCurrency)}
          </span>
          {approx.total(order) && (
            <span className="font-sans text-[11px] text-aff-muted">
              {approx.total(order)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 font-sans text-[13px]">
        <dt className="text-aff-muted">Customer</dt>
        <dd className="min-w-0 text-right text-aff-green-900">
          <span className="block truncate">{order.customerFirstName}</span>
          {order.customerEmailMasked && (
            <span className="block truncate text-[12px] text-aff-muted">
              {order.customerEmailMasked}
            </span>
          )}
        </dd>
        <dt className="text-aff-muted">Commission</dt>
        <dd className="text-right tabular-nums text-aff-green-900">
          {hasCommissionAmount(order)
            ? `${formatPrice(order.commissionUsd, "USD")} (${order.commissionPercent}%)`
            : "—"}
          {approx.commission(order) && (
            <span className="block text-[11px] text-aff-muted">
              {approx.commission(order)}
            </span>
          )}
        </dd>
      </dl>

      <div className="mt-3">
        <CommissionStateBadge state={order.commissionState} />
      </div>
    </li>
  );
}
