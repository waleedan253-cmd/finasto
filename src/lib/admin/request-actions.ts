"use server";

// Server Actions for the admin Requests section.
//
// These two actions are deliberately thin. The real work happens inside the
// database functions approve_stockist_request() and reject_stockist_request()
// (see requests-flow.sql), because a function runs as ONE transaction:
//
//   approve -> locks the request, re-checks the affiliate still belongs to
//              the requesting stockist, changes affiliates.stockist_id,
//              writes affiliate_stockist_history, marks the request
//              approved. All of it, or none of it.
//   reject  -> records the decision and a required note. No other data
//              changes.
//
// Each action still re-checks requireRole("admin") and validates its input
// with zod, and calls the database with the logged-in admin's own session
// (cookie-based client, never the service-role key), so the database also
// checks is_admin() and records WHO decided.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const idSchema = z.string().uuid();

// Approve: the note is optional.
const approveNoteSchema = z
  .string()
  .trim()
  .max(500, "Keep the note under 500 characters")
  .nullable()
  .optional();

// Reject: the note is required. A rejection must explain itself.
const rejectNoteSchema = z
  .string()
  .trim()
  .min(1, "Add a short note explaining the rejection")
  .max(500, "Keep the note under 500 characters");

export type ActionResult =
  | { success: true; requestId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// Postgres code for "raise exception" inside our functions. Those messages
// are written for the admin ("This request was already approved", ...), so
// they are shown as they are. Any other database error is logged on the
// server and replaced by a generic message, so internals never leak.
const RAISE_EXCEPTION = "P0001";

function failure(
  action: "approve" | "reject",
  error: { code?: string; message: string },
): ActionResult {
  if (error.code === RAISE_EXCEPTION) {
    return { success: false, error: error.message };
  }
  console.error(`[requests] ${action} failed:`, error.code, error.message);
  return {
    success: false,
    error: `Could not ${action} this request. Please try again.`,
  };
}

// An approval changes the affiliate's stockist, so the stockist and
// affiliate screens are refreshed too, not only the Requests page.
function revalidateAll() {
  revalidatePath("/admin/requests");
  revalidatePath("/admin/stockists");
  revalidatePath("/admin/affiliates");
}

/* ------------------------------------------------------------------ */
/* Approve                                                              */
/* ------------------------------------------------------------------ */

export async function approveRequest(
  requestId: string,
  note?: string | null,
): Promise<ActionResult> {
  await requireRole("admin");

  const id = idSchema.safeParse(requestId);
  if (!id.success) return { success: false, error: "Invalid request." };

  const parsedNote = approveNoteSchema.safeParse(note);
  if (!parsedNote.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { note: parsedNote.error.issues.map((i) => i.message) },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_stockist_request", {
    p_request_id: id.data,
    p_note: parsedNote.data || null,
  });

  if (error) return failure("approve", error);

  revalidateAll();
  return { success: true, requestId: id.data };
}

/* ------------------------------------------------------------------ */
/* Reject                                                               */
/* ------------------------------------------------------------------ */

export async function rejectRequest(
  requestId: string,
  note: string,
): Promise<ActionResult> {
  await requireRole("admin");

  const id = idSchema.safeParse(requestId);
  if (!id.success) return { success: false, error: "Invalid request." };

  const parsedNote = rejectNoteSchema.safeParse(note);
  if (!parsedNote.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { note: parsedNote.error.issues.map((i) => i.message) },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_stockist_request", {
    p_request_id: id.data,
    p_note: parsedNote.data,
  });

  if (error) return failure("reject", error);

  revalidatePath("/admin/requests");
  return { success: true, requestId: id.data };
}
