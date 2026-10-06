"use server";

// Server Actions for the affiliate Referral Links page. Each one:
//   1. re-checks requireRole("affiliate"),
//   2. finds the affiliate from the signed-in user, never from an id sent
//      by the browser, and requires the account to be active,
//   3. validates its input with zod,
//   4. writes through the regular cookie-based client, so RLS and the
//      protect-fields trigger still apply as a second line of defense.
//
// An affiliate can only create a link for an ACTIVE product, only one
// live link per product, and "delete" is a soft delete (the row stays,
// the link just stops working), so visits and orders recorded against it
// remain correct.

import { randomInt } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { buildReferralUrl } from "@/lib/affiliate/links-queries";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type CreateLinkResult =
  | { success: true; link: { id: string; code: string; url: string } }
  | { success: false; error: string };

export type DeleteLinkResult =
  | { success: true }
  | { success: false; error: string };

const idSchema = z.string().uuid();

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

// 31 characters with no look-alikes (no 0/O, 1/I/L), so a code is easy
// to read out loud or type by hand. 31^8 is about 850 billion codes.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

// randomInt is cryptographically secure and unbiased, so codes cannot be
// predicted or enumerated.
function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

// The signed-in affiliate's own id. Only an active affiliate may act.
async function getOwnActiveAffiliateId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("id, status")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error || !data || data.status !== "active") return null;
  return data.id as string;
}

/* ------------------------------------------------------------------ */
/* Create                                                               */
/* ------------------------------------------------------------------ */

export async function createMyLink(
  productId: string,
): Promise<CreateLinkResult> {
  const { user } = await requireRole("affiliate");

  if (!idSchema.safeParse(productId).success) {
    return { success: false, error: "Invalid product." };
  }

  const affiliateId = await getOwnActiveAffiliateId(user.id);
  if (!affiliateId) {
    return { success: false, error: "Your account is not active." };
  }

  const supabase = await createClient();

  // The product must exist and be active (re-checked here even though the
  // picker only lists active products, and RLS checks it a third time).
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("status", "active")
    .maybeSingle();

  if (productError) {
    return {
      success: false,
      error: `Could not verify the product: ${productError.message}`,
    };
  }
  if (!product) {
    return { success: false, error: "This product is not available." };
  }

  // Friendly message for the common case. The database enforces the same
  // rule with a unique index, which also covers two clicks at once.
  const { data: existing } = await supabase
    .from("referral_links")
    .select("id")
    .eq("affiliate_id", affiliateId)
    .eq("product_id", productId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error:
        "You already have a link for this product. Delete it first to generate a new one.",
    };
  }

  // A code collision is astronomically unlikely, but the unique constraint
  // is the real guarantee, so retry with a fresh code a few times.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();

    const { data, error } = await supabase
      .from("referral_links")
      .insert({
        affiliate_id: affiliateId,
        product_id: productId,
        code,
      })
      .select("id, code")
      .single();

    if (!error && data) {
      revalidatePath("/affiliate/links");
      return {
        success: true,
        link: {
          id: data.id,
          code: data.code,
          url: buildReferralUrl(data.code),
        },
      };
    }

    if (error?.code === "23505") {
      // One live link per product (e.g. a double click): stop, don't retry.
      if (error.message.includes("one_active_per_product")) {
        return {
          success: false,
          error:
            "You already have a link for this product. Delete it first to generate a new one.",
        };
      }
      continue; // the code was taken: try another one
    }

    return {
      success: false,
      error: `Could not generate the link: ${error?.message}`,
    };
  }

  return {
    success: false,
    error: "Could not generate a unique link. Please try again.",
  };
}

/* ------------------------------------------------------------------ */
/* Delete (soft)                                                        */
/* ------------------------------------------------------------------ */

export async function deleteMyLink(linkId: string): Promise<DeleteLinkResult> {
  const { user } = await requireRole("affiliate");

  if (!idSchema.safeParse(linkId).success) {
    return { success: false, error: "Invalid link." };
  }

  const affiliateId = await getOwnActiveAffiliateId(user.id);
  if (!affiliateId) {
    return { success: false, error: "Your account is not active." };
  }

  const supabase = await createClient();

  // Filtering by affiliate_id means a tampered id can never touch someone
  // else's link. A database trigger sets deleted_at and only allows this
  // one transition (active -> deleted).
  const { data, error } = await supabase
    .from("referral_links")
    .update({ status: "deleted" })
    .eq("id", linkId)
    .eq("affiliate_id", affiliateId)
    .eq("status", "active")
    .select("id");

  if (error) {
    return {
      success: false,
      error: `Could not delete the link: ${error.message}`,
    };
  }
  if (!data || data.length === 0) {
    return { success: false, error: "This link no longer exists." };
  }

  revalidatePath("/affiliate/links");
  return { success: true };
}
