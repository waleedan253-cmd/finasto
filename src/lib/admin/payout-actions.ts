"use server";

// Admin payout actions. Server only.
//
// Every action: check the role, check the input, call ONE database function.
// The function (payouts.sql) checks admin again and the current status, and
// writes the audit log. This file never changes a status directly.
//
// The proof file is NOT uploaded here. The admin's browser uploads it
// straight to the private payout-proofs bucket first (see payout-actions.tsx
// in components), then sends only the file path to markPayoutPaid().

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export type PayoutActionResult = { ok: true } | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "<request id>/<file name>", file name limited to safe characters.
const PROOF_NAME_RE = /^[A-Za-z0-9._-]{1,100}$/;

const GENERIC_ERROR = "Something went wrong. Please try again.";

// P0001 = a message the SQL function raised on purpose (written for the
// admin). Anything else is a real fault: hide the details.
function toResult(
  error: { code?: string; message: string } | null,
): PayoutActionResult {
  if (!error) return { ok: true };
  return {
    ok: false,
    error: error.code === "P0001" ? error.message : GENERIC_ERROR,
  };
}

// Refresh the admin pages and both affiliate pages that show the status.
function refresh(id: string) {
  revalidatePath("/admin/payouts");
  revalidatePath(`/admin/payouts/${id}`);
  revalidatePath("/affiliate/payouts");
  revalidatePath("/affiliate/accounts");
}

/* ------------------------------------------------------------------ */
/* Approve                                                              */
/* ------------------------------------------------------------------ */

export async function approvePayout(
  requestId: string,
): Promise<PayoutActionResult> {
  await requireRole("admin");

  if (!UUID_RE.test(requestId)) {
    return { ok: false, error: "Request not found." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_payout", {
    p_request_id: requestId,
  });

  const result = toResult(error);
  if (result.ok) refresh(requestId);
  return result;
}

/* ------------------------------------------------------------------ */
/* Reject                                                               */
/* ------------------------------------------------------------------ */

export async function rejectPayout(
  requestId: string,
  reason: string,
): Promise<PayoutActionResult> {
  await requireRole("admin");

  if (!UUID_RE.test(requestId)) {
    return { ok: false, error: "Request not found." };
  }

  const cleanReason = (typeof reason === "string" ? reason : "").trim();
  if (cleanReason.length < 3) {
    return { ok: false, error: "Please give the affiliate a reason." };
  }
  if (cleanReason.length > 500) {
    return { ok: false, error: "The reason is too long (500 characters max)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_payout", {
    p_request_id: requestId,
    p_reason: cleanReason,
  });

  const result = toResult(error);
  if (result.ok) refresh(requestId);
  return result;
}

/* ------------------------------------------------------------------ */
/* Mark paid                                                            */
/* ------------------------------------------------------------------ */

export async function markPayoutPaid(input: {
  requestId: string;
  reference: string;
  proofPath: string;
  paidAmount: number;
  paidCurrency: string;
}): Promise<PayoutActionResult> {
  await requireRole("admin");

  const { requestId, proofPath } = input;

  if (!UUID_RE.test(requestId)) {
    return { ok: false, error: "Request not found." };
  }

  const reference = (
    typeof input.reference === "string" ? input.reference : ""
  ).trim();
  if (!reference) {
    return { ok: false, error: "Enter the payment reference." };
  }
  if (reference.length > 200) {
    return {
      ok: false,
      error: "The reference is too long (200 characters max).",
    };
  }

  const amount = Number(input.paidAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter the amount you sent." };
  }

  const currency = (
    typeof input.paidCurrency === "string" ? input.paidCurrency : ""
  )
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    return {
      ok: false,
      error: "Enter a 3-letter currency code, for example USD.",
    };
  }

  /* The path must be exactly "<this request id>/<safe file name>". */
  const [folder, fileName, ...rest] = (proofPath ?? "").split("/");
  if (
    folder !== requestId ||
    !fileName ||
    rest.length > 0 ||
    !PROOF_NAME_RE.test(fileName) ||
    fileName === "." ||
    fileName === ".."
  ) {
    return { ok: false, error: "Upload the payment proof first." };
  }

  const supabase = await createClient();

  /* The file must really exist in the bucket (not just a typed path). */
  const { data: files, error: listError } = await supabase.storage
    .from("payout-proofs")
    .list(requestId, { search: fileName, limit: 10 });

  if (listError || !files?.some((f) => f.name === fileName)) {
    return {
      ok: false,
      error: "The proof file was not found. Upload it again.",
    };
  }

  const { error } = await supabase.rpc("mark_payout_paid", {
    p_request_id: requestId,
    p_reference: reference,
    p_proof_path: proofPath,
    p_paid_amount: amount,
    p_paid_currency: currency,
  });

  const result = toResult(error);
  if (result.ok) refresh(requestId);
  return result;
}
