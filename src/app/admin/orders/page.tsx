import type { Metadata } from "next";
import { listOrders } from "@/lib/admin/order-queries";
import { OrderFilters } from "@/components/admin/orders/order-filters";
import { OrderTable } from "@/components/admin/orders/order-table";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/order-queries";

export const metadata: Metadata = {
  title: "Orders — Finasto Admin",
  robots: { index: false, follow: false },
};

const VALID_ORDER_STATUSES: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const VALID_PAYMENT_STATUSES: (PaymentStatus | "all")[] = [
  "all",
  "pending",
  "paid",
  "failed",
  "refunded",
];

function parseOrderStatus(value: string | undefined): OrderStatus | "all" {
  return VALID_ORDER_STATUSES.includes(value as OrderStatus | "all")
    ? (value as OrderStatus | "all")
    : "all";
}

function parsePaymentStatus(value: string | undefined): PaymentStatus | "all" {
  return VALID_PAYMENT_STATUSES.includes(value as PaymentStatus | "all")
    ? (value as PaymentStatus | "all")
    : "all";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const orderStatus = parseOrderStatus(params.status);
  const paymentStatus = parsePaymentStatus(params.payment);
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, pageSize } = await listOrders({
    search,
    orderStatus,
    paymentStatus,
    page,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Orders
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Every order placed at checkout, with referral attribution and
          fulfillment status.
        </p>
      </div>

      <OrderFilters
        search={search}
        orderStatus={orderStatus}
        paymentStatus={paymentStatus}
        resultCount={total}
      />
      <OrderTable orders={items} page={page} pageSize={pageSize} />

      {total > pageSize && (
        <p className="text-center font-sans text-[13px] text-warm-gray">
          Showing {items.length} of {total} orders
        </p>
      )}
    </div>
  );
}
