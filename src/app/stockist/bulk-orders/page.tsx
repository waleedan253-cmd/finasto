import type { Metadata } from "next";
import { listMyBulkOrders } from "@/lib/stockist/bulk-orders-queries";
import { BulkOrdersTable } from "@/components/stockist/bulk-orders/bulk-orders-table";

// Server component: reads the stockist's own orders for the requested page,
// then hands them to the table. listMyBulkOrders() calls
// requireRole("stockist") itself, so the page is protected even if the
// layout check were ever removed.

export const metadata: Metadata = {
  title: "Bulk orders",
};

export default async function StockistBulkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  // Anything that is not a whole number of 1 or more falls back to page 1.
  const parsed = Number.parseInt(page ?? "1", 10);
  const pageNumber = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;

  const result = await listMyBulkOrders({ page: pageNumber });

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Wholesale Orders
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Request packs at your discounted price. Finasto reviews each request and
        sends the payment details.
      </p>

      <BulkOrdersTable result={result} />
    </div>
  );
}
