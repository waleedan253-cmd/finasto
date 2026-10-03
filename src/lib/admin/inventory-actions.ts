"use server";

// Server Action for the admin Inventory section. Just one action:
// restock() adds a quantity to a variant's existing stock — it never
// overwrites. Same security pattern as every other admin action:
// requireRole("admin") first, zod validation, writes through the
// cookie-based server client (RLS applies).

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/inventory-queries";
import { createNotification } from "@/lib/admin/notifications";

const restockInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(100_000),
});

// Correction allows a negative delta (fixing a wrong restock entry),
// unlike restock() which only ever adds. Still can never be used to
// overwrite a total directly — it's always current + delta.
const adjustStockInputSchema = z.object({
  variantId: z.string().uuid(),
  delta: z
    .number()
    .int()
    .refine((n) => n !== 0, "Enter a non-zero amount"),
});

export type RestockResult =
  | { success: true; newStock: number }
  | { success: false; error: string };

export async function restock(
  variantId: string,
  quantity: number,
): Promise<RestockResult> {
  await requireRole("admin");

  const parsed = restockInputSchema.safeParse({ variantId, quantity });
  if (!parsed.success) {
    return { success: false, error: "Enter a valid quantity greater than 0." };
  }

  const supabase = await createClient();

  // Read the current stock first so the response can show the real new
  // total, and so this works correctly even without a database-level
  // increment function — stock = stock + qty, never an overwrite.
  const { data: variant, error: readError } = await supabase
    .from("product_variants")
    .select("id, stock, name, product_id, products ( name )")
    .eq("id", parsed.data.variantId)
    .maybeSingle();

  if (readError || !variant) {
    return {
      success: false,
      error: "That product variant could not be found.",
    };
  }

  const newStock = Number(variant.stock) + parsed.data.quantity;

  const { error: updateError } = await supabase
    .from("product_variants")
    .update({ stock: newStock })
    .eq("id", parsed.data.variantId);

  if (updateError) {
    return {
      success: false,
      error: `Could not update stock: ${updateError.message}`,
    };
  }

  // If this restock brought it back above the threshold, it's good news,
  // not a new alert — only notify when it's still low after restocking
  // (e.g. admin added 2 units to a variant that needs 50).
  if (newStock <= LOW_STOCK_THRESHOLD) {
    const productName =
      (variant.products as { name?: string } | null)?.name ?? "A product";
    await createNotification({
      type: "low_stock",
      title: "Still low on stock",
      message: `${productName} (${variant.name}) has ${newStock} left after restocking.`,
      link: "/admin/inventory",
    });
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true, newStock };
}

// Fixes a wrong stock entry. delta can be negative (admin entered 50
// when it should've been 5) or positive — the only difference from
// restock() is that this allows going down, and never fires a
// "still low" notification on its own (a deliberate correction isn't
// a surprise restock the admin needs to be told about).
export async function adjustStock(
  variantId: string,
  delta: number,
): Promise<RestockResult> {
  await requireRole("admin");

  const parsed = adjustStockInputSchema.safeParse({ variantId, delta });
  if (!parsed.success) {
    return { success: false, error: "Enter a non-zero adjustment amount." };
  }

  const supabase = await createClient();

  const { data: variant, error: readError } = await supabase
    .from("product_variants")
    .select("id, stock")
    .eq("id", parsed.data.variantId)
    .maybeSingle();

  if (readError || !variant) {
    return {
      success: false,
      error: "That product variant could not be found.",
    };
  }

  const newStock = Number(variant.stock) + parsed.data.delta;
  if (newStock < 0) {
    return {
      success: false,
      error: `That would make stock negative (currently ${variant.stock}). Enter a smaller correction.`,
    };
  }

  const { error: updateError } = await supabase
    .from("product_variants")
    .update({ stock: newStock })
    .eq("id", parsed.data.variantId);

  if (updateError) {
    return {
      success: false,
      error: `Could not update stock: ${updateError.message}`,
    };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true, newStock };
}
