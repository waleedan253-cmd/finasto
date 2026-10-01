import type { Metadata } from "next";
import { listProducts } from "@/lib/admin/product-queries";
import { getCurrencyContext } from "@/lib/rates";
import { ProductFilters } from "../../../components/admin/products/product-filters";
import { ProductTable } from "../../../components/admin/products/product-table";
import type { ProductStatus } from "@/lib/admin/product-queries";

export const metadata: Metadata = {
  title: "Products — Finasto Admin",
  robots: { index: false, follow: false },
};

const VALID_STATUSES: (ProductStatus | "all")[] = [
  "all",
  "active",
  "draft",
  "disabled",
];

function parseStatus(value: string | undefined): ProductStatus | "all" {
  return VALID_STATUSES.includes(value as ProductStatus | "all")
    ? (value as ProductStatus | "all")
    : "all";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const status = parseStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const tTotal = Date.now();

  const [{ items, total, pageSize }, { rates, currency }] = await Promise.all([
    (async () => {
      const s = Date.now();
      const r = await listProducts({ search, status, page });
      console.log("[page] listProducts", Date.now() - s, "ms");
      return r;
    })(),
    (async () => {
      const s = Date.now();
      const r = await getCurrencyContext();
      console.log("[page] currency", Date.now() - s, "ms");
      return r;
    })(),
  ]);

  console.log("[page] TOTAL data", Date.now() - tTotal, "ms");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Products
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Manage the Finasto catalog — pricing, stock, variants and
          country-specific pricing.
        </p>
      </div>

      <ProductFilters search={search} status={status} resultCount={total} />
      <ProductTable products={items} rates={rates} currency={currency} />

      {total > pageSize && (
        <p className="text-center font-sans text-[13px] text-warm-gray">
          Showing {items.length} of {total} products
        </p>
      )}
    </div>
  );
}
