"use client";

// Small colored label for a payout request status. Used by the request
// history list here and by the Accounts page. The colors are Ant Design's
// preset colors, so they follow your custom theme.

import { Tag } from "antd";
import type { PayoutStatus } from "@/lib/affiliate/payout-queries";

const CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "gold" },
  approved: { label: "Approved", color: "blue" },
  paid: { label: "Paid", color: "green" },
  rejected: { label: "Rejected", color: "red" },
};

export default function PayoutStatusBadge({
  status,
}: {
  status: PayoutStatus;
}) {
  const { label, color } = CONFIG[status] ?? {
    label: status,
    color: "default",
  };
  return (
    <Tag color={color} style={{ marginInlineEnd: 0 }}>
      {label}
    </Tag>
  );
}
