import {
  Ban,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Hourglass,
  Minus,
  PackageCheck,
  Truck,
  Undo2,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type {
  CommissionState,
  OrderStatus,
  PaymentStatus,
} from "@/lib/affiliate/orders-queries";

// Status pills for the affiliate Orders pages, colored entirely from
// Finasto's own tokens (var(--color-*) from globals.css), same visual
// language as the stockist and affiliate badges: green for the good
// state, muted neutrals otherwise, copper for "needs attention".
//
// This file also holds the shared filter options and type guards, so the
// filter bar, the table and the page all use ONE list of values and labels.
//
// Plain <span> pills (not antd <Tag>) on purpose: no client code is
// needed, so these work in server and client components alike. The
// orders-queries import is type-only and is erased at build time.

type Tone = "success" | "info" | "warn" | "neutral";

const TONES: Record<Tone, { bg: string; color: string }> = {
  success: { bg: "var(--color-green-bg)", color: "var(--color-green)" },
  info: {
    bg: "color-mix(in srgb, var(--color-espresso) 10%, transparent)",
    color: "var(--color-espresso)",
  },
  warn: {
    bg: "color-mix(in srgb, var(--color-copper) 14%, transparent)",
    color: "var(--color-copper)",
  },
  neutral: { bg: "var(--color-cream)", color: "var(--color-warm-gray)" },
};

type Entry = {
  label: string;
  tone: Tone;
  icon: LucideIcon;
  description?: string;
};

/* ------------------------------------------------------------------ */
/* Configuration                                                        */
/* ------------------------------------------------------------------ */

const ORDER_STATUS: Record<OrderStatus, Entry> = {
  pending: { label: "Pending", tone: "warn", icon: Clock },
  paid: { label: "Paid", tone: "success", icon: CheckCircle2 },
  shipped: { label: "Shipped", tone: "info", icon: Truck },
  delivered: { label: "Delivered", tone: "success", icon: PackageCheck },
  cancelled: { label: "Cancelled", tone: "neutral", icon: Ban },
};

const PAYMENT_STATUS: Record<PaymentStatus, Entry> = {
  pending: { label: "Payment pending", tone: "warn", icon: CreditCard },
  paid: { label: "Paid", tone: "success", icon: CheckCircle2 },
  failed: { label: "Payment failed", tone: "warn", icon: XCircle },
  refunded: { label: "Refunded", tone: "neutral", icon: Undo2 },
};

const COMMISSION_STATE: Record<CommissionState, Entry> = {
  unpaid: {
    label: "Not paid yet",
    tone: "neutral",
    icon: Clock,
    description: "The customer's payment has not been confirmed yet.",
  },
  awaiting_shipment: {
    label: "Awaiting shipment",
    tone: "neutral",
    icon: Clock,
    description: "Paid. Your commission starts counting once the order ships.",
  },
  in_window: {
    label: "Refund window open",
    tone: "info",
    icon: Hourglass,
    description:
      "Your commission becomes available once the refund window ends.",
  },
  ready: {
    label: "Ready to request",
    tone: "success",
    icon: BadgeCheck,
    description: "You can add this order to a payout request now.",
  },
  in_request: {
    label: "In payout request",
    tone: "info",
    icon: Wallet,
    description: "This order is part of a payout request.",
  },
  paid_out: {
    label: "Paid out",
    tone: "success",
    icon: CheckCircle2,
    description: "Your commission for this order has been paid.",
  },
  refunded: {
    label: "Refunded",
    tone: "neutral",
    icon: Undo2,
    description: "The order was refunded, so there is no commission.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "neutral",
    icon: Ban,
    description: "The order was cancelled, so there is no commission.",
  },
  none: {
    label: "No commission",
    tone: "neutral",
    icon: Minus,
    description: "No commission applies to this order.",
  },
};

/* ------------------------------------------------------------------ */
/* Shared filter options and guards                                     */
/* ------------------------------------------------------------------ */

type Option<T extends string> = { value: T; label: string };

function toOptions<T extends string>(
  config: Record<T, Entry>,
  order: T[],
): Option<T>[] {
  return order.map((value) => ({ value, label: config[value].label }));
}

export const ORDER_STATUS_OPTIONS = toOptions(ORDER_STATUS, [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
]);

export const PAYMENT_STATUS_OPTIONS = toOptions(PAYMENT_STATUS, [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const COMMISSION_STATE_OPTIONS = toOptions(COMMISSION_STATE, [
  "ready",
  "in_window",
  "awaiting_shipment",
  "in_request",
  "paid_out",
  "unpaid",
  "refunded",
  "cancelled",
  "none",
]);

// Type guards the list page uses to whitelist URL values before they are
// passed on. "paid" is a legacy order status and is accepted too.
export const isOrderStatus = (v: string | undefined): v is OrderStatus =>
  !!v && v in ORDER_STATUS;

export const isPaymentStatus = (v: string | undefined): v is PaymentStatus =>
  !!v && v in PAYMENT_STATUS;

export const isCommissionState = (
  v: string | undefined,
): v is CommissionState => !!v && v in COMMISSION_STATE;

/* ------------------------------------------------------------------ */
/* Pill                                                                 */
/* ------------------------------------------------------------------ */

function Pill({
  entry,
  fallbackLabel,
}: {
  entry: Entry | undefined;
  fallbackLabel: string;
}) {
  // An unknown value (for example a status added later) shows its raw
  // text in a neutral pill instead of crashing the page.
  const {
    label,
    tone,
    icon: Icon,
    description,
  } = entry ?? {
    label: fallbackLabel,
    tone: "neutral" as Tone,
    icon: Minus,
    description: undefined,
  };
  const { bg, color } = TONES[tone];

  return (
    <span
      title={description}
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
        lineHeight: "20px",
        whiteSpace: "nowrap",
      }}
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Pill entry={ORDER_STATUS[status]} fallbackLabel={String(status)} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Pill entry={PAYMENT_STATUS[status]} fallbackLabel={String(status)} />;
}

export function CommissionStateBadge({ state }: { state: CommissionState }) {
  return <Pill entry={COMMISSION_STATE[state]} fallbackLabel={String(state)} />;
}
