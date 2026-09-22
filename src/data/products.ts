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
  image: string;
  state: ProductState;
  accentTint: "green" | "blue";
  features: string[];
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
    image: "/product/velora.png",
    state: "new",
    accentTint: "green",
    features: ["100% Natural", "20 Tea Bags", "Herbal Blend"],
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
    image: "/product/bluemoon.png",
    state: "new",
    accentTint: "blue",
    features: ["100% Natural", "20 Tea Bags", "Herbal Blend"],
  },
];
