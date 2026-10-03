// Server-side reads for the admin Inventory section. Import only from
// server components, route handlers and server actions.
//
// "Sold" is an honest 0 until Orders exists — this file doesn't guess.
// Once Orders is built, sold = sum of order_items.quantity for that
// variant across paid orders, and this is the one place that changes.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Flat threshold, matching the one already used in product-queries.ts's
// ProductListItem.isLowStock — kept simple on purpose (no per-product
// threshold column), per the "keep it simple" direction for this section.
export const LOW_STOCK_THRESHOLD = 5;

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type InventoryRow = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string; // e.g. "100g"
  sku: string;
  totalStock: number; // current stock on hand
  sold: number; // 0 until Orders exists
  remaining: number; // = totalStock (sold isn't subtracted twice — stock already reflects it once Orders exists)
  isLowStock: boolean;
  updatedAt: string;
};

export type InventoryListResult = {
  items: InventoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_PAGE_SIZE = 20;

export async function listInventory(params: {
  search?: string;
  lowStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<InventoryListResult> {
  await requireRole("admin");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("product_variants")
    .select("id, product_id, name, sku, stock, created_at, products ( name )", {
      count: "exact",
    })
    .order("stock", { ascending: true }) // lowest stock surfaces first
    .range(from, to);

  const search = params.search?.trim();
  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }
  if (params.lowStockOnly) {
    query = query.lte("stock", LOW_STOCK_THRESHOLD);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isMissingTable(error)) {
      return { items: [], total: 0, page, pageSize };
    }
    throw new Error(`Failed to load inventory: ${error.message}`);
  }

  const items: InventoryRow[] = (data ?? []).map((row) => {
    const stock = num(row.stock);
    const productName =
      (row.products as { name?: string } | null)?.name ?? "Unknown product";

    return {
      variantId: row.id,
      productId: row.product_id,
      productName,
      variantName: row.name,
      sku: row.sku,
      totalStock: stock,
      sold: 0,
      remaining: stock,
      isLowStock: stock <= LOW_STOCK_THRESHOLD,
      updatedAt: row.created_at, // product_variants has no updated_at column yet
    };
  });

  return { items, total: count ?? 0, page, pageSize };
}

/* ------------------------------------------------------------------ */
/* Low stock — live state, used by the header bell                     */
/* ------------------------------------------------------------------ */

export async function getLowStockCount(): Promise<number> {
  await requireRole("admin");
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .lte("stock", LOW_STOCK_THRESHOLD)
    .eq("status", "active");

  if (error) {
    if (isMissingTable(error)) return 0;
    return 0; // never fail the header over a badge count
  }
  return count ?? 0;
}

export type LowStockAlert = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  stock: number;
};

const BELL_LOW_STOCK_LIMIT = 5;

export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select("id, product_id, name, stock, products ( name )")
    .lte("stock", LOW_STOCK_THRESHOLD)
    .eq("status", "active")
    .order("stock", { ascending: true })
    .limit(BELL_LOW_STOCK_LIMIT);

  if (error) {
    if (isMissingTable(error)) return [];
    return [];
  }

  return (data ?? []).map((row) => ({
    variantId: row.id,
    productId: row.product_id,
    productName:
      (row.products as { name?: string } | null)?.name ?? "Unknown product",
    variantName: row.name,
    stock: num(row.stock),
  }));
}
