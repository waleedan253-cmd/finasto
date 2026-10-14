"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Popover } from "antd";
import {
  Bell,
  BadgeCheck,
  CheckCheck,
  CircleX,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAffiliateBellData,
  markAffiliateNotificationRead,
  markAllAffiliateNotificationsRead,
  clearAffiliateNotification,
  clearAllAffiliateNotifications,
  type AffiliateBellData,
} from "@/lib/affiliate/notification-actions";
import type { Notification } from "@/lib/admin/notifications";

// Affiliate header bell: payout approved, rejected and paid. Same look and
// behavior as the admin bell, without the low-stock section. Polls every
// 60s so the badge stays fresh without a manual refresh.

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

// Icon and color by notification type.
function TypeIcon({ type, isRead }: { type: string; isRead: boolean }) {
  const Icon =
    type === "payout_rejected"
      ? CircleX
      : type === "payout_paid"
        ? Wallet
        : type === "affiliate_new_order"
          ? ShoppingBag
          : BadgeCheck;
  const tone = isRead
    ? "bg-cream text-warm-gray"
    : type === "payout_rejected"
      ? "bg-red-50 text-red-600"
      : "bg-green-bg text-green";
  return (
    <span
      className={cn(
        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        tone,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}

export function AffiliateNotificationBell() {
  const router = useRouter();
  const [data, setData] = useState<AffiliateBellData>({
    notifications: [],
    unreadCount: 0,
  });
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      setData(await getAffiliateBellData());
    } catch {
      // keep the last data; the next poll will try again
    }
  }, []);

  useEffect(() => {
    void refresh();
    pollRef.current = setInterval(() => void refresh(), POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  async function handleMarkAllRead() {
    await markAllAffiliateNotificationsRead();
    void refresh();
  }

  async function handleClear(id: string) {
    await clearAffiliateNotification(id);
    void refresh();
  }

  async function handleClearAll() {
    await clearAllAffiliateNotifications();
    void refresh();
  }

  async function handleNotificationClick(n: Notification) {
    if (!n.isRead) {
      await markAffiliateNotificationRead(n.id);
      void refresh();
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  const hasAnything = data.notifications.length > 0;

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
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex cursor-pointer items-center gap-1 font-sans text-[12px] text-copper hover:text-espresso"
                >
                  <CheckCheck
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Mark all read
                </button>
              )}
              {hasAnything && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="cursor-pointer font-sans text-[12px] text-warm-gray hover:text-espresso"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {!hasAnything ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <Bell
                  className="h-5 w-5 text-warm-gray"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                <p className="mt-2 font-sans text-[13px] text-warm-gray">
                  You&apos;re all caught up
                </p>
              </div>
            ) : (
              <div className="border-t border-border px-3 pb-2 pt-2">
                {data.notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-1 rounded-lg transition-colors hover:bg-cream-soft"
                  >
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 px-1.5 py-2 text-left"
                    >
                      <TypeIcon type={n.type} isRead={n.isRead} />
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
                        <span className="block font-sans text-[12px] text-warm-gray">
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
                      className="mt-2 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-warm-gray hover:bg-cream hover:text-espresso"
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
          </div>
        </div>
      }
      styles={{ container: { padding: 0, borderRadius: 16 } }}
    >
      <button
        type="button"
        aria-label={`Notifications${data.unreadCount > 0 ? `, ${data.unreadCount} unread` : ""}`}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-espresso/80 transition-colors hover:bg-cream-soft hover:text-espresso"
      >
        <Badge
          count={data.unreadCount}
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
