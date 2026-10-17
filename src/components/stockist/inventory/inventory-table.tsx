"use client";

import Link from "next/link";
import { Table, type TableColumnsType } from "antd";
import { Boxes } from "lucide-react";
import type {
  Inventory,
  InventoryRow,
  StockLevel,
} from "@/lib/stockist/inventory-queries";

// Read-only stock list for the stockist: a table on desktop, cards on
// mobile, three totals on top. The desktop table is an antd Table (same
// look as the other stockist and affiliate tables), so every number sits in
// its own aligned column.

const LEVELS: Record<StockLevel, { label: string; bg: string; color: string }> =
  {
    in_stock: {
      label: "In stock",
      bg: "var(--color-green-bg)",
      color: "var(--color-green)",
    },
    low: {
      label: "Low stock",
      bg: "color-mix(in srgb, var(--color-copper) 14%, transparent)",
      color: "var(--color-copper)",
    },
    out: {
      label: "Out of stock",
      bg: "var(--color-cream)",
      color: "var(--color-warm-gray)",
    },
  };

function LevelBadge({ level }: { level: StockLevel }) {
  const l = LEVELS[level];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[12px] font-medium"
      style={{ background: l.bg, color: l.color }}
    >
      {l.label}
    </span>
  );
}

export function InventoryTable({ inventory }: { inventory: Inventory }) {
  const { items, totals } = inventory;

  const columns: TableColumnsType<InventoryRow> = [
    {
      title: "#",
      dataIndex: "sr",
      width: 60,
      render: (_, __, index) => (
        <span className="tabular-nums text-neutral-500">{index + 1}</span>
      ),
    },

    {
      title: "Product",
      dataIndex: "productName",
      render: (v: string) => (
        <span className="font-sans text-[14px] text-espresso">{v}</span>
      ),
    },
    {
      title: "Pack",
      dataIndex: "packName",
      render: (v: string) => (
        <span className="font-sans text-[14px] text-espresso/80">{v}</span>
      ),
    },
    {
      title: "Bought",
      dataIndex: "bought",
      align: "right",
      width: 110,
      render: (v: number) => (
        <span className="font-sans text-[14px] tabular-nums text-espresso">
          {v}
        </span>
      ),
    },
    {
      title: "Sold",
      dataIndex: "sold",
      align: "right",
      width: 110,
      render: (v: number) => (
        <span className="font-sans text-[14px] tabular-nums text-espresso">
          {v}
        </span>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remaining",
      align: "right",
      width: 120,
      render: (v: number) => (
        <span className="font-sans text-[14px] font-medium tabular-nums text-espresso">
          {v}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "level",
      width: 140,
      render: (level: StockLevel) => <LevelBadge level={level} />,
    },
  ];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
        <Boxes
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-espresso">No stock yet</p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
          Packs appear here once Finasto approves a bulk order.
        </p>
        <Link
          href="/stockist/bulk-orders/new"
          className="mt-4 font-sans text-[13px] text-espresso underline hover:text-copper"
        >
          Request packs
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Totals */}
      <dl className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Bought", value: totals.bought },
          { label: "Sold", value: totals.sold },
          { label: "Remaining", value: totals.remaining },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-white px-4 py-3"
          >
            <dt className="font-sans text-[12px] text-warm-gray">{s.label}</dt>
            <dd className="mt-1 font-display text-[24px] leading-none tabular-nums text-espresso">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table<InventoryRow>
          columns={columns}
          dataSource={items}
          rowKey="variantId"
          pagination={false}
          className="finasto-admin-table"
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((i) => (
          <li
            key={i.variantId}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-sans text-[15px] font-medium text-espresso">
                  {i.productName}
                </p>
                <p className="font-sans text-[12px] text-warm-gray">
                  {i.packName}
                </p>
              </div>
              <LevelBadge level={i.level} />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 font-sans text-[13px]">
              <div>
                <dt className="text-warm-gray">Bought</dt>
                <dd className="tabular-nums text-espresso">{i.bought}</dd>
              </div>
              <div>
                <dt className="text-warm-gray">Sold</dt>
                <dd className="tabular-nums text-espresso">{i.sold}</dd>
              </div>
              <div>
                <dt className="text-warm-gray">Remaining</dt>
                <dd className="font-medium tabular-nums text-espresso">
                  {i.remaining}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
