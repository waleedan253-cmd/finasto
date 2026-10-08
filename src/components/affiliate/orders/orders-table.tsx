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
import { useMarket } from "@/components/providers/market-provider";
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
function useApprox(rates: RateMap) {
  const { market } = useMarket();
  return {
    total: (o: MyOrderRow) =>
      withApprox(o.totalAmount, o.orderCurrency, market.currencyCode, rates)
        .approx,
    commission: (o: MyOrderRow) =>
      hasCommissionAmount(o)
        ? withApprox(o.commissionUsd, "USD", market.currencyCode, rates).approx
        : null,
  };
}

export function OrdersTable({
  orders,
  page,
  pageSize,
  rates,
}: {
  orders: MyOrderRow[];
  page: number;
  pageSize: number;
  rates: RateMap;
}) {
  const startIndex = (page - 1) * pageSize;
  const approx = useApprox(rates);

  if (orders.length === 0) {
    return (
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
        <span className="tabular-nums text-neutral-500">
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
            className="block truncate font-sans text-[14px] font-medium hover:text-copper"
            style={{ color: "#2E7D32" }}
          >
            {order.orderNumber}
          </Link>
          <p className="font-sans text-[12px] text-warm-gray">
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
          <p className="truncate font-sans text-[14px] text-espresso">
            {order.customerFirstName}
          </p>
          {order.customerEmailMasked && (
            <p className="truncate font-sans text-[12px] text-warm-gray">
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
          <span className="font-sans text-[13px] tabular-nums text-espresso">
            {formatPrice(order.totalAmount, order.orderCurrency)}
          </span>
          {approx.total(order) && (
            <span className="font-sans text-[11px] text-warm-gray">
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
          <span className="font-sans text-[13px] tabular-nums text-espresso">
            {hasCommissionAmount(order)
              ? `${formatPrice(order.commissionUsd, "USD")} (${order.commissionPercent}%)`
              : "—"}
          </span>
          {approx.commission(order) && (
            <span className="font-sans text-[11px] text-warm-gray">
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
        <span className="font-sans text-[13px] text-espresso/80">
          {dateFmt.format(new Date(order.orderedAt))}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table<MyOrderRow>
          columns={columns}
          dataSource={orders}
          rowKey="orderNumber"
          pagination={false}
          className="finasto-admin-table"
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {orders.map((order) => (
          <OrderCard key={order.orderNumber} order={order} rates={rates} />
        ))}
      </ul>
    </>
  );
}

function OrderCard({ order, rates }: { order: MyOrderRow; rates: RateMap }) {
  const approx = useApprox(rates);
  return (
    <li className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={detailHref(order)}
            className="block truncate font-sans text-[15px] font-medium text-espresso"
          >
            {order.orderNumber}
          </Link>
          <p className="mt-0.5 font-sans text-[12px] text-warm-gray">
            {itemsLabel(order.itemCount)} ·{" "}
            {dateFmt.format(new Date(order.orderedAt))}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-sans text-[14px] font-medium tabular-nums text-espresso">
            {formatPrice(order.totalAmount, order.orderCurrency)}
          </span>
          {approx.total(order) && (
            <span className="font-sans text-[11px] text-warm-gray">
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
        <dt className="text-warm-gray">Customer</dt>
        <dd className="min-w-0 text-right text-espresso">
          <span className="block truncate">{order.customerFirstName}</span>
          {order.customerEmailMasked && (
            <span className="block truncate text-[12px] text-warm-gray">
              {order.customerEmailMasked}
            </span>
          )}
        </dd>
        <dt className="text-warm-gray">Commission</dt>
        <dd className="text-right tabular-nums text-espresso">
          {hasCommissionAmount(order)
            ? `${formatPrice(order.commissionUsd, "USD")} (${order.commissionPercent}%)`
            : "—"}
          {approx.commission(order) && (
            <span className="block text-[11px] text-warm-gray">
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
