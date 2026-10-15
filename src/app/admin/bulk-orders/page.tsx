import type { Metadata } from "next";
import {
  BULK_ORDER_STATUSES,
  getBulkOrderStatusCounts,
  listBulkOrders,
  type BulkOrderStatus,
} from "@/lib/admin/bulk-order-queries";
import { BulkOrderFilters } from "@/components/admin/bulk-orders/bulk-order-filters";
import { BulkOrderTable } from "@/components/admin/bulk-orders/bulk-order-table";

export const metadata: Metadata = {
  title: "Bulk Orders — Finasto Admin",
  robots: { index: false, follow: false },
};

function parseStatus(value: string | undefined): BulkOrderStatus | "all" {
  return BULK_ORDER_STATUSES.includes(value as BulkOrderStatus)
    ? (value as BulkOrderStatus)
    : "all";
}

export default async function AdminBulkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const status = parseStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const [{ items, total, pageSize }, counts] = await Promise.all([
    listBulkOrders({ search, status, page }),
    getBulkOrderStatusCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Bulk Orders
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Stockists buy packs from Finasto at their discount rate. Verify each
          request, send bank details, and approve payment to add the packs to
          their stock.
        </p>
      </div>

      <BulkOrderFilters
        search={search}
        status={status}
        counts={counts}
        resultCount={total}
      />
      <BulkOrderTable orders={items} />

      {total > pageSize && (
        <p className="text-center font-sans text-[13px] text-warm-gray">
          Showing {items.length} of {total} orders
        </p>
      )}
    </div>
  );
}
