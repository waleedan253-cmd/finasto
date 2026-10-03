"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { message, Table, Tooltip, type TableColumnsType } from "antd";
import { Mail, Pencil, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AffiliateListItem,
  AffiliateStatus,
} from "@/lib/admin/affiliate-queries";
import {
  inviteAffiliateUser,
  setAffiliateStatus,
} from "@/lib/admin/affiliate-actions";
import { AffiliateStatusBadge } from "@/components/admin/affiliates/affiliate-status-badge";
import { DeleteAffiliateDialog } from "./delete-affiliate-dialog";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function AffiliateTable({
  affiliates,
  page,
  pageSize,
}: {
  affiliates: AffiliateListItem[];
  page: number;
  pageSize: number;
}) {
  const startIndex = (page - 1) * pageSize;
  const [deleteTarget, setDeleteTarget] = useState<AffiliateListItem | null>(
    null,
  );

  if (affiliates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
        <Users
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-espresso">
          No affiliates found
        </p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
          Try a different search or filter, or add your first affiliate.
        </p>
      </div>
    );
  }

  const columns: TableColumnsType<AffiliateListItem> = [
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
      title: "Affiliate",
      dataIndex: "name",
      render: (_, item) => (
        <div className="min-w-0">
          <Link
            href={`/admin/affiliates/${item.id}`}
            className="block truncate font-sans text-[14px] font-medium hover:text-copper"
            style={{ color: "#2E7D32" }}
          >
            {item.name}
          </Link>
          <p className="truncate font-sans text-[12px] text-warm-gray">
            {item.email}
          </p>
          {!item.profileComplete && <ProfileIncompleteHint />}
          {!item.bankComplete && <BankMissingHint />}
        </div>
      ),
    },
    {
      title: "Stockist",
      dataIndex: "stockistName",

      render: (_, item) => <StockistCell item={item} />,
    },
    {
      title: "Commission",
      dataIndex: "commissionPercent",
      // align: "right",
      render: (_, item) => (
        <span className="font-sans text-[13px] tabular-nums text-espresso">
          {item.commissionPercent}%
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (_, item) => <AffiliateStatusBadge status={item.status} />,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      width: 120,
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
      title: "Actions",
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
        <Table<AffiliateListItem>
          columns={columns}
          dataSource={affiliates}
          rowKey="id"
          pagination={false}
          className="finasto-admin-table"
        />
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {affiliates.map((item) => (
          <AffiliateCard
            key={item.id}
            item={item}
            onDelete={() => setDeleteTarget(item)}
          />
        ))}
      </ul>

      <DeleteAffiliateDialog
        affiliate={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                         */
/* ------------------------------------------------------------------ */

// Shown until the affiliate fills in phone + country from their own
// dashboard settings. The admin never has to enter these.
function ProfileIncompleteHint() {
  return (
    <Tooltip title="The affiliate hasn't completed their profile (phone, country) yet">
      <span className="mt-0.5 inline-block font-sans text-[11px] text-warm-gray">
        Profile incomplete
      </span>
    </Tooltip>
  );
}

// Shown until the affiliate saves their bank details from their dashboard.
function BankMissingHint() {
  return (
    <Tooltip title="The affiliate hasn't added their bank details yet">
      <span className="mt-0.5 block font-sans text-[11px] text-warm-gray">
        Bank details missing
      </span>
    </Tooltip>
  );
}

function StockistCell({ item }: { item: AffiliateListItem }) {
  if (!item.stockistId || !item.stockistName) {
    return (
      <span className="font-sans text-[13px] text-warm-gray">Unassigned</span>
    );
  }
  return (
    <Link
      href={`/admin/stockists/${item.stockistId}`}
      className="font-sans text-[13px] text-espresso/80 hover:text-copper"
    >
      {item.stockistName}
    </Link>
  );
}

function InviteButton({ item }: { item: AffiliateListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function resend() {
    startTransition(async () => {
      // Only the id is sent; the server reads name/email from the database.
      const result = await inviteAffiliateUser(item.id);
      if (result.success) {
        message.success(`Invite sent to ${item.email}`);
        router.refresh();
      } else {
        message.error(result.error ?? "Could not send the invite");
      }
    });
  }

  return (
    <Tooltip title="No login yet — click to send the invite email">
      <button
        type="button"
        onClick={resend}
        disabled={isPending}
        className={cn(
          "cursor-pointer font-sans text-[12px] text-copper underline decoration-dotted underline-offset-2 transition-colors hover:text-espresso",
          isPending && "opacity-50",
        )}
      >
        {isPending ? "Sending..." : "Resend invite"}
      </button>
    </Tooltip>
  );
}

function StatusToggle({ item }: { item: AffiliateListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next: AffiliateStatus =
      item.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      const result = await setAffiliateStatus(item.id, next);
      if (result.success) router.refresh();
      else message.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "cursor-pointer font-sans text-[12px] text-warm-gray underline decoration-dotted underline-offset-2 transition-colors hover:text-espresso",
        isPending && "opacity-50",
      )}
    >
      {item.status === "active" ? "Deactivate" : "Reactivate"}
    </button>
  );
}

function RowActions({
  item,
  onDelete,
}: {
  item: AffiliateListItem;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/affiliates/${item.id}`}
        aria-label={`Edit ${item.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-cream-soft hover:text-espresso"
      >
        <Pencil
          className="h-4 w-4"
          strokeWidth={1.6}
          style={{ color: "#3B2A24" }}
        />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${item.name}`}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-copper/10 hover:text-copper"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
      </button>
    </div>
  );
}

function AffiliateCard({
  item,
  onDelete,
}: {
  item: AffiliateListItem;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/admin/affiliates/${item.id}`}
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
          {!item.profileComplete && <ProfileIncompleteHint />}
          {!item.bankComplete && <BankMissingHint />}
        </div>
        <RowActions item={item} onDelete={onDelete} />
      </div>

      <div className="mt-2">
        <AffiliateStatusBadge status={item.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 font-sans text-[13px]">
        <dt className="text-warm-gray">Stockist</dt>
        <dd className="text-right text-espresso">
          <StockistCell item={item} />
        </dd>
        <dt className="text-warm-gray">Commission</dt>
        <dd className="text-right tabular-nums text-espresso">
          {item.commissionPercent}%
        </dd>
        <dt className="text-warm-gray">Updated</dt>
        <dd className="text-right text-espresso/80">
          {dateFmt.format(new Date(item.updatedAt))}
        </dd>
      </dl>

      <div className="mt-2 text-right">
        {item.hasAccount ? (
          <StatusToggle item={item} />
        ) : (
          <InviteButton item={item} />
        )}
      </div>
    </li>
  );
}
