import { NextResponse } from "next/server";
import {
  listNotifications,
  getUnreadNotificationCount,
} from "@/lib/admin/notifications";
import { getLowStockAlerts } from "@/lib/admin/inventory-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [notifications, unreadCount, lowStockAlerts] = await Promise.all([
      listNotifications(),
      getUnreadNotificationCount(),
      getLowStockAlerts(),
    ]);
    return NextResponse.json(
      { notifications, unreadCount, lowStockAlerts },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}