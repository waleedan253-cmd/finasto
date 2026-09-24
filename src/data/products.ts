// Placeholder product data. Shaped to match the eventual Supabase
// `products` + `product_variants` + `product_country_prices` tables, so
// swapping this for a server-side query later doesn't change consumers.

export type ProductState = "new" | "available" | "low-stock" | "out-of-stock";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string[];
  shortDescription: string;
  price: number;
  currency: string;
  prices: Record<string, number>;
  image: string;
  state: ProductState;
  accentTint: "green" | "blue";
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

export const products: Product[] = [
  {
    id: "velora",
    slug: "velora",
    name: "Velora",
    category: "Wellness Tea",
    tagline: ["Balance", "Calm", "Restore"],
    shortDescription:
      "A soothing blend of natural herbs to help you find balance and inner harmony.",
    price: 129000,
    currency: "IDR",
    prices: { IDR: 129000, MYR: 39.9, GBP: 8.5, USD: 10.9, PKR: 3200 },
    image: "/product/velora.png",
    state: "new",
    accentTint: "green",

    features: ["100% Natural", "20 Tea Bags", "Herbal Blend"],
    origin: "Kintamani, Bali",
    weight: "250g",
    tastingNote: "Chocolate, citrus and a soft floral finish",
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: "blue-moon",
    slug: "blue-moon",
    name: "Blue Moon",
    category: "Wellness Tea",
    tagline: ["Sleep", "Relax", "Rejuvenate"],
    shortDescription:
      "A calming blend of natural herbs to support better sleep and deep relaxation.",
    price: 129000,
    currency: "IDR",
    prices: { IDR: 129000, MYR: 39.9, GBP: 8.5, USD: 10.9, PKR: 3200 },
    image: "/product/bluemoon.png",
    state: "new",
    accentTint: "blue",
    features: ["100% Natural", "20 Tea Bags", "Herbal Blend"],
    origin: "Kintamani, Bali",
    weight: "250g",
    tastingNote: "Chocolate, citrus and a soft floral finish",
    rating: 4.7,
    reviewCount: 18,
  },
];

// Derived, not hardcoded — so a new category or price point added to
// `products` automatically appears in the shop filters with no other
// file needing a change.
export const productCategories: string[] = Array.from(
  new Set(products.map((p) => p.category)),
);

// Returns the product's price in the given currency, or the base price
// if that market has no price yet.
export function getPrice(product: Product, currencyCode: string): number {
  return product.prices[currencyCode] ?? product.price;
}

// Lowest and highest price in the given currency (used by the price slider).
export function getPriceRange(currencyCode: string) {
  const values = products.map((p) => getPrice(p, currencyCode));
  return { min: Math.min(...values), max: Math.max(...values) };
}
