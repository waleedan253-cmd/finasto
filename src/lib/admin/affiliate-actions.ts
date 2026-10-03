"use server";

// Server Actions for the admin Affiliates section. Each one re-checks
// requireRole("admin"), validates every input with zod, and writes
// through the regular cookie-based server client (RLS applies). The
// service-role admin client is used ONLY for Auth Admin calls
// (inviteUserByEmail / updateUserById) in the invite flow.
//
// The admin only enters name, email, an optional stockist, a status and
// internal notes. phone / country / region are NEVER written here, so an
// admin save can never overwrite what the affiliate fills in later from
// their own dashboard settings.
//
// "deleted" is a soft delete (status = 'deleted'), never a row delete, so
// future orders.affiliate_id references stay valid.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAffiliateEmailTaken } from "@/lib/admin/affiliate-queries";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const statusSchema = z.enum(["active", "inactive", "deleted"]);
const idSchema = z.string().uuid();

const affiliateInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  stockistId: z.string().uuid().nullable(), // optional: null = unassigned
  notes: z.string().trim().max(2000).nullable(),
  status: z.enum(["active", "inactive"]), // "deleted" is a separate action
  commissionPercent: z.number().finite().min(0).max(100),
});

export type AffiliateInput = z.infer<typeof affiliateInputSchema>;

export type ActionResult =
  | {
      success: true;
      affiliateId: string;
      // Set when the record was saved but the invite email failed, so the
      // form can say "created, but invite failed, use Resend invite".
      inviteError?: string;
    }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

// A chosen stockist must exist and be active. Unassigned (null) is fine.
async function validateStockist(
  stockistId: string | null,
): Promise<string | null> {
  if (!stockistId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stockists")
    .select("id")
    .eq("id", stockistId)
    .eq("status", "active")
    .maybeSingle();
  if (error) return `Could not verify the stockist: ${error.message}`;
  if (!data) return "The selected stockist is not available.";
  return null;
}

function flattenErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

/* ------------------------------------------------------------------ */
/* Create (+ invite)                                                    */
/* ------------------------------------------------------------------ */

export async function createAffiliate(
  input: AffiliateInput,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = affiliateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }
  const data = parsed.data;

  if (await isAffiliateEmailTaken(data.email)) {
    return {
      success: false,
      error: "An affiliate with this email already exists.",
      fieldErrors: { email: ["Already in use"] },
    };
  }

  const stockistProblem = await validateStockist(data.stockistId);
  if (stockistProblem) {
    return {
      success: false,
      error: stockistProblem,
      fieldErrors: { stockistId: [stockistProblem] },
    };
  }

  // 1) Our own record first. phone / country / region stay null until the
  //    affiliate completes their profile.
  const supabase = await createClient();
  const { data: affiliate, error: insertError } = await supabase
    .from("affiliates")
    .insert({
      name: data.name,
      email: data.email,
      stockist_id: data.stockistId,
      notes: data.notes,
      status: data.status,
      commission_percent: data.commissionPercent,
    })
    .select("id")
    .single();

  if (insertError || !affiliate) {
    // 23505 = unique violation: two admins submitted the same email at once.
    if (insertError?.code === "23505") {
      return {
        success: false,
        error: "An affiliate with this email already exists.",
        fieldErrors: { email: ["Already in use"] },
      };
    }
    return {
      success: false,
      error: `Could not create affiliate: ${insertError?.message}`,
    };
  }

  // 2) Invite. If this fails the record is already safe; the admin can
  //    retry with "Resend invite" from the list.
  const invite = await inviteAffiliateUser(affiliate.id);

  revalidatePath("/admin/affiliates");
  revalidatePath("/admin/stockists"); // affiliate counts changed

  return invite.success
    ? { success: true, affiliateId: affiliate.id }
    : { success: true, affiliateId: affiliate.id, inviteError: invite.error };
}

/* ------------------------------------------------------------------ */
/* Invite / resend invite                                               */
/* ------------------------------------------------------------------ */

