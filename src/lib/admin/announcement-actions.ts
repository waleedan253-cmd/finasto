"use server";

// Server Actions for the admin Announcement section. Same rules as
// product-actions.ts: every action re-checks requireRole("admin"), validates
// input with zod, and writes through the cookie-based client so RLS still
// applies (never the service-role key).
//
// After every write we expire the "announcements" cache tag so the storefront
// bar updates without a redeploy.

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { ANNOUNCEMENTS_TAG } from "./announcement-queries";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

// Only same-site paths ("/shop") or https links. This blocks
// "javascript:" and other schemes, because the link is rendered as an href
// on the public storefront.
const linkSchema = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v.startsWith("/") || v.startsWith("https://"), {
    message: "Use a path like /shop or a full https:// link",
  })
  .refine((v) => !v.startsWith("//"), { message: "Invalid link" });

const announcementSchema = z
  .object({
    message: z.string().trim().min(1, "Message is required").max(200),
    link: linkSchema.nullable(),
    isActive: z.boolean(),
    startsAt: z.string().datetime({ offset: true }).nullable(),
    endsAt: z.string().datetime({ offset: true }).nullable(),
  })
  .superRefine((v, ctx) => {
    if (
      v.startsAt &&
      v.endsAt &&
      Date.parse(v.endsAt) <= Date.parse(v.startsAt)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End must be after start",
      });
    }
  });

export type AnnouncementInput = z.infer<typeof announcementSchema>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function refresh() {
  // "max" = Next.js 16 signature. On Next 15, remove the second argument.
  revalidateTag(ANNOUNCEMENTS_TAG, "max");
  revalidatePath("/admin/announcement");
}

function toRow(d: AnnouncementInput) {
  return {
    message: d.message,
    link: d.link && d.link !== "" ? d.link : null,
    is_active: d.isActive,
    starts_at: d.startsAt,
    ends_at: d.endsAt,
  };
}

function invalid(parsed: z.ZodSafeParseError<AnnouncementInput>): ActionResult {
  return {
    success: false,
    error: "Please fix the highlighted fields.",
    fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
  };
}

/* ------------------------------------------------------------------ */
/* Create / update                                                      */
/* ------------------------------------------------------------------ */

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed);

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .insert(toRow(parsed.data));

  if (error) {
    return {
      success: false,
      error: `Could not create announcement: ${error.message}`,
    };
  }

  refresh();
  return { success: true };
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<ActionResult> {
  await requireRole("admin");

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid announcement id." };
  }

  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed);

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ ...toRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: `Could not update announcement: ${error.message}`,
    };
  }

  refresh();
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Toggle / delete                                                      */
/* ------------------------------------------------------------------ */

// Quick on/off switch from the table row, without opening the form.
export async function setAnnouncementActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  await requireRole("admin");

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid announcement id." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  refresh();
  return { success: true };
}

// Nothing references announcements, so a hard delete is safe here
// (unlike products/variants, which order_items points at).
export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  await requireRole("admin");

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid announcement id." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return {
      success: false,
      error: "Nothing was deleted (not found or not allowed).",
    };
  }

  refresh();
  return { success: true };
}
