// Server-side reads for the admin Products section. Import only from
// server components, route handlers and server actions — never from a
// "use client" file.
//
// Defense in depth: every exported function re-checks requireRole("admin")
// itself, the same rule as product-actions.ts, rather than trusting that
// only admin/layout.tsx ever calls into this file.
//
// Schema assumed (matches the RTCO brief): products, product_variants,
// product_country_prices. Until these tables exist, every function
// returns a safe empty result instead of crashing the page.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type ProductStatus = "active" | "disabled" | "draft";

// One row in the Products table/list.
export type ProductListItem = {
  id: string;
  name: string;
  // slug: string;
  category: string | null;
  status: ProductStatus;
  featured: boolean;
  thumbnailUrl: string | null;
  skus: string[]; // one per pack, sorted
  // Lowest and highest price across this product's variants, in USD
  // (the base currency). Equal when there is only one variant/price.
  priceMin: number;
  priceMax: number;
  totalStock: number;
  isLowStock: boolean;
  updatedAt: string;
};

export type ProductListResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  stock: number;
  weight: number | null;
  status: ProductStatus;
};

export type ProductCountryPrice = {
  id: string;
  countryId: string;
  countryName: string;
  currencyCode: string;
  price: number;
  salePrice: number | null;
  active: boolean;
};

export type ProductDetail = {
  id: string;
  name: string;
  // slug: string;
  description: string;
  shortDescription: string;
  tagline: string[];
  features: string[];
  origin: string | null;
  tastingNote: string | null;
  accentColor: string;
  category: string | null;
  status: ProductStatus;
  featured: boolean;
  images: {
    id: string;
    url: string;
    alt: string;
    path: string;
    isPrimary: boolean;
  }[];
  variants: ProductVariant[];
  countryPrices: ProductCountryPrice[];
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const LOW_STOCK_THRESHOLD = 5;
const DEFAULT_PAGE_SIZE = 20;

export async function listProducts(params: {
  search?: string;
  status?: ProductStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<ProductListResult> {
  await requireRole("admin");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      id, name,  category, status, featured, updated_at,
      product_images ( url, is_primary ),
      product_variants ( sku, price, sale_price, stock, status )
    `,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  const search = params.search?.trim();
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isMissingTable(error)) {
      return { items: [], total: 0, page, pageSize };
    }
    throw new Error(`Failed to load products: ${error.message}`);
  }

  const items: ProductListItem[] = (data ?? []).map((row) => {
    const variants = Array.isArray(row.product_variants)
      ? row.product_variants
      : [];
    const images = Array.isArray(row.product_images) ? row.product_images : [];

    const effectivePrices = variants.map((v) =>
      v.sale_price != null ? num(v.sale_price) : num(v.price),
    );
    const totalStock = variants.reduce((sum, v) => sum + num(v.stock), 0);
    const primaryImage =
      images.find((img) => img.is_primary)?.url ?? images[0]?.url ?? null;

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      status: row.status,
      featured: !!row.featured,
      thumbnailUrl: primaryImage,
      skus: variants
        .map((v) => String(v.sku ?? ""))
        .filter(Boolean)
        .sort(),
      priceMin: effectivePrices.length ? Math.min(...effectivePrices) : 0,
      priceMax: effectivePrices.length ? Math.max(...effectivePrices) : 0,
      totalStock,
      isLowStock: variants.length > 0 && totalStock <= LOW_STOCK_THRESHOLD,
      updatedAt: row.updated_at,
    };
  });

  return { items, total: count ?? 0, page, pageSize };
}

/* ------------------------------------------------------------------ */
/* Single product (for the edit form)                                  */
/* ------------------------------------------------------------------ */

export async function getProductById(
  id: string,
): Promise<ProductDetail | null> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
            id, name, description, category, status, featured,
      short_description, tagline, features, origin, tasting_note, accent_color,
      meta_title, meta_description, created_at, updated_at,
      product_images ( id, url, alt, storage_path, is_primary ),
      product_variants ( id, name, sku, price, sale_price, sale_starts_at, sale_ends_at, stock, weight, status ),
      product_country_prices (
        id, active, price, sale_price,
        countries ( id, name, currency_code )
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return null;
    throw new Error(`Failed to load product: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? "",
    shortDescription: data.short_description ?? "",
    tagline: data.tagline ?? [],
    features: data.features ?? [],
    origin: data.origin ?? null,
    tastingNote: data.tasting_note ?? null,
    accentColor: data.accent_color ?? "#2f855a",
    category: data.category,
    status: data.status,
    featured: !!data.featured,
    images: (data.product_images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? "",
      path: img.storage_path,
      isPrimary: !!img.is_primary,
    })),
    variants: (data.product_variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: num(v.price),
      salePrice: v.sale_price != null ? num(v.sale_price) : null,
      saleStartsAt: v.sale_starts_at ?? null,
      saleEndsAt: v.sale_ends_at ?? null,
      stock: num(v.stock),
      weight: v.weight != null ? num(v.weight) : null,
      status: v.status,
    })),
    countryPrices: (data.product_country_prices ?? []).map((cp) => {
      const c = Array.isArray(cp.countries) ? cp.countries[0] : cp.countries;
      return {
        id: cp.id,
        countryId: c?.id ?? "",
        countryName: c?.name ?? "Unknown",
        currencyCode: c?.currency_code ?? "USD",
        price: num(cp.price),
        salePrice: cp.sale_price != null ? num(cp.sale_price) : null,
        active: !!cp.active,
      };
    }),
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Used by the create form to catch a duplicate slug before submit, and
// by the server action as a defensive re-check.
// s
export type Country = { id: string; name: string; currencyCode: string };