// Takes only the affiliate id and reads name/email from the database, so
// a tampered client call can never send an invite to an arbitrary address.
export async function inviteAffiliateUser(
  affiliateId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  if (!idSchema.safeParse(affiliateId).success) {
    return { success: false, error: "Invalid affiliate." };
  }

  // Regular server client for table access (admin RLS applies).
  const supabase = await createClient();

  const { data: affiliate, error: loadError } = await supabase
    .from("affiliates")
    .select("id, name, email, profile_id, status")
    .eq("id", affiliateId)
    .maybeSingle();

  if (loadError || !affiliate) {
    return { success: false, error: "Affiliate not found." };
  }
  if (affiliate.status === "deleted") {
    return { success: false, error: "This affiliate has been deleted." };
  }
  if (affiliate.profile_id) {
    return { success: false, error: "This affiliate already has an account." };
  }

  // Service-role client ONLY for Auth Admin calls.
  const admin = createAdminClient();

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(affiliate.email, {
      data: { name: affiliate.name }, // display only, never trusted for access
      //   redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/accept`,
    });

  if (inviteError || !invited.user) {
    return {
      success: false,
      error: `Invite could not be sent: ${inviteError?.message}`,
    };
  }

  // Role lives in app_metadata (server-set, not user-editable), which is
  // what is_affiliate() reads from the JWT.
  const { error: metaError } = await admin.auth.admin.updateUserById(
    invited.user.id,
    { app_metadata: { role: "affiliate" } },
  );
  if (metaError) {
    return {
      success: false,
      error: `Could not set affiliate role: ${metaError.message}`,
    };
  }

  // profiles is a thin role/name mirror, keyed by the auth user id.
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: invited.user.id,
    role: "affiliate",
    name: affiliate.name,
    email: affiliate.email,
    status: "active",
  });
  if (profileError) {
    return {
      success: false,
      error: `Could not create affiliate profile: ${profileError.message}`,
    };
  }

  // Link the affiliate row to its Auth user for the dashboard's "who am I".
  const { error: linkError } = await supabase
    .from("affiliates")
    .update({ profile_id: invited.user.id })
    .eq("id", affiliateId);
  if (linkError) {
    return {
      success: false,
      error: `Could not link affiliate account: ${linkError.message}`,
    };
  }

  revalidatePath("/admin/affiliates");
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Update                                                               */
/* ------------------------------------------------------------------ */

// Email is intentionally NOT updated: it is the affiliate's login identity
// in Supabase Auth (the form locks it in edit mode too). phone / country /
// region are not touched either; they belong to the affiliate.
export async function updateAffiliate(
  id: string,
  input: AffiliateInput,
): Promise<ActionResult> {
  await requireRole("admin");

  if (!idSchema.safeParse(id).success) {
    return { success: false, error: "Invalid affiliate." };
  }

  const parsed = affiliateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }
  const data = parsed.data;

  // Only validate the stockist if it is being set (an affiliate may keep a
  // stockist that has since been paused, so don't block unrelated edits).
  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("affiliates")
    .select("stockist_id")
    .eq("id", id)
    .neq("status", "deleted")
    .maybeSingle();

  if (currentError || !current) {
    return { success: false, error: "Affiliate not found." };
  }

  if (data.stockistId && data.stockistId !== current.stockist_id) {
    const stockistProblem = await validateStockist(data.stockistId);
    if (stockistProblem) {
      return {
        success: false,
        error: stockistProblem,
        fieldErrors: { stockistId: [stockistProblem] },
      };
    }
  }

  const { error } = await supabase
    .from("affiliates")
    .update({
      name: data.name,
      stockist_id: data.stockistId,
      notes: data.notes,
      status: data.status,
      commission_percent: data.commissionPercent,
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: `Could not update affiliate: ${error.message}`,
    };
  }

  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${id}`);
  revalidatePath("/admin/stockists");
  return { success: true, affiliateId: id };
}

/* ------------------------------------------------------------------ */
/* Status (active / inactive / deleted, all soft, never a row delete)   */
/* ------------------------------------------------------------------ */

export async function setAffiliateStatus(
  id: string,
  status: z.infer<typeof statusSchema>,
): Promise<ActionResult> {
  await requireRole("admin");

  if (!idSchema.safeParse(id).success) {
    return { success: false, error: "Invalid affiliate." };
  }
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, error: "Invalid status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("affiliates")
    .update({ status: parsedStatus.data })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${id}`);
  revalidatePath("/admin/stockists");
  return { success: true, affiliateId: id };
}
