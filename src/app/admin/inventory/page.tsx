import type { Metadata } from "next";
import { listInventory } from "@/lib/admin/inventory-queries";
import { InventoryFilters } from "@/components/admin/inventory/inventory-filters";
import { InventoryTable } from "@/components/admin/inventory/inventory-table";

export const metadata: Metadata = {
  title: "Inventory — Finasto Admin",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; low?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const lowStockOnly = params.low === "1";
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, pageSize } = await listInventory({
    search,
    lowStockOnly,
    page,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Inventory
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Stock on hand across every product variant. Restock directly here — no
          need to open each product individually.
        </p>
      </div>

      <InventoryFilters
        search={search}
        lowStockOnly={lowStockOnly}
        resultCount={total}
      />
      <InventoryTable items={items} page={page} pageSize={pageSize} />

      {total > pageSize && (
        <p className="text-center font-sans text-[13px] text-warm-gray">
          Showing {items.length} of {total} variants
        </p>
      )}
    </div>
  );
}
