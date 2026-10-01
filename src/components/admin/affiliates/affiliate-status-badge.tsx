import { Tag } from "antd";
import { CircleDot, EyeOff } from "lucide-react";
import type { AffiliateStatus } from "@/lib/admin/affiliate-queries";

// Status pill for the Affiliates section, built on antd's <Tag> but
// colored entirely from Finasto's own tokens (var(--color-*) from
// globals.css). Same visual language as StockistStatusBadge: green for
// the "good" state, muted neutral otherwise.
//
// "deleted" is intentionally absent: soft-deleted affiliates are filtered
// out of every admin list and detail query, so they never reach a badge.

const CONFIG: Record<
  AffiliateStatus,
  { label: string; icon: typeof CircleDot; bg: string; color: string }
> = {
  active: {
    label: "Active",
    icon: CircleDot,
    bg: "var(--color-green-bg)",
    color: "var(--color-green)",
  },
  inactive: {
    label: "Inactive",
    icon: EyeOff,
    bg: "var(--color-cream)",
    color: "var(--color-warm-gray)",
  },
};

export function AffiliateStatusBadge({ status }: { status: AffiliateStatus }) {
  const { label, icon: Icon, bg, color } = CONFIG[status];

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
      {label}
    </Tag>
  );
}
