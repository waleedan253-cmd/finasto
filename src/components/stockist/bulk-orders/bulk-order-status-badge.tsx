import type { BulkOrderStatus } from "@/lib/stockist/bulk-orders-queries";

// The status of a bulk order, as a small coloured pill, plus one plain
// sentence saying what happens next. Used by the orders list and the order
// page. No "use client": it has no state, so server and client components
// can both use it.

export const BULK_STATUS_LABEL: Record<BulkOrderStatus, string> = {
  requested: "Waiting for review",
  awaiting_payment: "Payment needed",
  payment_submitted: "Checking payment",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

// What the stockist should know or do next, shown on the order page.
export const BULK_STATUS_HINT: Record<BulkOrderStatus, string> = {
  requested:
    "Finasto is reviewing your request. You can still cancel it until the bank details are sent.",
  awaiting_payment:
    "Pay the total using the bank details below, then upload your proof of payment.",
  payment_submitted: "We received your proof of payment and are checking it.",
  approved: "Payment confirmed. The packs have been added to your stock.",
  rejected: "This request was declined. See the note below.",
  cancelled: "This order was cancelled.",
};

const TONE: Record<BulkOrderStatus, string> = {
  requested: "bg-cream-soft text-espresso border border-border",
  awaiting_payment: "bg-copper/10 text-copper",
  payment_submitted: "bg-cream-soft text-espresso border border-border-strong",
  approved: "bg-green-bg text-green",
  rejected: "bg-copper/10 text-copper",
  cancelled: "bg-cream-soft text-warm-gray border border-border",
};

export function BulkOrderStatusBadge({ status }: { status: BulkOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 font-sans text-[12px] font-medium ${TONE[status]}`}
    >
      {BULK_STATUS_LABEL[status]}
    </span>
  );
}
