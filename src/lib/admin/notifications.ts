// Shared notification system for the admin panel. Any part of the app
// can call createNotification() — low stock now, new orders/withdrawal
// requests/stockist requests later — and they all show up in the same
// header bell, instead of each feature inventing its own badge.
//
// Import only from server components, route handlers and server
// actions — never from a "use client" file.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

// Extend this union as each feature arrives — the bell UI switches on
// this to pick an icon, it never needs its own separate list.
export type NotificationType =
  | "low_stock"
  | "new_order"
  | "withdrawal_request"
  | "stockist_request"
  | "payout_requested"
  | "payout_approved"
  | "payout_rejected"
  | "payout_paid"
  | "affiliate_new_order";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* Write                                                                */
/* ------------------------------------------------------------------ */

// Called by any feature (inventory-queries.ts today; orders/withdrawals/
// stockist-requests later) whenever something admin-worthy happens.
// Deliberately swallows its own errors rather than throwing: a failed
// notification must never break the action that triggered it (e.g. a
// restock should still succeed even if writing the notification fails).
export async function createNotification(input: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").insert({
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    });
  } catch {
    // Table may not exist yet, or the insert failed — either way, the
    // calling feature's own action already succeeded and must not fail
    // because of this.
  }
}

/* ------------------------------------------------------------------ */
/* Read                                                                 */
/* ------------------------------------------------------------------ */

const BELL_LIMIT = 20;

export async function listNotifications(): Promise<Notification[]> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, message, link, is_read, created_at")
    .is("recipient_id", null)
    .order("created_at", { ascending: false })
    .limit(BELL_LIMIT);

  if (error) {
    if (isMissingTable(error)) return [];
    throw new Error(`Failed to load notifications: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  await requireRole("admin");
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)
    .is("recipient_id", null);

  if (error) {
    if (isMissingTable(error)) return 0;
    return 0; // non-critical for a badge count; never fail the header over this
  }
  return count ?? 0;
}

/* ------------------------------------------------------------------ */
/* Mark read                                                            */
/* ------------------------------------------------------------------ */

export async function markNotificationRead(id: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsRead(): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false)
    .is("recipient_id", null);
}
/* ------------------------------------------------------------------ */
/* Clear                                                                */
/* ------------------------------------------------------------------ */

export async function clearNotification(id: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw new Error(`Failed to clear notification: ${error.message}`);
}

export async function clearAllNotifications(): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .is("recipient_id", null);
  if (error) throw new Error(`Failed to clear notifications: ${error.message}`);
}
