"use client";

import Link from "next/link";
import { Table, type TableColumnsType } from "antd";
import { Receipt } from "lucide-react";
import type { OrderListItem } from "@/lib/admin/order-queries";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/orders/order-status-badge";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const moneyFmt = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export function OrderTable({
  orders,
  page,
  pageSize,
}: {
  orders: OrderListItem[];
  page: number;
  pageSize: number;
}) {
  const startIndex = (page - 1) * pageSize;
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
        <Receipt
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-espresso">
          No orders found
        </p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
          Try a different search or filter — orders placed at checkout will
          appear here.
        </p>
      </div>
    );
  }

  const columns: TableColumnsType<OrderListItem> = [
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
      dataIndex: "trackingCode",
      render: (_, item) => (
        <div className="min-w-0">
          <Link
            href={`/admin/orders/${item.id}`}
            className="block truncate font-sans text-[13px] font-medium tabular-nums text-espresso hover:text-copper"
            style={{ color: "#2E7D32" }}
          >
            {item.trackingCode}
          </Link>
          <p className="truncate font-sans text-[12px] text-warm-gray">
            {item.itemCount} {item.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      render: (_, item) => (
        <div className="min-w-0">
          <p className="truncate font-sans text-[13px] text-espresso">
            {item.customerName}
          </p>
          <p className="truncate font-sans text-[12px] text-warm-gray">
            {item.customerEmail}
          </p>
        </div>
      ),
    },
    {
      title: "Referral",
      dataIndex: "affiliateName",
      render: (_, item) =>
        item.affiliateName ? (
          <div className="min-w-0">
            <p className="truncate font-sans text-[13px] text-espresso">
              {item.affiliateName}
            </p>
            {item.stockistName && (
              <p className="truncate font-sans text-[12px] text-warm-gray">
                via {item.stockistName}
              </p>
            )}
          </div>
        ) : (
          <span className="font-sans text-[12px] text-warm-gray">Direct</span>
        ),
    },
    {
      title: "Total",
      dataIndex: "totalOriginal",
      width: "100",
      render: (_, item) => (
        <span className="font-sans text-[13px] tabular-nums text-espresso">
          {moneyFmt(item.totalOriginal, item.currency)}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, item) => (
        <div className="flex flex-col gap-1.5">
          <OrderStatusBadge status={item.orderStatus} />
          <PaymentStatusBadge status={item.paymentStatus} />
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (_, item) => (
        <span className="font-sans text-[13px] text-espresso/80">
          {dateFmt.format(new Date(item.createdAt))}
        </span>
      ),
    },
  ];
  const TABLE_WIDTH = 400;
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table<OrderListItem>
          columns={columns}
          dataSource={orders}
          rowKey="id"
          scroll={{ x: TABLE_WIDTH }}
          pagination={false}
          className="finasto-admin-table"
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {orders.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/orders/${item.id}`}
              className="block rounded-2xl border border-border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-sans text-[14px] font-medium tabular-nums text-espresso">
                    {item.trackingCode}
                  </p>
                  <p className="truncate font-sans text-[12px] text-warm-gray">
                    {item.customerName} · {item.customerEmail}
                  </p>
                </div>
                <span className="shrink-0 font-sans text-[14px] font-medium tabular-nums text-espresso">
                  {moneyFmt(item.totalOriginal, item.currency)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <OrderStatusBadge status={item.orderStatus} />
                <PaymentStatusBadge status={item.paymentStatus} />
              </div>

              <div className="mt-2 flex items-center justify-between font-sans text-[12px] text-warm-gray">
                <span>
                  {item.affiliateName
                    ? `${item.affiliateName}${item.stockistName ? ` via ${item.stockistName}` : ""}`
                    : "Direct"}
                </span>
                <span>{dateFmt.format(new Date(item.createdAt))}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
