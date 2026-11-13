"use client";

// Small colored label for a payout request status. Used by the request
// history list here and by the Accounts page. The colors are Ant Design's
// preset colors, so they follow your custom theme.
import type { PayoutStatus } from "@/lib/affiliate/payout-queries";

type Tone = { bg: string; color: string; border: string };

// Soft tinted pills for light cards, same look as the order status badges.
const TONES: Record<"warn" | "info" | "success" | "danger", Tone> = {
  warn: {
    bg: "color-mix(in srgb, var(--color-aff-gold-400) 25%, transparent)",
    color: "#7A5526",
    border: "color-mix(in srgb, var(--color-aff-gold-600) 40%, transparent)",
  },
  info: {
    bg: "color-mix(in srgb, var(--color-aff-green-900) 8%, transparent)",
    color: "var(--color-aff-green-900)",
    border: "color-mix(in srgb, var(--color-aff-green-900) 20%, transparent)",
  },
  success: {
    bg: "rgba(47, 158, 107, 0.10)",
    color: "#1F7A52",
    border: "rgba(47, 158, 107, 0.30)",
  },
  danger: {
    bg: "rgba(190, 60, 50, 0.08)",
    color: "#A3342B",
    border: "rgba(190, 60, 50, 0.30)",
  },
};

const CONFIG: Record<PayoutStatus, { label: string; tone: keyof typeof TONES }> =
  {
    requested: { label: "Requested", tone: "warn" },
    approved: { label: "Approved", tone: "info" },
    paid: { label: "Paid", tone: "success" },
    rejected: { label: "Rejected", tone: "danger" },
  };

export default function PayoutStatusBadge({
  status,
}: {
  status: PayoutStatus;
}) {
  // An unknown status (added later) shows its raw text in a neutral pill
  // instead of crashing the page.
  const entry = CONFIG[status];
  const label = entry?.label ?? String(status);
  const { bg, color, border } = TONES[entry?.tone ?? "info"];

  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        paddingInline: 10,
        paddingBlock: 2,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "20px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 9999,
          backgroundColor: "currentColor",
        }}
      />
      {label}
    </span>
  );
}