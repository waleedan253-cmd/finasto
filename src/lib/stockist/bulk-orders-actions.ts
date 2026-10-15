"use server";

// Server Actions for the stockist Bulk Orders pages. Each one:
//   1. re-checks requireRole("stockist"),
//   2. validates its input (zod, plus a real file check for the proof),
//   3. calls a database function that finds the stockist from the signed-in
//      user and checks the order's state. The browser never sends a
//      stockist id, a price or a total: prices are calculated by the
//      database from the pack's regular price and the stockist's discount.
//
// The database functions raise short, plain-English messages ("Coffee (10
// Bags) is not available in that quantity"), which are shown to the
// stockist as they are.
//
// Payment proof upload: the file goes to a private bucket under
//   <stockist_id>/<order_id>/<random name>.<ext>
// and the name is chosen HERE, never by the browser. The file's real type
// is checked from its first bytes, not from the name or the type the
// browser claims.
//
// NOTE: uploads go through a Server Action, whose request size is limited
// to 1 MB by default. Proofs can be up to 5 MB, so next.config needs
//   experimental: { serverActions: { bodySizeLimit: "6mb" } }

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { PROOF_BUCKET } from "@/lib/stockist/bulk-orders-queries";

/* ------------------------------------------------------------------ */
/* Types and validation                                                 */
/* ------------------------------------------------------------------ */

export type SubmitBulkOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export type SimpleResult =
  | { success: true }
  | { success: false; error: string };

const idSchema = z.string().uuid();

const submitSchema = z
  .object({
    items: z
      .array(
        z.object({
          variantId: z.string().uuid(),
          quantity: z.number().int().min(1).max(100000),
        }),
      )
      .min(1, "Add at least one pack")
      .max(50, "An order can have at most 50 packs"),
    note: z.string().trim().max(500).nullable(),
  })
  .refine(
    (v) => new Set(v.items.map((i) => i.variantId)).size === v.items.length,
    { message: "Each pack can only be added once" },
  );

export type SubmitBulkOrderInput = z.infer<typeof submitSchema>;

const referenceSchema = z.string().trim().max(100);

/* ------------------------------------------------------------------ */
/* Submit a request                                                     */
/* ------------------------------------------------------------------ */

export async function submitBulkOrder(
  input: SubmitBulkOrderInput,
): Promise<SubmitBulkOrderResult> {
  await requireRole("stockist");

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check your order.",
    };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { data: orderId, error } = await supabase.rpc("submit_bulk_order", {
    p_items: data.items.map((i) => ({
      variant_id: i.variantId,
      quantity: i.quantity,
    })),
    p_note: data.note || null,
  });

  if (error || !orderId) {
    return {
      success: false,
      error: error?.message ?? "Could not submit your order.",
    };
  }

  revalidatePath("/stockist/bulk-orders");
  return { success: true, orderId: orderId as string };
}

/* ------------------------------------------------------------------ */
/* Cancel (only while the admin has not sent bank details yet)         */
/* ------------------------------------------------------------------ */

export async function cancelMyBulkOrder(
  orderId: string,
): Promise<SimpleResult> {
  await requireRole("stockist");

  if (!idSchema.safeParse(orderId).success) {
    return { success: false, error: "Invalid order." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_bulk_order", {
    p_order_id: orderId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/stockist/bulk-orders");
  revalidatePath(`/stockist/bulk-orders/${orderId}`);
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Proof of payment                                                     */
/* ------------------------------------------------------------------ */

const MAX_PROOF_BYTES = 5 * 1024 * 1024; // the bucket enforces 5 MB too

type ProofType = { contentType: string; ext: string };

// Look at the file's first bytes. Returns null for anything that is not a
// JPEG, PNG, WebP or PDF, whatever the file is called.
function sniffProofType(head: Uint8Array): ProofType | null {
  const startsWith = (...bytes: number[]) =>
    bytes.every((b, i) => head[i] === b);

  if (startsWith(0xff, 0xd8, 0xff)) {
    return { contentType: "image/jpeg", ext: "jpg" };
  }
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
    return { contentType: "image/png", ext: "png" };
  }
  if (startsWith(0x25, 0x50, 0x44, 0x46)) {
    return { contentType: "application/pdf", ext: "pdf" };
  }
  // WebP: "RIFF" + 4 size bytes + "WEBP"
  if (
    startsWith(0x52, 0x49, 0x46, 0x46) &&
    head[8] === 0x57 &&
    head[9] === 0x45 &&
    head[10] === 0x42 &&
    head[11] === 0x50
  ) {
    return { contentType: "image/webp", ext: "webp" };
  }
  return null;
}

// FormData fields: orderId, reference (optional), file.
export async function submitBulkPaymentProof(
  formData: FormData,
): Promise<SimpleResult> {
  await requireRole("stockist");

  const orderId = formData.get("orderId");
  if (typeof orderId !== "string" || !idSchema.safeParse(orderId).success) {
    return { success: false, error: "Invalid order." };
  }

  const referenceRaw = formData.get("reference");
  const reference = referenceSchema.safeParse(
    typeof referenceRaw === "string" ? referenceRaw : "",
  );
  if (!reference.success) {
    return {
      success: false,
      error: "The payment reference is too long (100 characters at most).",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose the proof of payment to upload." };
  }
  if (file.size > MAX_PROOF_BYTES) {
    return { success: false, error: "The file is too large (5 MB at most)." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffProofType(bytes.subarray(0, 12));
  if (!type) {
    return {
      success: false,
      error: "Upload a JPG, PNG, WebP or PDF file.",
    };
  }

  const supabase = await createClient();

  // Check the order BEFORE uploading, so a wrong state never leaves a stray
  // file behind. This also proves the order belongs to this stockist.
  const { data: order, error: orderError } = await supabase.rpc(
    "my_bulk_order",
    { p_order_id: orderId },
  );
  if (orderError) return { success: false, error: orderError.message };
  const status = (order as { status?: string } | null)?.status;
  if (!status) return { success: false, error: "Order not found." };
  if (status !== "awaiting_payment") {
    return {
      success: false,
      error: "Payment proof cannot be added to this order right now.",
    };
  }

  const { data: profile, error: profileError } = await supabase.rpc(
    "my_stockist_profile",
  );
  const stockistId = (profile as { id: string }[] | null)?.[0]?.id;
  if (profileError || !stockistId) {
    return { success: false, error: "Could not find your stockist account." };
  }

  const path = `${stockistId}/${orderId}/${randomUUID()}.${type.ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, bytes, { contentType: type.contentType, upsert: false });
  if (uploadError) {
    return {
      success: false,
      error: `Could not upload the file: ${uploadError.message}`,
    };
  }

  const { error } = await supabase.rpc("submit_bulk_payment_proof", {
    p_order_id: orderId,
    p_storage_path: path,
    p_reference: reference.data || null,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/stockist/bulk-orders");
  revalidatePath(`/stockist/bulk-orders/${orderId}`);
  return { success: true };
}
