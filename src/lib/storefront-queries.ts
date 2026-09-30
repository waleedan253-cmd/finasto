import { createClient } from "@/lib/supabase/server";
import type { Product, ProductState } from "@/data/products";
import { convert } from "@/lib/currency";
import { getRates } from "@/lib/rates"; // the file with getRates(); adjust the path

export async function getStorefrontProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, category,featured, tagline, short_description, features, origin,
       tasting_note, accent_color, created_at,
       product_variants ( price, sale_price, sale_starts_at, sale_ends_at, stock, weight, status ),
       product_images ( url, is_primary ),
       product_country_prices ( price, sale_price, active, countries ( currency_code ) )`,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) console.error("[storefront] query failed:", error.message);
  if (!data) return [];

  const rates = await getRates();
  console.log("[storefront] rate currencies:", Object.keys(rates));

  return data.map((p: any): Product => {
    const variants = (p.product_variants ?? []).filter(
      (v: any) => v.status === "active",
    );
    // An offer only counts inside its start/end window.
    const now = Date.now();
    const offerActive = (v: any) =>
      v.sale_price != null &&
      !!v.sale_starts_at &&
      !!v.sale_ends_at &&
      Date.parse(v.sale_starts_at) <= now &&
      now < Date.parse(v.sale_ends_at);
    const eff = (v: any) => (offerActive(v) ? v.sale_price : v.price);
    const cheapest = variants.length
      ? variants.reduce((a: any, b: any) => (eff(b) < eff(a) ? b : a))
      : null;
    const basePrice = cheapest ? eff(cheapest) : 0;
    const compareAt: number | undefined =
      cheapest && offerActive(cheapest) ? cheapest.price : undefined;
    const hasSale = compareAt !== undefined;
    const totalStock = variants.reduce((s: number, v: any) => s + v.stock, 0);
    const isNew = Date.now() - new Date(p.created_at).getTime() < 30 * 86400000;

    let state: ProductState = "available";
    if (totalStock === 0) state = "out-of-stock";
    else if (hasSale) state = "offer";
    else if (totalStock <= 5) state = "low-stock";
    else if (isNew) state = "new";

    const prices: Record<string, number> = { USD: basePrice };
    for (const cp of p.product_country_prices ?? []) {
      const code = cp.countries?.currency_code;
      if (cp.active && code) prices[code] = cp.sale_price ?? cp.price;
    }

    // Every currency with a fresh rate gets a converted price, unless the
    // admin set an explicit country price above (that always wins).
    for (const code of Object.keys(rates)) {
      if (prices[code] === undefined) {
        const c = convert(basePrice, code, rates);
        if (!c.fallback) prices[code] = c.amount;
        else console.log("[storefront] rate unusable:", code, rates[code]);
      }
    }
    console.log("[storefront] prices:", p.name, prices);

    // Regular price in every currency, for the strikethrough.
    const comparePrices: Record<string, number> = {};
    if (compareAt !== undefined) {
      comparePrices.USD = compareAt;
      for (const code of Object.keys(rates)) {
        const c = convert(compareAt, code, rates);
        if (!c.fallback) comparePrices[code] = c.amount;
      }
    }

    const img =
      p.product_images?.find((i: any) => i.is_primary) ?? p.product_images?.[0];
    const weight = variants.find((v: any) => v.weight != null)?.weight;

    return {
      id: p.id,
      featured: p.featured,
      slug: p.id,
      name: p.name,
      category: p.category ?? "Uncategorized",
      tagline: p.tagline ?? [],
      shortDescription: p.short_description ?? "",
      price: basePrice,
      currency: "USD",
      prices,
      compareAtPrice: compareAt,
      comparePrices: compareAt !== undefined ? comparePrices : undefined,
      offerEndsAt: hasSale ? cheapest.sale_ends_at : undefined,
      image: img?.url ?? "/product/placeholder.png",
      state,
      accentColor: p.accent_color,
      features: p.features ?? [],
      weight: weight != null ? `${weight}g` : undefined,
      origin: p.origin ?? "",
      tastingNote: p.tasting_note ?? undefined,
    };
  });
}
