import { Tag } from "antd";
import { AlertTriangle, XCircle } from "lucide-react";

// Shared status pill for stock level — used by both the Inventory table
// and the header notification bell's low-stock alerts, so the two
// always read the same way. Built on antd's <Tag>, colored from Finasto
// tokens only (never antd defaults), same pattern as
// stockist-status-badge.tsx.
//
// Two tiers: "Out of Stock" (0 — genuinely urgent, uses red, the one
// reserved case per the brand rule) and "Low Stock" (1 through the
// threshold — copper, a heads-up, not an emergency).

export function LowStockBadge({ stock }: { stock: number }) {
  const isOut = stock <= 0;

  return (
    <Tag
      variant="filled"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-red) 12%, transparent)",
        color: "var(--color-red)",
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
      {isOut ? (
        <XCircle className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      ) : (
        <AlertTriangle className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      )}
      {isOut ? "Out of Stock" : `Low Stock · ${stock} left`}
    </Tag>
  );
}
