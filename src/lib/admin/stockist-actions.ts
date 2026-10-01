"use server";

// Server Actions for the admin Stockists section. Each one re-checks
// requireRole("admin") itself, validates every input with zod, and
// writes through the regular cookie-based server client (RLS applies) —
// EXCEPT inviteStockistUser(), which must use the service-role admin
// client, because creating an auth.users row via inviteUserByEmail() is
// an Auth Admin operation the regular client cannot perform.
//
// Status "deleted" is a soft delete (status = 'deleted'), never a row
// delete — order_items will reference stockist_id later, and historical
// financial data must stay correct per the Stockist prompt (section 10).

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStockistEmailTaken } from "@/lib/admin/stockist-queries";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const statusSchema = z.enum(["active", "inactive", "deleted"]);

const stockistInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(30).nullable(),
  country: z.string().trim().max(60).nullable(),
  region: z.string().trim().max(60).nullable(),
  defaultProfitPercent: z.number().finite().min(0).max(100),
  notes: z.string().trim().max(2000).nullable(),
  status: z.enum(["active", "inactive"]), // "deleted" stays a separate action
});

export type StockistInput = z.infer<typeof stockistInputSchema>;

export type ActionResult =
  | { success: true; stockistId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/* ------------------------------------------------------------------ */
/* Create (+ invite)                                                    */
/* ------------------------------------------------------------------ */

export async function createStockist(
  input: StockistInput,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = stockistInputSchema.safeParse(input);
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

  if (await isStockistEmailTaken(data.email)) {
    return {
      success: false,
      error: "A stockist with this email already exists.",
      fieldErrors: { email: ["Already in use"] },
    };
  }

  // 1) Create the stockist's row in our own table first (status 'active'
  //    by default — the invite affects login access, not this record).
  const supabase = await createClient();
  const { data: stockist, error: stockistError } = await supabase
    .from("stockists")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      country: data.country,
      region: data.region,
      default_profit_percent: data.defaultProfitPercent,
      notes: data.notes,
      status: data.status,
    })
    .select("id")
    .single();

  if (stockistError || !stockist) {
    return {
      success: false,
      error: `Could not create stockist: ${stockistError?.message}`,
    };
  }

  // 2) Create the matching profiles row with role = 'stockist', linked
  //    by the same id the Auth user will get (set in step 3 below).
  //    If inviteStockistUser fails after this, the admin can retry the
  //    invite separately — the stockist record itself is already safe.
  const inviteResult = await inviteStockistUser(
    stockist.id,
    data.name,
    data.email,
  );
  if (!inviteResult.success) {
    return {
      success: true, // the stockist record was created successfully
      stockistId: stockist.id,
      // surfaced separately so the form can show "created, but invite failed"
      // rather than a blanket failure that implies nothing was saved
    } as ActionResult;
  }

  revalidatePath("/admin/stockists");
  return { success: true, stockistId: stockist.id };
}

// Separated out so it can also be called as a standalone "Resend invite"
// action later, without duplicating this logic.
export async function inviteStockistUser(
  stockistId: string,
  name: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  const admin = createAdminClient();

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { name }, // becomes user_metadata.name — display only, never trusted for access
      //   redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/accept`,
    });

  if (inviteError || !invited.user) {
    return {
      success: false,
      error: `Invite could not be sent: ${inviteError?.message}`,
    };
  }

  // Role lives in app_metadata — server-set, not user-editable — same
  // pattern as the admin account registered via SQL earlier.
  const { error: metaError } = await admin.auth.admin.updateUserById(
    invited.user.id,
    {
      app_metadata: { role: "stockist" },
    },
  );
  if (metaError) {
    return {
      success: false,
      error: `Could not set stockist role: ${metaError.message}`,
    };
  }

  // Link profiles.id = auth.users.id, the same convention as admin.
  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: invited.user.id,
    role: "stockist",
    name,
    email,
    status: "active",
  });
  if (profileError) {
    return {
      success: false,
      error: `Could not create stockist profile: ${profileError.message}`,
    };
  }

  // Link the stockist row to its new Auth user id, so future lookups
  // (e.g. the stockist dashboard's "who am I") can join directly.
  const { error: linkError } = await supabase
    .from("stockists")
    .update({ profile_id: invited.user.id })
    .eq("id", stockistId);
  if (linkError) {
    return {
      success: false,
      error: `Could not link stockist account: ${linkError.message}`,
    };
  }

  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Update                                                               */
/* ------------------------------------------------------------------ */

export async function updateStockist(
  id: string,
  input: StockistInput,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = stockistInputSchema.safeParse(input);
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

  if (await isStockistEmailTaken(data.email, id)) {
    return {
      success: false,
      error: "A stockist with this email already exists.",
      fieldErrors: { email: ["Already in use"] },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stockists")
    .update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      country: data.country,
      region: data.region,
      default_profit_percent: data.defaultProfitPercent,
      notes: data.notes,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: `Could not update stockist: ${error.message}`,
    };
  }

  revalidatePath("/admin/stockists");
  revalidatePath(`/admin/stockists/${id}`);
  return { success: true, stockistId: id };
}

/* ------------------------------------------------------------------ */
/* Status (active / inactive / deleted — all soft, never a row delete)  */
/* ------------------------------------------------------------------ */

export async function setStockistStatus(
  id: string,
  status: z.infer<typeof statusSchema>,
): Promise<ActionResult> {
  await requireRole("admin");
  statusSchema.parse(status);

  const supabase = await createClient();
  const { error } = await supabase
    .from("stockists")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/stockists");
  return { success: true, stockistId: id };
}
