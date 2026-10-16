// Server-side read for the stockist Inventory page (read-only). Import only
// from server components. A stockist has no direct access to the stock
// tables: everything comes through my_stockist_inventory(), which returns
// only the signed-in stockist's own packs. The browser never sends an id.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

// At or below this many packs left, a row is flagged "Low stock".
export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = "in_stock" | "low" | "out";

export type InventoryRow = {
  variantId: string;
  productName: string;
  packName: string;
  bought: number;
  sold: number;
  remaining: number; // never below 0
  level: StockLevel;
};

export type Inventory = {
  items: InventoryRow[];
  totals: { bought: number; sold: number; remaining: number };
};

type RawRow = {
  variant_id: string;
  product_name: string;
  pack_name: string;
  bought: number | string;
  sold: number | string;
  remaining: number | string;
};

const num = (v: number | string | null | undefined) => Number(v ?? 0);

export function stockLevel(remaining: number): StockLevel {
  if (remaining <= 0) return "out";
  if (remaining <= LOW_STOCK_THRESHOLD) return "low";
  return "in_stock";
}

export async function getMyInventory(): Promise<Inventory> {
  await requireRole("stockist");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_stockist_inventory");

  if (error) {
    throw new Error(`Failed to load your inventory: ${error.message}`);
  }

  const items = ((data ?? []) as RawRow[]).map((r) => {
    // Clamp at 0 so an over-sold pack reads "Out of stock", not "-2".
    const remaining = Math.max(0, num(r.remaining));
    return {
      variantId: r.variant_id,
      productName: r.product_name,
      packName: r.pack_name,
      bought: num(r.bought),
      sold: num(r.sold),
      remaining,
      level: stockLevel(remaining),
    };
  });

  return {
    items,
    totals: items.reduce(
      (t, i) => ({
        bought: t.bought + i.bought,
        sold: t.sold + i.sold,
        remaining: t.remaining + i.remaining,
      }),
      { bought: 0, sold: 0, remaining: 0 },
    ),
  };
}
