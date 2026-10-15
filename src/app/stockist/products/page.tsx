import type { Metadata } from "next";
import { getStockistCatalog } from "@/lib/stockist/products-queries";
import { ProductsGrid } from "@/components/stockist/products/products-grid";

// Server component: reads the catalog with the signed-in stockist's own
// discount applied, then hands it to the client grid.
// getStockistCatalog() calls requireRole("stockist") itself, so the page is
// protected even if the layout check were ever removed.

export const metadata: Metadata = {
  title: "Products",
};

export default async function StockistProductsPage() {
  const catalog = await getStockistCatalog();

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Products
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Browse every product and pack at your own price.
      </p>

      {catalog ? (
        <ProductsGrid catalog={catalog} />
      ) : (
        <div className="rounded-2xl border border-border px-6 py-10 text-center font-sans text-[14px] text-warm-gray">
          Your account isn&apos;t ready yet. Please contact support.
        </div>
      )}
    </div>
  );
}
