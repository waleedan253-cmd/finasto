import { Tag } from "antd";
import {
  Clock,
  Loader2,
  Truck,
  PackageCheck,
  XCircle,
  CreditCard,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/order-queries";

// Two separate badges on purpose — order fulfillment and payment are
// different concerns that can be true independently (e.g. "Processing"
// + "Payment Pending" is a perfectly normal combination right now,
// before Stripe exists). Same antd <Tag> + Finasto-token pattern as
// every other badge in this build.

const ORDER_CONFIG: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; bg: string; color: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "color-mix(in srgb, var(--color-copper) 12%, transparent)",
    color: "var(--color-copper)",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    bg: "color-mix(in srgb, var(--color-copper) 12%, transparent)",
    color: "var(--color-copper)",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    bg: "color-mix(in srgb, var(--color-green) 12%, transparent)",
    color: "var(--color-green)",
  },
  delivered: {
    label: "Delivered",
    icon: PackageCheck,
    bg: "var(--color-green-bg)",
    color: "var(--color-green-deep)",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "color-mix(in srgb, var(--color-red) 12%, transparent)",
    color: "var(--color-red)",
  },
};

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; icon: typeof Clock; bg: string; color: string }
> = {
  pending: {
    label: "Payment Pending",
    icon: CreditCard,
    bg: "color-mix(in srgb, var(--color-copper) 12%, transparent)",
    color: "var(--color-copper)",
  },
  paid: {
    label: "Paid",
    icon: PackageCheck,
    bg: "var(--color-green-bg)",
    color: "var(--color-green)",
  },
  failed: {
    label: "Payment Failed",
    icon: AlertCircle,
    bg: "color-mix(in srgb, var(--color-red) 12%, transparent)",
    color: "var(--color-red)",
  },
  refunded: {
    label: "Refunded",
    icon: RefreshCcw,
    bg: "color-mix(in srgb, var(--color-copper) 12%, transparent)",
    color: "var(--color-copper)",
  },
};

function BadgeTag({
  config,
}: {
  config: { label: string; icon: typeof Clock; bg: string; color: string };
}) {
  const Icon = config.icon;
  return (
    <Tag
      bordered={false}
      style={{
        backgroundColor: config.bg,
        color: config.color,
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
      {config.label}
    </Tag>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <BadgeTag config={ORDER_CONFIG[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <BadgeTag config={PAYMENT_CONFIG[status]} />;
}
