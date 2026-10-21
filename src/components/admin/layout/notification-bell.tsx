"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, Popover } from "antd";
import { AlertTriangle, Bell, CheckCheck, Package, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBellData,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  clearNotificationAction,
  clearAllNotificationsAction,
  type BellData,
} from "@/lib/admin/notification-actions";
import type { Notification } from "@/lib/admin/notifications";

// Header notification bell. Combines two kinds of alerts:
//  - Low-stock alerts: a LIVE query (always current reality, not stored
//    "read" state — there's nothing to mark read about "stock is low").
//  - Stored notifications: real events (orders, withdrawals, stockist
//    requests, and "still low after restock") with proper read/unread
//    state, from the shared notifications table.
// Polls every 60s so the badge count stays fresh without a manual refresh.

const POLL_MS = 60_000;

const relativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export function NotificationBell() {
  const router = useRouter();
  const [data, setData] = useState<BellData>({
    notifications: [],
    unreadCount: 0,
    lowStockAlerts: [],
  });
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const next = await getBellData();
    setData(next);
  }, []);

  useEffect(() => {
    void refresh();
    pollRef.current = setInterval(() => void refresh(), POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction();
    void refresh();
  }
  async function handleClear(id: string) {
    await clearNotificationAction(id);
    void refresh();
  }

  async function handleClearAll() {
    await clearAllNotificationsAction();
    void refresh();
  }

  async function handleNotificationClick(n: Notification) {
    if (!n.isRead) {
      await markNotificationReadAction(n.id);
      void refresh();
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  const totalCount = data.unreadCount + data.lowStockAlerts.length;
  const hasAnything =
    data.notifications.length > 0 || data.lowStockAlerts.length > 0;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      content={
        <div className="w-[340px] max-w-[90vw] py-1">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="font-sans text-[14px] font-medium text-espresso">
              Notifications
            </h3>
            <div className="flex items-center gap-3">
              {data.unreadCount > 0 && (
                <button
                  style={{ cursor: "pointer" }}
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 font-sans text-[12px] text-copper hover:text-espresso"
                >
                  <CheckCheck
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Mark all read
                </button>
              )}
              {data.notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="font-sans text-[12px] text-warm-gray hover:text-espresso"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div
            className="max-h-[360px] overflow-y-auto"
            style={{ cursor: "pointer" }}
          >
            {!hasAnything ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <Bell
                  className="h-5 w-5 text-warm-gray"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                <p className="mt-2 font-sans text-[13px] text-warm-gray">
                  You're all caught up
                </p>
              </div>
            ) : (
              <>
                {data.lowStockAlerts.length > 0 && (
                  <div className="border-t border-border px-3 pb-1 pt-2">
                    <p className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-warm-gray">
                      Low Stock
                    </p>
                    {data.lowStockAlerts.map((alert) => (
                      <Link
                        key={alert.variantId}
                        href="/admin/inventory"
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-2.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-cream-soft"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
                          <Package
                            className="h-3.5 w-3.5"
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-sans text-[13px] text-espresso">
                            {alert.productName} · {alert.variantName}
                          </span>
                          <span className="block font-sans text-[12px] text-warm-gray">
                            {alert.stock} left
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {data.notifications.length > 0 && (
                  <div className="border-t border-border px-3 pb-2 pt-2">
                    <p className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-warm-gray">
                      Recent
                    </p>
                    {data.notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-1 rounded-lg transition-colors hover:bg-cream-soft"
                      >
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(n)}
                          className="flex min-w-0 flex-1 items-start gap-2.5 px-1.5 py-2 text-left"
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                              n.isRead
                                ? "bg-cream text-warm-gray"
                                : "bg-green-bg text-green",
                            )}
                          >
                            <AlertTriangle
                              className="h-3.5 w-3.5"
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block truncate font-sans text-[13px]",
                                n.isRead
                                  ? "text-espresso/70"
                                  : "font-medium text-espresso",
                              )}
                            >
                              {n.title}
                            </span>
                            <span className="block truncate font-sans text-[12px] text-warm-gray">
                              {n.message}
                            </span>
                          </span>
                          <span className="mt-1 shrink-0 font-sans text-[11px] text-warm-gray">
                            {relativeTime(n.createdAt)}
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label="Clear notification"
                          onClick={() => handleClear(n.id)}
                          className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-warm-gray hover:bg-cream hover:text-espresso"
                        >
                          <X
                            className="h-3.5 w-3.5"
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      }
      styles={{ container: { padding: 0, borderRadius: 16 } }}
    >
      <button
        type="button"
        aria-label={`Notifications${totalCount > 0 ? `, ${totalCount} unread` : ""}`}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-espresso/80 transition-colors hover:bg-cream-soft hover:text-espresso"
      >
        <Badge
          count={totalCount}
          size="small"
          offset={[-2, 2]}
          color="var(--color-copper)"
        >
          <Bell className="h-[19px] w-[19px]" strokeWidth={1.6} />
        </Badge>
      </button>
    </Popover>
  );
}