export async function getCountries(): Promise<Country[]> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countries")
    .select("id, name, currency_code")
    .eq("active", true)
    .order("name");

  if (error) {
    if (isMissingTable(error)) return [];
    throw new Error(`Failed to load countries: ${error.message}`);
  }
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    currencyCode: c.currency_code,
  }));
}

export type FieldSuggestions = {
  tagline: string[];
  features: string[];
  origin: string[];
  tastingNote: string[];
  category: string[];
  size: string[];
};

export async function getFieldSuggestions(): Promise<FieldSuggestions> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "tagline, features, origin, tasting_note, category, product_variants ( name )",
    );

  const uniq = (arr: (string | null | undefined)[]) =>
    Array.from(
      new Set(arr.map((s) => s?.trim()).filter((s): s is string => !!s)),
    ).sort((a, b) => a.localeCompare(b));

  const rows = data ?? [];
  return {
    tagline: uniq(rows.flatMap((r) => r.tagline ?? [])),
    features: uniq(rows.flatMap((r) => r.features ?? [])),
    origin: uniq(rows.map((r) => r.origin)),
    tastingNote: uniq(rows.map((r) => r.tasting_note)),
    category: uniq(rows.map((r) => r.category)),
    size: uniq(
      rows.flatMap((r: any) =>
        (r.product_variants ?? []).map((v: any) => v.name),
      ),
    ),
  };
}
/* ------------------------------------------------------------------ */
/* Public storefront                                                    */
/* ------------------------------------------------------------------ */

export type StorefrontProductRow = {
  id: string;
  name: string;
  category: string | null;
  shortDescription: string;
  tagline: string[];
  features: string[];
  origin: string | null;
  tastingNote: string | null;
  accentColor: string;
  imageUrl: string;
  createdAt: string;
  variants: {
    price: number;
    salePrice: number | null;
    stock: number;
    weight: number | null;
  }[];
  countryPrices: { currencyCode: string; price: number }[];
};

// No requireRole here: this is for visitors. RLS limits rows to active products.
export async function getStorefrontProducts(): Promise<StorefrontProductRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, category, short_description, tagline, features, origin,
      tasting_note, accent_color, created_at,
      product_images ( url, is_primary ),
      product_variants ( price, sale_price, stock, weight ),
      product_country_prices ( active, price, countries ( currency_code ) )
    `,
    )
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) return [];
    throw new Error(`Failed to load storefront products: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const images = Array.isArray(row.product_images) ? row.product_images : [];
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      shortDescription: row.short_description ?? "",
      tagline: row.tagline ?? [],
      features: row.features ?? [],
      origin: row.origin ?? null,
      tastingNote: row.tasting_note ?? null,
      accentColor: row.accent_color ?? "#2f855a",
      imageUrl: images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? "",
      createdAt: row.created_at,
      variants: (row.product_variants ?? []).map((v) => ({
        price: num(v.price),
        salePrice: v.sale_price != null ? num(v.sale_price) : null,
        stock: num(v.stock),
        weight: v.weight != null ? num(v.weight) : null,
      })),
      countryPrices: (row.product_country_prices ?? [])
        .filter((cp) => cp.active)
        .map((cp) => {
          const c = Array.isArray(cp.countries)
            ? cp.countries[0]
            : cp.countries;
          return {
            currencyCode: c?.currency_code ?? "USD",
            price: num(cp.price),
          };
        }),
    };
  });
}
