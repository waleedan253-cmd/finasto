import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getStockistCatalog } from "@/lib/stockist/products-queries";
import { NewOrderForm } from "@/components/stockist/bulk-orders/new-order-form";

// Server component: reads the catalog with the signed-in stockist's own
// discount applied, then hands it to the request form.
// getStockistCatalog() calls requireRole("stockist") itself, so the page is
// protected even if the layout check were ever removed.

export const metadata: Metadata = {
  title: "New bulk order",
};

export default async function StockistNewBulkOrderPage() {
  const catalog = await getStockistCatalog();

  return (
    <div>
      <Link
        href="/stockist/bulk-orders"
        className="mb-3 inline-flex items-center gap-1 font-sans text-[13px] text-warm-gray transition-colors hover:text-copper"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Bulk orders
      </Link>

      <h1 className="font-display text-[28px] leading-tight text-espresso">
        New bulk order
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Enter the quantity you want next to each pack. Finasto reviews your
        request and sends the payment details.
      </p>

      {catalog ? (
        <NewOrderForm catalog={catalog} />
      ) : (
        <div className="rounded-2xl border border-border px-6 py-10 text-center font-sans text-[14px] text-warm-gray">
          Your account isn&apos;t ready yet. Please contact support.
        </div>
      )}
    </div>
  );
}
