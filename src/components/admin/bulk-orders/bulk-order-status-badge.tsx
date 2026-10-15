import { Tag } from "antd";
import {
  Ban,
  CheckCircle2,
  FileCheck,
  Hourglass,
  Inbox,
  XCircle,
} from "lucide-react";
import type { BulkOrderStatus } from "@/lib/admin/bulk-order-queries";

// Status pill for bulk orders, built on antd's <Tag> and coloured only
// from Finasto tokens. The colours follow ONE idea, so the admin can read
// the list at a glance:
//   copper  = waiting for YOU (needs an admin action)
//   neutral = waiting for the stockist
//   green   = finished well
//   red     = refused
//   grey    = closed without a decision either way

export const BULK_ORDER_STATUS_LABELS: Record<BulkOrderStatus, string> = {
  requested: "Requested",
  awaiting_payment: "Awaiting payment",
  payment_submitted: "Payment submitted",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

// Reused by the table (highlighting) and the filter tabs. These two
// statuses are the only ones where the admin has something to do.
export function bulkOrderNeedsAction(status: BulkOrderStatus): boolean {
  return status === "requested" || status === "payment_submitted";
}

const CONFIG: Record<
  BulkOrderStatus,
  { icon: typeof Inbox; bg: string; color: string }
> = {
  requested: {
    icon: Inbox,
    bg: "color-mix(in srgb, var(--color-copper) 12%, transparent)",
    color: "var(--color-copper)",
  },
  awaiting_payment: {
    icon: Hourglass,
    bg: "var(--color-cream)",
    color: "var(--color-warm-gray)",
  },
  payment_submitted: {
    icon: FileCheck,
    bg: "color-mix(in srgb, var(--color-copper) 12%, transparent)",
    color: "var(--color-copper)",
  },
  approved: {
    icon: CheckCircle2,
    bg: "var(--color-green-bg)",
    color: "var(--color-green-deep)",
  },
  rejected: {
    icon: XCircle,
    bg: "color-mix(in srgb, var(--color-red) 12%, transparent)",
    color: "var(--color-red)",
  },
  cancelled: {
    icon: Ban,
    bg: "color-mix(in srgb, var(--color-disabled) 20%, transparent)",
    color: "var(--color-warm-gray)",
  },
};

export function BulkOrderStatusBadge({ status }: { status: BulkOrderStatus }) {
  const { icon: Icon, bg, color } = CONFIG[status];

  return (
    <Tag
      bordered={false}
      style={{
        backgroundColor: bg,
        color,
        borderRadius: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        paddingInline: 10,
        paddingBlock: 2,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "inherit",
        margin: 0,
      }}
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      {BULK_ORDER_STATUS_LABELS[status]}
    </Tag>
  );
}
