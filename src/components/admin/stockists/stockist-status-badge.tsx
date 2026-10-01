import { Tag } from "antd";
import { CircleDot, EyeOff, Trash2 } from "lucide-react";
import type { StockistStatus } from "@/lib/admin/stockist-queries";

// Status pill for the Stockists section, built on antd's <Tag> but
// colored entirely from Finasto's own tokens (var(--color-*) from
// globals.css) — never antd's default tag palette. Same visual language
// as ProductStatusBadge: green for the "good" state, muted neutrals
// otherwise, red reserved for real errors only.

const CONFIG: Record<
  StockistStatus,
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
  //   deleted: {
  //     label: "Deleted",
  //     icon: Trash2,
  //     bg: "color-mix(in srgb, var(--color-disabled) 20%, transparent)",
  //     color: "var(--color-warm-gray)",
  //   },
};

export function StockistStatusBadge({ status }: { status: StockistStatus }) {
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
