"use client";

import Link from "next/link";
import { Table, type TableColumnsType } from "antd";
import { PackageOpen } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import type { BulkOrderListItem } from "@/lib/admin/bulk-order-queries";
import {
  BulkOrderStatusBadge,
  bulkOrderNeedsAction,
} from "@/components/admin/bulk-orders/bulk-order-status-badge";

// List of bulk orders: antd Table on desktop, stacked cards on mobile.
// Bulk orders are priced in USD (the base currency), so amounts are shown
// in USD. Rows waiting for the admin get a copper edge (see the small CSS
// addition in globals.css).

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function BulkOrderTable({ orders }: { orders: BulkOrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
        <PackageOpen
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-espresso">
          No bulk orders found
        </p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
          Try a different search or tab. Requests from stockists appear here as
          soon as they are submitted.
        </p>
      </div>
    );
  }

  const columns: TableColumnsType<BulkOrderListItem> = [
    {
      title: "Order",
      dataIndex: "numberLabel",
      render: (_, item) => (
        <Link
          href={`/admin/bulk-orders/${item.id}`}
          className="font-sans text-[13px] font-medium tabular-nums text-espresso hover:text-copper"
        >
          {item.numberLabel}
        </Link>
      ),
    },
    {
      title: "Stockist",
      dataIndex: "stockistName",
      render: (_, item) => (
        <div className="min-w-0">
          <p className="truncate font-sans text-[13px] text-espresso">
            {item.stockistName}
          </p>
          <p className="truncate font-sans text-[12px] text-warm-gray">
            {item.stockistEmail}
          </p>
        </div>
      ),
    },
    {
      title: "Packs",
      dataIndex: "units",
      align: "right",
      render: (_, item) => (
        <div className="text-right">
          <p className="font-sans text-[13px] tabular-nums text-espresso">
            {item.units} units
          </p>
          <p className="font-sans text-[12px] text-warm-gray">
            {item.itemCount} {item.itemCount === 1 ? "pack" : "packs"}
          </p>
        </div>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discountPercent",
      align: "right",
      render: (_, item) => (
        <span className="font-sans text-[13px] tabular-nums text-espresso/80">
          {item.discountPercent}%
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalUsd",
      align: "right",
      render: (_, item) => (
        <span className="font-sans text-[13px] font-medium tabular-nums text-espresso">
          {formatMoney(item.totalUsd, "USD")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, item) => <BulkOrderStatusBadge status={item.status} />,
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

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table<BulkOrderListItem>
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={false}
          className="finasto-admin-table"
          rowClassName={(item) =>
            bulkOrderNeedsAction(item.status) ? "finasto-row-attention" : ""
          }
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {orders.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/bulk-orders/${item.id}`}
              className="block rounded-2xl border border-border bg-white p-4"
              style={
                bulkOrderNeedsAction(item.status)
                  ? { boxShadow: "inset 3px 0 0 var(--color-copper)" }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-sans text-[14px] font-medium tabular-nums text-espresso">
                    {item.numberLabel}
                  </p>
                  <p className="truncate font-sans text-[12px] text-warm-gray">
                    {item.stockistName}
                  </p>
                </div>
                <span className="shrink-0 font-sans text-[14px] font-medium tabular-nums text-espresso">
                  {formatMoney(item.totalUsd, "USD")}
                </span>
              </div>

              <div className="mt-2">
                <BulkOrderStatusBadge status={item.status} />
              </div>

              <div className="mt-2 flex items-center justify-between font-sans text-[12px] text-warm-gray">
                <span>
                  {item.units} units · {item.discountPercent}% off
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
