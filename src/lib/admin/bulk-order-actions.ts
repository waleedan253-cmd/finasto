"use server";

// Server Actions for the admin Bulk Orders section. Each one wraps ONE
// database function (quote / reject / return / approve / cancel) and does
// nothing else. The database is the real authority: it re-checks that the
// caller is an admin, locks the order row, validates the status
// transition, and runs the stock changes in a single transaction. This
// file only adds the first-line checks: requireRole("admin"), zod
// validation, and friendly error handling.
//
// Calls go through the cookie-based server client, so the admin's own
// session reaches the database (auth.uid() works). The service-role key
// is never used here.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

/* ------------------------------------------------------------------ */
/* Validation (limits mirror the database checks)                      */
/* ------------------------------------------------------------------ */

const idSchema = z.string().uuid("Invalid order");

const bankDetailsSchema = z
  .string()
  .trim()
  .min(1, "Please add the bank details for the stockist")
  .max(2000, "Bank details are too long (2000 characters at most)");

const optionalNoteSchema = z
  .string()
  .trim()
  .max(500, "Note is too long (500 characters at most)")
  .nullable()
  .optional();

const requiredNote = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(500, "Note is too long (500 characters at most)");

export type ActionResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

/* ------------------------------------------------------------------ */
/* Shared runner                                                        */
/* ------------------------------------------------------------------ */

// Errors raised by our own SQL functions (raise exception) arrive with
// code P0001 and a message written for people, such as "Not enough stock
// for Velora (100g): 3 left, 20 requested". Those are safe to show.
// Anything else (permissions, connection, bad SQL) is logged on the
// server and replaced with a generic message.
const FRIENDLY_CODE = "P0001";

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the details and try again.";
}

async function runBulkOrderRpc(
  rpcName: string,
  args: Record<string, unknown>,
  orderId: string,
  options: { touchesStock: boolean; fallbackError: string },
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc(rpcName, args);

  if (error) {
    if (error.code === FRIENDLY_CODE) {
      return { success: false, error: error.message };
    }
    console.error(
      `[bulk-orders] ${rpcName} failed:`,
      error.code,
      error.message,
    );
    return { success: false, error: options.fallbackError };
  }

  revalidatePath("/admin/bulk-orders");
  revalidatePath(`/admin/bulk-orders/${orderId}`);
  if (options.touchesStock) {
    // Shop stock was reserved, released or moved to the stockist, and the
    // Inventory page and the product list both read that stock.
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
  }
  return { success: true, orderId };
}

/* ------------------------------------------------------------------ */
/* Actions                                                              */
/* ------------------------------------------------------------------ */

// requested -> awaiting_payment. Sends the bank details to the stockist
// and RESERVES the shop stock for this order. Fails with a clear message
// if there isn't enough stock for any pack.
export async function quoteBulkOrder(
  orderId: string,
  bankDetails: string,
  note?: string | null,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = z
    .object({
      orderId: idSchema,
      bankDetails: bankDetailsSchema,
      note: optionalNoteSchema,
    })
    .safeParse({ orderId, bankDetails, note });
  if (!parsed.success)
    return { success: false, error: firstIssue(parsed.error) };

  return runBulkOrderRpc(
    "quote_bulk_order",
    {
      p_order_id: parsed.data.orderId,
      p_bank_details: parsed.data.bankDetails,
      p_note: parsed.data.note || null,
    },
    parsed.data.orderId,
    {
      touchesStock: true,
      fallbackError: "Could not send the bank details. Please try again.",
    },
  );
}

// requested -> rejected. Nothing was reserved yet. A reason is required,
// because the stockist reads it.
export async function rejectBulkOrder(
  orderId: string,
  note: string,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = z
    .object({
      orderId: idSchema,
      note: requiredNote("Please add a short note explaining the rejection"),
    })
    .safeParse({ orderId, note });
  if (!parsed.success)
    return { success: false, error: firstIssue(parsed.error) };

  return runBulkOrderRpc(
    "reject_bulk_order",
    { p_order_id: parsed.data.orderId, p_note: parsed.data.note },
    parsed.data.orderId,
    {
      touchesStock: false,
      fallbackError: "Could not reject this order. Please try again.",
    },
  );
}

// payment_submitted -> awaiting_payment. The proof isn't good enough, so
// it is cleared and the stockist is asked for a new one. A reason is
// required.
export async function returnBulkPayment(
  orderId: string,
  note: string,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = z
    .object({
      orderId: idSchema,
      note: requiredNote(
        "Please tell the stockist what is wrong with the proof",
      ),
    })
    .safeParse({ orderId, note });
  if (!parsed.success)
    return { success: false, error: firstIssue(parsed.error) };

  return runBulkOrderRpc(
    "return_bulk_payment",
    { p_order_id: parsed.data.orderId, p_note: parsed.data.note },
    parsed.data.orderId,
    {
      touchesStock: false,
      fallbackError: "Could not return the payment proof. Please try again.",
    },
  );
}

// payment_submitted -> approved. Payment received: the reserved packs
// become the stockist's own stock. Safe against double clicks, because
// the database only lets an order be approved once.
export async function approveBulkPayment(
  orderId: string,
  note?: string | null,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = z
    .object({ orderId: idSchema, note: optionalNoteSchema })
    .safeParse({ orderId, note });
  if (!parsed.success)
    return { success: false, error: firstIssue(parsed.error) };

  return runBulkOrderRpc(
    "approve_bulk_payment",
    { p_order_id: parsed.data.orderId, p_note: parsed.data.note || null },
    parsed.data.orderId,
    {
      touchesStock: true,
      fallbackError: "Could not approve this payment. Please try again.",
    },
  );
}

// awaiting_payment / payment_submitted -> cancelled. Puts the reserved
// shop stock back. A reason is required.
export async function cancelBulkOrder(
  orderId: string,
  note: string,
): Promise<ActionResult> {
  await requireRole("admin");

  const parsed = z
    .object({
      orderId: idSchema,
      note: requiredNote("Please add a short note explaining the cancellation"),
    })
    .safeParse({ orderId, note });
  if (!parsed.success)
    return { success: false, error: firstIssue(parsed.error) };

  return runBulkOrderRpc(
    "cancel_bulk_order",
    { p_order_id: parsed.data.orderId, p_note: parsed.data.note },
    parsed.data.orderId,
    {
      touchesStock: true,
      fallbackError: "Could not cancel this order. Please try again.",
    },
  );
}
