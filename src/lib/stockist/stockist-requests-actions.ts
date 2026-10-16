"use server";

// Server Action for the stockist Requests page: ask the admin to assign an
// affiliate to me by typing the affiliate's name, email and a description.
//
// This action is deliberately thin. The real work happens inside the database
// function submit_stockist_request() (see requests-claim-flow.sql), which
// checks that I am an active stockist, validates the name, email and
// description, matches the email to an affiliate without telling me whether
// it exists, refuses an affiliate that is already mine, and refuses a second
// pending request for the same email.
//
// The action still re-checks requireRole("stockist"), validates its input with
// zod, and calls the database with the logged-in stockist's own session
// (cookie-based client, never the service-role key), so the database knows
// WHO is asking.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const submitSchema = z.object({
  affiliateName: z
    .string()
    .trim()
    .min(2, "Enter the affiliate's name")
    .max(100, "Keep the name under 100 characters"),
  affiliateEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter the affiliate's email")
    .max(254, "That email is too long")
    .email("Enter a valid email address"),
  description: z
    .string()
    .trim()
    .min(5, "Please add a description (at least 5 characters)")
    .max(500, "Keep the description under 500 characters"),
});

export type SubmitRequestInput = z.input<typeof submitSchema>;

export type ActionResult =
  | { success: true; requestId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// Postgres code for "raise exception" inside our functions. Those messages
// are written for the stockist ("You already have a pending request for this
// email", ...), so they are shown as they are. Any other database error is
// logged on the server and replaced by a generic message, so internals never
// leak.
const RAISE_EXCEPTION = "P0001";

/* ------------------------------------------------------------------ */
/* Submit                                                               */
/* ------------------------------------------------------------------ */

export async function submitStockistRequest(
  input: SubmitRequestInput,
): Promise<ActionResult> {
  await requireRole("stockist");

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_stockist_request", {
    p_affiliate_name: parsed.data.affiliateName,
    p_affiliate_email: parsed.data.affiliateEmail,
    p_description: parsed.data.description,
  });

  if (error) {
    if (error.code === RAISE_EXCEPTION) {
      return { success: false, error: error.message };
    }
    console.error(
      "[stockist-requests] submit failed:",
      error.code,
      error.message,
    );
    return {
      success: false,
      error: "Could not send your request. Please try again.",
    };
  }

  // The admin sees the new request in their pending list.
  revalidatePath("/stockist/requests");
  revalidatePath("/admin/requests");

  return { success: true, requestId: data as string };
}
