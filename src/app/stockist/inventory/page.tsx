import type { Metadata } from "next";
import { getMyInventory } from "@/lib/stockist/inventory-queries";
import { InventoryTable } from "@/components/stockist/inventory/inventory-table";

// Server component: reads the stockist's own stock and hands it to the
// read-only table. getMyInventory() calls requireRole("stockist") itself.

export const metadata: Metadata = {
  title: "Inventory",
};

export default async function StockistInventoryPage() {
  const inventory = await getMyInventory();

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Inventory
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        The packs you have bought, how many your affiliates have sold, and what
        is left.
      </p>

      <InventoryTable inventory={inventory} />
    </div>
  );
}
