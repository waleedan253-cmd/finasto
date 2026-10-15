// Server-side read for the stockist Products page. Import only from server
// components, never from a "use client" file (client files may import the
// TYPES below, which are erased at build).
//
// A stockist buys by the pack (a product_variants row) at the retail price
// minus the discount rate the admin set for them. All amounts are USD.
//
// Rules used here
//   * The discount comes off the REGULAR pack price (product_variants.price).
//     Consumer offers (sale_price) are for shop customers and are ignored,
//     so a stockist's price never moves with a shop promotion.
//   * Only active products and active packs are listed. The existing
//     read policies on products / variants / images already allow this, so
//     no new SQL is needed.
//   * Finasto's exact stock is not shown, only whether a pack is available.
//   * The price shown here is for information. When a bulk order is
//     submitted, the database calculates the price again and saves it with
//     the order, so this page can never decide what a stockist pays.
//
// The discount rate is read through my_stockist_profile(), so it is always
// the signed-in stockist's own rate.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type StockistPack = {
  id: string;
  name: string; // "20 Bags", "250g Pouch"
  weight: number | null; // grams
  retailUsd: number; // regular shop price
  yourPriceUsd: number; // retail minus the stockist's discount
  inStock: boolean;
};

export type StockistProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  packs: StockistPack[]; // cheapest first, never empty
};

export type StockistCatalog = {
  discountPercent: number;
  categories: string[]; // for the filter, sorted
  products: StockistProduct[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const PLACEHOLDER_IMAGE = "/product/placeholder.png";

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Whole cents, rounded the same way the database rounds (half away from
// zero on a positive number).
export function discountedPrice(
  retail: number,
  discountPercent: number,
): number {
  return Math.round(retail * (100 - discountPercent)) / 100;
}

type RawVariant = {
  id: string;
  name: string;
  price: number | string;
  weight: number | string | null;
  stock: number | string;
  status: string;
};

type RawProduct = {
  id: string;
  name: string;
  category: string | null;
  product_variants: RawVariant[] | null;
  product_images: { url: string; is_primary: boolean }[] | null;
};

type RawProfile = { discount_percent: number | string | null };

/* ------------------------------------------------------------------ */
/* Read                                                                 */
/* ------------------------------------------------------------------ */

// Returns null when the login has no stockist row (the layout normally
// blocks that first, so this is only a safety net).
export async function getStockistCatalog(): Promise<StockistCatalog | null> {
  await requireRole("stockist");
  const supabase = await createClient();

  const [profileResult, productsResult] = await Promise.all([
    supabase.rpc("my_stockist_profile"),
    supabase
      .from("products")
      .select(
        `id, name, category,
         product_variants ( id, name, price, weight, stock, status ),
         product_images ( url, is_primary )`,
      )
      .eq("status", "active")
      .order("name"),
  ]);

  if (profileResult.error) {
    throw new Error(
      `Failed to load your profile: ${profileResult.error.message}`,
    );
  }
  if (productsResult.error) {
    throw new Error(`Failed to load products: ${productsResult.error.message}`);
  }

  const profile = (profileResult.data as RawProfile[] | null)?.[0];
  if (!profile) return null;

  const discountPercent = num(profile.discount_percent);
  const rows = (productsResult.data ?? []) as unknown as RawProduct[];

  const products: StockistProduct[] = [];
  for (const p of rows) {
    const packs: StockistPack[] = (p.product_variants ?? [])
      .filter((v) => v.status === "active")
      .map((v) => {
        const retail = num(v.price);
        return {
          id: v.id,
          name: v.name,
          weight: v.weight == null ? null : num(v.weight),
          retailUsd: retail,
          yourPriceUsd: discountedPrice(retail, discountPercent),
          inStock: num(v.stock) > 0,
        };
      })
      .sort((a, b) => a.retailUsd - b.retailUsd);

    if (packs.length === 0) continue; // nothing to buy

    const images = p.product_images ?? [];
    const image = (images.find((i) => i.is_primary) ?? images[0])?.url;

    products.push({
      id: p.id,
      name: p.name,
      category: p.category ?? "Uncategorized",
      image: image ?? PLACEHOLDER_IMAGE,
      packs,
    });
  }

  const categories = Array.from(new Set(products.map((p) => p.category))).sort(
    (a, b) => a.localeCompare(b),
  );

  return { discountPercent, categories, products };
}
