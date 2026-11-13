// Placeholder product data. Shaped to match the eventual Supabase
// `products` + `product_variants` + `product_country_prices` tables, so
// swapping this for a server-side query later doesn't change consumers.

export type ProductState =
  | "new"
  | "available"
  | "low-stock"
  | "out-of-stock"
  | "offer";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  featured: boolean;
  tagline: string[];
   shortDescription: string;
  description: string;
  sections: {
    title: string;
    type: "text" | "list" | "steps";
    content: string[];
  }[];
  price: number;
  currency: string;
  prices: Record<string, number>;
  // Set only while an offer is active: the regular price to strike through.
  compareAtPrice?: number;
  comparePrices?: Record<string, number>;
  offerEndsAt?: string; // ISO date
  image: string;
  state: ProductState;
  accentColor: string;
  features: string[];
  weight?: string;
  origin: string;
  tastingNote?: string;
  rating?: number; // 0 to 5, e.g. 4.8
  reviewCount?: number;
};

// "featured" now; flip to "bestsellers" once real sales data exists —
// no component change required, only this string.
export const collectionMode: "featured" | "bestsellers" = "featured";

export function getCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}

// Price plus the currency it is actually in. If the market has no verified
// price, this returns the USD base price labelled "USD", never a USD number
// wearing another currency's symbol.
export function getPriceInfo(product: Product, currencyCode: string) {
  const own = product.prices[currencyCode];
  return own !== undefined
    ? { amount: own, currency: currencyCode }
    : { amount: product.price, currency: "USD" };
}

// Amount only. Kept so old callers still compile; move them to getPriceInfo.
export function getPrice(product: Product, currencyCode: string): number {
  return getPriceInfo(product, currencyCode).amount;
}

// Regular (struck-through) price in the given currency. Undefined when the
// product has no active offer. Falls back to the USD amount like getPrice.
// Strikethrough price in the SAME currency getPriceInfo returned.
// Undefined when there is no offer, or no regular price in that currency.
export function getComparePrice(
  product: Product,
  currencyCode: string,
): number | undefined {
  if (product.compareAtPrice === undefined) return undefined;
  const { currency } = getPriceInfo(product, currencyCode);
  if (currency === "USD") return product.compareAtPrice;
  return product.comparePrices?.[currency];
}

// Lowest and highest price in the given currency (used by the price slider).
export function getPriceRange(products: Product[], currencyCode: string) {
  if (products.length === 0) return { min: 0, max: 0 };
  // Only products priced in this currency, so USD fallbacks don't skew the slider.
  const values = products
    .filter((p) => p.prices[currencyCode] !== undefined)
    .map((p) => p.prices[currencyCode]);
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}
