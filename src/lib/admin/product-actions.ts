"use server";

// Server Actions for the admin Products section. Each one re-checks
// requireRole("admin") itself — never trust that only an admin page can
// call these — validates every input with zod, and writes through the
// cookie-based server client so Row Level Security still applies (never
// the service-role key).
//
// Variant/country-price editing uses upsert-by-id, not delete-and-
// reinsert: variant ids are referenced by order_items via a foreign key,
// so rewriting ids on every edit would corrupt historical orders. A
// variant the admin removes is only actually deleted if no order has
// ever referenced it; otherwise the action fails with a clear message
// telling the admin to disable it instead.
//
// Performance: every multi-row write below is a SINGLE batched upsert()
// call, not a loop of one-row-per-request updates. New rows get their id
// generated here (crypto.randomUUID()) before sending, so new and
// existing rows can go through the same one-call upsert together. This
// is what keeps Save fast regardless of how many variants/prices exist.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const statusSchema = z.enum(["active", "disabled", "draft"]);

// price/salePrice/stock are USD amounts and whole units — never trusted
// as already-formatted currency strings from the client.
const variantBase = z.object({
  id: z.string().uuid().optional(), // absent = new variant
  name: z.string().trim().min(1).max(60),
  sku: z.string().trim().max(40).optional(),
  price: z.number().finite().nonnegative(),
  salePrice: z.number().finite().nonnegative().nullable(),
  saleStartsAt: z.string().datetime({ offset: true }).nullable().optional(),
  saleEndsAt: z.string().datetime({ offset: true }).nullable().optional(),
  stock: z.number().int().nonnegative(),
  weight: z.number().finite().nonnegative().nullable(),
  status: statusSchema,
});

// An offer price needs a valid window and must be below the regular price.
const variantSchema = variantBase.superRefine((v, ctx) => {
  if (v.salePrice == null) return;
  if (v.salePrice >= v.price) {
    ctx.addIssue({
      code: "custom",
      path: ["salePrice"],
      message: "Offer price must be below the regular price",
    });
  }
  if (!v.saleStartsAt || !v.saleEndsAt) {
    ctx.addIssue({
      code: "custom",
      path: ["saleEndsAt"],
      message: "Set the offer start and end dates",
    });
  } else if (Date.parse(v.saleEndsAt) <= Date.parse(v.saleStartsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["saleEndsAt"],
      message: "Offer must end after it starts",
    });
  }
});

const countryPriceSchema = z.object({
  id: z.string().uuid().optional(),
  countryId: z.string().uuid(),
  price: z.number().finite().nonnegative(),
  salePrice: z.number().finite().nonnegative().nullable(),
  active: z.boolean(),
});

const imageSchema = z.object({
  id: z.string().uuid().optional(), // absent = new image
  url: z.string().url(),
  path: z.string().min(1),
  alt: z.string().trim().max(200),
  isPrimary: z.boolean(),
});

const productInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(5000),
  category: z.string().trim().max(60).nullable(),
  status: statusSchema,
  featured: z.boolean(),
  tagline: z.array(z.string().trim().min(1).max(24)).max(3),
  shortDescription: z.string().trim().max(160),
  features: z.array(z.string().trim().min(1).max(30)).max(6),
  origin: z.string().trim().max(60).nullable(),
  tastingNote: z.string().trim().max(120).nullable(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  metaTitle: z.string().trim().max(70).nullable(),
  metaDescription: z.string().trim().max(160).nullable(),
  variants: z.array(variantSchema).min(1, "Add at least one variant"),
  countryPrices: z.array(countryPriceSchema),
  images: z.array(imageSchema).max(1),
  // ids the admin removed in the form's variant/country-price repeaters
  deletedVariantIds: z.array(z.string().uuid()),
  deletedCountryPriceIds: z.array(z.string().uuid()),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ActionResult =
  | { success: true; productId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// Postgres foreign-key-violation code.
// Postgres foreign-key-violation code.
const FK_VIOLATION = "23503";

// SKU format: PREFIX-PRODUCT-SIZE, e.g. FIN-VEL-250G
const SKU_PREFIX = "FIN";

function skuPart(s: string, max: number): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, max);
}

