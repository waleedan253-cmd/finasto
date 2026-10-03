"use client";

import { useState } from "react";
import { Table, Button, type TableColumnsType } from "antd";
import { Package, PackagePlus } from "lucide-react";
import type { InventoryRow } from "@/lib/admin/inventory-queries";
import { LowStockBadge } from "@/components/admin/inventory/low-stock-badge";
import { RestockDialog } from "@/components/admin/inventory/restock-dialog";

export function InventoryTable({
  items,
  page,
  pageSize,
}: {
  items: InventoryRow[];
  page: number;
  pageSize: number;
}) {
  const startIndex = (page - 1) * pageSize;
  const [restockTarget, setRestockTarget] = useState<InventoryRow | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
        <Package
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-espresso">
          No inventory to show
        </p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
          Try a different search, or add products with variants first.
        </p>
      </div>
    );
  }

  const columns: TableColumnsType<InventoryRow> = [
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
      title: "Product",
      dataIndex: "productName",
      width: 200,
      render: (_, item) => (
        <div className="min-w-0">
          <p
            className="truncate font-sans text-[14px] font-medium "
            style={{ color: "#2E7D32" }}
          >
            {item.productName}
          </p>
          <p className="truncate font-sans text-[12px] text-warm-gray">
            {item.variantName} · SKU {item.sku}
          </p>
        </div>
      ),
    },
    {
      title: "Total Stock",
      dataIndex: "totalStock",
      width: 120,
      //   align: "right",
      render: (_, item) => (
        <span className="font-sans text-[13px] tabular-nums text-espresso">
          {item.totalStock}
        </span>
      ),
    },
    {
      title: "Sold",
      dataIndex: "sold",
      align: "right",
      render: (_, item) => (
        <span
          className="font-sans text-[13px] tabular-nums "
          style={{ color: "#2E7D32", fontWeight: "bold" }}
        >
          {item.sold}
        </span>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remaining",
      align: "right",
      render: (_, item) => (
        <span className="font-sans text-[13px] font-medium tabular-nums text-espresso">
          {item.remaining}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 150,
      align: "right",
      render: (_, item) =>
        item.isLowStock ? (
          <LowStockBadge stock={item.totalStock} />
        ) : (
          <span className="font-sans text-[12px] text-warm-gray">In stock</span>
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",

      render: (_, item) => (
        <Button
          type="text"
          size="small"
          icon={<PackagePlus className="h-4 w-4" strokeWidth={1.8} />}
          onClick={() => setRestockTarget(item)}
          className="!text-copper hover:!bg-copper/10"
        >
          Restock
        </Button>
      ),
    },
  ];
  const TABLE_WIDTH = 500;
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table<InventoryRow>
          columns={columns}
          dataSource={items}
          rowKey="variantId"
          scroll={{ x: TABLE_WIDTH }}
          pagination={false}
          className="finasto-admin-table"
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li
            key={item.variantId}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-sans text-[15px] font-medium text-espresso">
                  {item.productName}
                </p>
                <p className="truncate font-sans text-[12px] text-warm-gray">
                  {item.variantName} · SKU {item.sku}
                </p>
              </div>
              {item.isLowStock ? (
                <LowStockBadge stock={item.totalStock} />
              ) : (
                <span className="shrink-0 font-sans text-[12px] text-warm-gray">
                  In stock
                </span>
              )}
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-y-1.5 font-sans text-[13px]">
              <dt className="text-warm-gray">Total</dt>
              <dd className="col-span-2 text-right tabular-nums text-espresso">
                {item.totalStock}
              </dd>
              <dt className="text-warm-gray">Sold</dt>
              <dd className="col-span-2 text-right tabular-nums text-espresso/70">
                {item.sold}
              </dd>
              <dt className="text-warm-gray">Remaining</dt>
              <dd className="col-span-2 text-right font-medium tabular-nums text-espresso">
                {item.remaining}
              </dd>
            </dl>

            <button
              type="button"
              onClick={() => setRestockTarget(item)}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-copper/30 font-sans text-[13px] font-medium text-copper transition-colors hover:bg-copper/10"
            >
              <PackagePlus
                className="h-4 w-4"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              Restock
            </button>
          </li>
        ))}
      </ul>

      <RestockDialog
        item={restockTarget}
        onClose={() => setRestockTarget(null)}
      />
    </>
  );
}
