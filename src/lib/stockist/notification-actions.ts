"use server";

// Server Actions for the stockist notification bell. Same job as the
// affiliate notification-actions.ts, but for the signed-in stockist only.
//
// Every query filters on recipient_id = the signed-in user. The RLS policies
// in stockist-notifications.sql enforce the same rule, so a stockist can
// never read or change another user's notifications or any admin
// notification.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/admin/notifications";

export type StockistBellData = {
  notifications: Notification[];
  unreadCount: number;
};

const BELL_LIMIT = 20;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One call, so the bell needs one round-trip instead of two.
export async function getStockistBellData(): Promise<StockistBellData> {
  const { user } = await requireRole("stockist");
  const supabase = await createClient();

  const [listResult, countResult] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, message, link, is_read, created_at")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(BELL_LIMIT),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false),
  ]);

  // A bell problem must never break the header: show an empty bell.
  if (listResult.error) return { notifications: [], unreadCount: 0 };

  const notifications: Notification[] = (listResult.data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));

  return {
    notifications,
    unreadCount: countResult.error ? 0 : (countResult.count ?? 0),
  };
}

export async function markStockistNotificationRead(id: string): Promise<void> {
  const { user } = await requireRole("stockist");
  if (!UUID_RE.test(id)) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("recipient_id", user.id);
}

export async function markAllStockistNotificationsRead(): Promise<void> {
  const { user } = await requireRole("stockist");

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false);
}

export async function clearStockistNotification(id: string): Promise<void> {
  const { user } = await requireRole("stockist");
  if (!UUID_RE.test(id)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("recipient_id", user.id);
  if (error) throw new Error(`Failed to clear notification: ${error.message}`);
}

export async function clearAllStockistNotifications(): Promise<void> {
  const { user } = await requireRole("stockist");

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("recipient_id", user.id);
  if (error) throw new Error(`Failed to clear notifications: ${error.message}`);
}
