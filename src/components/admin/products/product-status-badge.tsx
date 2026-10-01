import { AlertTriangle, CircleDot, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/admin/product-queries";

// Shared status pill for the admin Products section. Presentational
// only — reused by the list table, the product form header, and the
// detail page later, so status always reads the same way everywhere.

const CONFIG: Record<
  ProductStatus,
  { label: string; icon: typeof CircleDot; className: string }
> = {
  active: {
    label: "Active",
    icon: CircleDot,
    className: "bg-green-bg text-green",
  },
  draft: {
    label: "Draft",
    icon: EyeOff,
    className: "bg-cream text-warm-gray",
  },
  disabled: {
    label: "Disabled",
    icon: EyeOff,
    className: "bg-disabled/15 text-warm-gray",
  },
};

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  const { label, icon: Icon, className: toneClass } = CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[12px] font-medium",
        toneClass,
        className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}

// Separate from status: shown alongside it when stock is low, since a
// product can be Active and Low Stock at the same time.
export function LowStockBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-copper/10 px-2.5 py-1 font-sans text-[12px] font-medium text-copper",
        className,
      )}
    >
      <AlertTriangle className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      Low stock
    </span>
  );
}