/* ------------------------------------------------------------------ */
/* Create                                                               */
/* ------------------------------------------------------------------ */

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: data.name,
      description: data.description,
      category: data.category,
      status: data.status,
      featured: data.featured,
      tagline: data.tagline,
      short_description: data.shortDescription,
      features: data.features,
      origin: data.origin,
      tasting_note: data.tastingNote,
      accent_color: data.accentColor,
      meta_title: data.metaTitle,
      meta_description: data.metaDescription,
    })
    .select("id")
    .single();

  if (productError || !product) {
    return {
      success: false,
      error: `Could not create product: ${productError?.message}`,
    };
  }

  const variantResult = await upsertVariants(
    product.id,
    data.name,
    data.variants,
  );
  if (!variantResult.success) return variantResult;

  const countryPriceResult = await upsertCountryPrices(
    product.id,
    data.countryPrices,
  );
  if (!countryPriceResult.success) return countryPriceResult;

  const imageResult = await insertImages(product.id, data.images);
  if (!imageResult.success) return imageResult;

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true, productId: product.id };
}

/* ------------------------------------------------------------------ */
/* Update                                                               */
/* ------------------------------------------------------------------ */

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const { error: productError } = await supabase
    .from("products")
    .update({
      name: data.name,
      description: data.description,
      category: data.category,
      status: data.status,
      featured: data.featured,
      tagline: data.tagline,
      short_description: data.shortDescription,
      features: data.features,
      origin: data.origin,
      tasting_note: data.tastingNote,
      accent_color: data.accentColor,
      meta_title: data.metaTitle,
      meta_description: data.metaDescription,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (productError) {
    return {
      success: false,
      error: `Could not update product: ${productError.message}`,
    };
  }

  if (data.deletedVariantIds.length > 0) {
    const del = await deleteVariants(data.deletedVariantIds);
    if (!del.success) return del;
  }
  if (data.deletedCountryPriceIds.length > 0) {
    await supabase
      .from("product_country_prices")
      .delete()
      .in("id", data.deletedCountryPriceIds);
  }

  const variantResult = await upsertVariants(id, data.name, data.variants);
  if (!variantResult.success) return variantResult;

  const countryPriceResult = await upsertCountryPrices(id, data.countryPrices);
  if (!countryPriceResult.success) return countryPriceResult;

  const imageResult = await replaceImages(id, data.images);
  if (!imageResult.success) return imageResult;

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/admin/products/${id}`);
  return { success: true, productId: id };
}

/* ------------------------------------------------------------------ */
/* Status / delete                                                     */
/* ------------------------------------------------------------------ */

// Enable/disable without deleting — the safe default the brief asks for
// ("admin should be able to enable/disable a product without deleting it").
export async function setProductStatus(
  id: string,
  status: z.infer<typeof statusSchema>,
): Promise<ActionResult> {
  const tTotal = Date.now();

  const t0 = Date.now();
  await requireRole("admin");
  console.log("[action] requireRole", Date.now() - t0, "ms");

  statusSchema.parse(status);

  const t1 = Date.now();
  const supabase = await createClient();
  console.log("[action] createClient", Date.now() - t1, "ms");

  const t2 = Date.now();
  const { error } = await supabase
    .from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  console.log("[action] update", Date.now() - t2, "ms");

  if (error) return { success: false, error: error.message };

  const t3 = Date.now();
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  console.log("[action] revalidatePath", Date.now() - t3, "ms");

  console.log("[action] TOTAL", Date.now() - tTotal, "ms");
  return { success: true, productId: id };
}

// Hard delete. Only succeeds if the product has never been ordered
// (a foreign-key violation from order_items blocks it) — history must
// never be silently destroyed.
export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === FK_VIOLATION) {
      return {
        success: false,
        error:
          "This product has order history and can't be deleted. Disable it instead.",
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true, productId: id };
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                     */
/* ------------------------------------------------------------------ */

// Existing rows keep their id (updated in place — order_items keeps
// pointing at a valid row); new rows get an id generated here, before
// sending, so ALL rows (new + existing) go through ONE upsert call
// instead of looping one-row-per-request. This is what makes Save fast.
async function upsertVariants(
  productId: string,
  productName: string,
  variants: ProductInput["variants"],
): Promise<ActionResult> {
  if (variants.length === 0) return { success: true, productId };

  const supabase = await createClient();

  // All SKUs already in use, so a generated one never collides.
  const { data: existing } = await supabase
    .from("product_variants")
    .select("sku");
  const taken = new Set<string>(
    (existing ?? []).map((r) => String(r.sku).toUpperCase()),
  );

  function makeSku(size: string): string {
    const base = [
      SKU_PREFIX,
      skuPart(productName, 3) || "PRD",
      skuPart(size, 8) || "STD",
    ].join("-");
    let candidate = base;
    let n = 2;
    while (taken.has(candidate)) candidate = `${base}-${n++}`;
    taken.add(candidate);
    return candidate;
  }

  const rows = variants.map((v) => ({
    id: v.id ?? crypto.randomUUID(),
    product_id: productId,
    name: v.name,
    // Existing SKUs never change on edit; only empty ones are generated.
    sku: v.sku && v.sku.trim() !== "" ? v.sku : makeSku(v.name),
    price: v.price,
    sale_price: v.salePrice,
    // No offer price = no dates, so the database constraint always holds.
    sale_starts_at: v.salePrice == null ? null : (v.saleStartsAt ?? null),
    sale_ends_at: v.salePrice == null ? null : (v.saleEndsAt ?? null),
    stock: v.stock,
    weight: v.weight,
    status: v.status,
  }));

  const { error } = await supabase
    .from("product_variants")
    .upsert(rows, { onConflict: "id" });

  if (error)
    return {
      success: false,
      error: `Could not save variants: ${error.message}`,
    };
  return { success: true, productId };
}

async function deleteVariants(ids: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .in("id", ids);

  if (error) {
    if (error.code === FK_VIOLATION) {
      return {
        success: false,
        error:
          "One of the removed variants has order history and can't be deleted. Set it to disabled instead.",
      };
    }
    return { success: false, error: error.message };
  }
  return { success: true, productId: "" };
}

async function upsertCountryPrices(
  productId: string,
  rows: ProductInput["countryPrices"],
): Promise<ActionResult> {
  if (rows.length === 0) return { success: true, productId };

  const supabase = await createClient();
  const upsertRows = rows.map((r) => ({
    id: r.id ?? crypto.randomUUID(),
    product_id: productId,
    country_id: r.countryId,
    price: r.price,
    sale_price: r.salePrice,
    active: r.active,
  }));

  const { error } = await supabase
    .from("product_country_prices")
    .upsert(upsertRows, { onConflict: "id" });

  if (error)
    return {
      success: false,
      error: `Could not save country pricing: ${error.message}`,
    };
  return { success: true, productId };
}

async function insertImages(
  productId: string,
  images: ProductInput["images"],
): Promise<ActionResult> {
  if (images.length === 0) return { success: true, productId };
  const supabase = await createClient();
  const { error } = await supabase.from("product_images").insert(
    images.map((img) => ({
      product_id: productId,
      url: img.url,
      storage_path: img.path,
      alt: img.alt,
      is_primary: img.isPrimary,
    })),
  );
  if (error)
    return { success: false, error: `Could not save images: ${error.message}` };
  return { success: true, productId };
}

// Images are safe to delete-and-reinsert: no other table references
// product_images.id. (Unlike variants, which order_items points at.)
async function replaceImages(
  productId: string,
  images: ProductInput["images"],
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (error)
    return { success: false, error: `Could not save images: ${error.message}` };
  return insertImages(productId, images);
}
