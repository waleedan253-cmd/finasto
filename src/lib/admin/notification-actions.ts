"use server";

// Thin Server Action wrappers around notifications.ts + inventory-queries.ts,
// so the client-side bell component can call them directly. The
// underlying functions already do their own requireRole("admin") check.

import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotification,
  clearAllNotifications,
  type Notification,
} from "@/lib/admin/notifications";
import {
  getLowStockAlerts,
  type LowStockAlert,
} from "@/lib/admin/inventory-queries";

export type BellData = {
  notifications: Notification[];
  unreadCount: number;
  lowStockAlerts: LowStockAlert[];
};

// One combined call so the bell only needs one round-trip, not three.
export async function getBellData(): Promise<BellData> {
  const [notifications, unreadCount, lowStockAlerts] = await Promise.all([
    listNotifications(),
    getUnreadNotificationCount(),
    getLowStockAlerts(),
  ]);
  return { notifications, unreadCount, lowStockAlerts };
}

export async function markNotificationReadAction(id: string): Promise<void> {
  await markNotificationRead(id);
}

export async function markAllNotificationsReadAction(): Promise<void> {
  await markAllNotificationsRead();
}
export async function clearNotificationAction(id: string): Promise<void> {
  await clearNotification(id);
}

export async function clearAllNotificationsAction(): Promise<void> {
  await clearAllNotifications();
}
