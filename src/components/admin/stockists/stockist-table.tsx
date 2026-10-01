"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { message, Table, Tooltip, type TableColumnsType } from "antd";
import { Mail, Pencil, Store, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StockistListItem,
  StockistStatus,
} from "@/lib/admin/stockist-queries";
import {
  setStockistStatus,
  inviteStockistUser,
} from "@/lib/admin/stockist-actions";
import { StockistStatusBadge } from "@/components/admin/stockists/stockist-status-badge";
import { DeleteStockistDialog } from "./delete-stockist-dialog";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function locationLabel(item: StockistListItem) {
  return [item.region, item.country].filter(Boolean).join(", ") || "—";
}

export function StockistTable({
  stockists,
  page,
  pageSize,
}: {
  stockists: StockistListItem[];
  page: number;
  pageSize: number;
}) {
  const startIndex = (page - 1) * pageSize;
  const [deleteTarget, setDeleteTarget] = useState<StockistListItem | null>(
    null,
  );

  if (stockists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
        <Store
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-espresso">
          No stockists found
        </p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
          Try a different search or status filter, or add your first stockist.
        </p>
      </div>
    );
  }

  const columns: TableColumnsType<StockistListItem> = [
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
      title: "Stockist",
      dataIndex: "name",
      render: (_, item) => (
        <div className="min-w-0">
          <Link
            href={`/admin/stockists/${item.id}`}
            className="block truncate font-sans text-[14px] font-medium text-espresso hover:text-copper"
            style={{ color: "#2E7D32" }}
          >
            {item.name}
          </Link>
          <p className="truncate font-sans text-[12px] text-warm-gray">
            {item.email}
          </p>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "region",
      render: (_, item) => (
        <span className="font-sans text-[13px] text-espresso/80">
          {locationLabel(item)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, item) => <StockistStatusBadge status={item.status} />,
    },
    {
      title: "Affiliates",
      dataIndex: "affiliateCount",
      align: "right",
      render: (_, item) => (
        <span className="font-sans text-[13px] tabular-nums text-espresso">
          {item.affiliateCount}
        </span>
      ),
    },
    {
      title: "Profit %",
      dataIndex: "defaultProfitPercent",
      align: "right",
      render: (_, item) => (
        <span className="font-sans text-[13px] tabular-nums text-espresso">
          {item.defaultProfitPercent}%
        </span>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      render: (_, item) => (
        <div>
          <p className="font-sans text-[13px] text-espresso/80">
            {dateFmt.format(new Date(item.updatedAt))}
          </p>
          {item.hasAccount ? (
            <StatusToggle item={item} />
          ) : (
            <InviteButton item={item} />
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, item) => (
        <RowActions item={item} onDelete={() => setDeleteTarget(item)} />
      ),
    },
  ];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table<StockistListItem>
          columns={columns}
          dataSource={stockists}
          rowKey="id"
          pagination={false}
          className="finasto-admin-table"
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {stockists.map((item) => (
          <StockistCard
            key={item.id}
            item={item}
            onDelete={() => setDeleteTarget(item)}
          />
        ))}
      </ul>

      <DeleteStockistDialog
        stockist={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

function InviteButton({ item }: { item: StockistListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function resend() {
    startTransition(async () => {
      const result = await inviteStockistUser(item.id, item.name, item.email);
      if (result.success) {
        message.success(`Invite sent to ${item.email}`);
        router.refresh();
      } else {
        message.error(result.error ?? "Could not send the invite");
      }
    });
  }

  return (
    <Tooltip title="No login yet — click to resend the invite email">
      <button
        type="button"
        onClick={resend}
        disabled={isPending}
        className={cn(
          "font-sans text-[12px] text-copper underline decoration-dotted underline-offset-2 transition-colors hover:text-espresso",
          isPending && "opacity-50",
        )}
        style={{
          cursor: "pointer",
        }}
      >
        {isPending ? "Sending..." : "Resend invite"}
      </button>
    </Tooltip>
  );
}

function StatusToggle({ item }: { item: StockistListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  //   if (item.status === "deleted") return null;

  function toggle() {
    const next: StockistStatus =
      item.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      const result = await setStockistStatus(item.id, next);
      if (result.success) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "font-sans text-[12px] text-warm-gray underline decoration-dotted underline-offset-2 transition-colors hover:text-espresso",
        isPending && "opacity-50",
      )}
      style={{
        cursor: "pointer",
      }}
    >
      {item.status === "active" ? "Deactivate" : "Reactivate"}
    </button>
  );
}

function RowActions({
  item,
  onDelete,
}: {
  item: StockistListItem;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/stockists/${item.id}`}
        aria-label={`Edit ${item.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-cream-soft hover:text-espresso"
      >
        <Pencil
          className="h-4 w-4"
          strokeWidth={1.6}
          style={{ color: "#3B2A24" }}
        />
      </Link>
      {/* {item.status !== "deleted" && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${item.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-copper/10 hover:text-copper"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.6} />
        </button>
      )} */}
    </div>
  );
}

function StockistCard({
  item,
  onDelete,
}: {
  item: StockistListItem;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/admin/stockists/${item.id}`}
            className="block truncate font-sans text-[15px] font-medium text-espresso"
          >
            {item.name}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 truncate font-sans text-[12px] text-warm-gray">
            <Mail
              className="h-3 w-3 shrink-0"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            {item.email}
          </p>
        </div>
        <RowActions item={item} onDelete={onDelete} />
      </div>

      <div className="mt-2">
        <StockistStatusBadge status={item.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 font-sans text-[13px]">
        <dt className="text-warm-gray">Location</dt>
        <dd className="text-right text-espresso">{locationLabel(item)}</dd>
        <dt className="text-warm-gray">Affiliates</dt>
        <dd className="text-right tabular-nums text-espresso">
          {item.affiliateCount}
        </dd>
        <dt className="text-warm-gray">Profit %</dt>
        <dd className="text-right tabular-nums text-espresso">
          {item.defaultProfitPercent}%
        </dd>
        <dt className="text-warm-gray">Updated</dt>
        <dd className="text-right text-espresso/80">
          {dateFmt.format(new Date(item.updatedAt))}
        </dd>
      </dl>

      <div className="mt-2 text-right">
        <StatusToggle item={item} />
      </div>
    </li>
  );
}
