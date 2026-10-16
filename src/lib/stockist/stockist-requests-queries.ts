// Server-side reads for the stockist Requests page (the stockist asks to have
// an affiliate assigned to them by typing the affiliate's name, email and a
// description). Import only from server components, route handlers and
// server actions, never from a "use client" file.
//
// Defense in depth: every exported function re-checks requireRole("stockist")
// itself, the same rule as the admin requests-queries.ts.
//
// A stockist cannot read profiles or other stockists directly (RLS), and must
// never learn who owns an affiliate, so the read goes through the SECURITY
// DEFINER function list_my_requests() (see requests-claim-flow.sql). It
// returns only what the stockist typed plus the admin's decision.
//
// Until that function exists, the read returns a safe empty list instead of
// crashing the page.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

// PGRST202 / 42883 = function missing, PGRST205 / 42P01 = table missing.
const MISSING_CODES = new Set(["PGRST202", "PGRST205", "42883", "42P01"]);

function isMissing(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type MyRequestStatus = "pending" | "approved" | "rejected";

export type MyRequest = {
  id: string;
  status: MyRequestStatus;
  affiliateName: string;
  affiliateEmail: string;
  description: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

/* ------------------------------------------------------------------ */
/* Read                                                                 */
/* ------------------------------------------------------------------ */

// My requests, newest first.
export async function getMyRequests(): Promise<MyRequest[]> {
  await requireRole("stockist");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_my_requests");

  if (error) {
    if (isMissing(error)) return [];
    throw new Error(`Failed to load your requests: ${error.message}`);
  }

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    status: row.status,
    affiliateName: row.affiliate_name ?? "",
    affiliateEmail: row.affiliate_email ?? "",
    description: row.description ?? "",
    adminNote: row.admin_note ?? null,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? null,
  }));
}
