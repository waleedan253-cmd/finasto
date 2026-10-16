import type { Metadata } from "next";
import { listMyStockistOrders } from "@/lib/stockist/orders-queries";
import { StockistOrdersTable } from "@/components/stockist/orders/orders-table";

// Server component: reads the stockist's own orders for the URL filters
// (?q=&status=&page=) and hands them to the read-only table.
// listMyStockistOrders() calls requireRole("stockist") itself, and unknown
// filter values are ignored there.

export const metadata: Metadata = {
  title: "Orders",
};

export default async function StockistOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page } = await searchParams;

  const parsed = Number.parseInt(page ?? "1", 10);
  const pageNumber = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;

  const result = await listMyStockistOrders({
    search: q,
    status,
    page: pageNumber,
  });

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Orders
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Orders your affiliates have placed with your stock, and where each one
        stands.
      </p>

      <StockistOrdersTable
        result={result}
        q={q?.trim() ?? ""}
        status={status ?? ""}
      />
    </div>
  );
}
