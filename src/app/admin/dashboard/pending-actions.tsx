import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Package,
  PackageX,
  Truck,
  UserPlus,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";

// "Needs attention": everything waiting for an admin click, most urgent
// first. Server component. Only items with something waiting are listed;
// when nothing is, it shows an "all caught up" state.
// Payout amounts arrive in USD and are converted at the live rate.

const count = new Intl.NumberFormat("en-US");

// Where each item leads. Change a path here if your admin route differs.
const HREFS = {
  payouts: "/admin/payouts",
  bulkOrders: "/admin/bulk-orders",
  requests: "/admin/requests",
  orders: "/admin/orders",
  products: "/admin/products",
} as const;

type Item = {
  key: string;
  label: string;
  detail?: string;
  count: number;
  href: string;
  icon: LucideIcon;
  urgent?: boolean; // shown in red instead of copper
};

export function PendingActions({
  attention,
  rates,
  currency,
  className,
}: {
  attention: DashboardData["attention"];
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  const toReview = money(attention.payoutsToReview.amount, currency, rates);
  const toPay = money(attention.payoutsToPay.amount, currency, rates);

  const items: Item[] = [
    {
      key: "payouts-review",
      label: "Payout requests to review",
      detail: `${toReview.text} requested`,
      count: attention.payoutsToReview.count,
      href: HREFS.payouts,
      icon: Wallet,
    },
    {
      key: "payouts-pay",
      label: "Approved payouts to pay",
      detail: `${toPay.text} to send`,
      count: attention.payoutsToPay.count,
      href: HREFS.payouts,
      icon: Banknote,
    },
    {
      key: "bulk-orders",
      label: "Bulk orders waiting",
      detail: "New requests and payment proofs",
      count: attention.bulkOrdersToReview,
      href: HREFS.bulkOrders,
      icon: Warehouse,
    },
    {
      key: "stockist-requests",
      label: "Stockist requests",
      detail: "Waiting for a decision",
      count: attention.stockistRequests,
      href: HREFS.requests,
      icon: UserPlus,
    },
    {
      key: "orders-ship",
      label: "Paid orders to ship",
      detail: "Paid, not shipped yet",
      count: attention.ordersToShip,
      href: HREFS.orders,
      icon: Truck,
    },
    {
      key: "low-stock",
      label: "Low stock packs",
      detail: "5 or fewer left",
      count: attention.lowStock,
      href: HREFS.products,
      icon: Package,
    },
    {
      key: "out-of-stock",
      label: "Out of stock packs",
      detail: "Customers cannot order these",
      count: attention.outOfStock,
      href: HREFS.products,
      icon: PackageX,
      urgent: true,
    },
  ];

  const active = items.filter((item) => item.count > 0);
  const total = active.reduce((sum, item) => sum + item.count, 0);

  return (
    <section
      aria-labelledby="pending-actions-heading"
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="pending-actions-heading"
          className="font-display text-[22px] leading-tight text-espresso"
        >
          Needs attention
        </h2>
        {total > 0 && (
          <span className="rounded-full bg-copper/10 px-2.5 py-0.5 font-sans text-[12px] font-medium tabular-nums text-copper">
            {count.format(total)} open
          </span>
        )}
      </div>

      {active.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border-strong py-10 text-center">
          <CheckCircle2
            aria-hidden="true"
            className="h-6 w-6 text-green"
            strokeWidth={1.75}
          />
          <p className="mt-2 font-sans text-[14px] text-espresso">
            You&apos;re all caught up
          </p>
          <p className="mt-1 font-sans text-[13px] text-warm-gray">
            Payouts, requests, orders to ship and stock alerts will show up
            here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 max-h-96 overflow-y-auto divide-y divide-border">
          {active.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-cream/60"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      item.urgent
                        ? "bg-red/10 text-red"
                        : "bg-copper/10 text-copper",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[14px] font-medium text-espresso">
                      {item.label}
                    </p>
                    {item.detail && (
                      <p className="truncate font-sans text-[12px] text-warm-gray">
                        {item.detail}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 font-sans text-[16px] font-semibold tabular-nums text-espresso">
                    {count.format(item.count)}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-warm-gray"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Loading placeholder with the same footprint as PendingActions.
export function PendingActionsSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-2xl border border-border bg-white p-5", className)}
    >
      <div className="h-6 w-40 animate-pulse rounded bg-border/70" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-border/70" />
        ))}
      </div>
    </div>
  );
}
