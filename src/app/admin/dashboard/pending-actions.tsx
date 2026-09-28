import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Package,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";
import { summarise } from "./commission-summary";

// Section 7: things that need an admin's attention. Server component.
// Withdrawal amounts keep their original currency (same rule as
// commissions), so they go through summarise().

const count = new Intl.NumberFormat("en-US");

type Item = {
  key: string;
  label: string;
  detail?: string;
  count: number;
  href: string;
  icon: LucideIcon;
};

export function PendingActions({
  pending,
  rates,
  currency,
  className,
}: {
  pending: DashboardData["pending"];
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  const withdrawalAmount = summarise(
    pending.withdrawals.amount,
    currency,
    rates,
  );

  const items: Item[] = [
    {
      key: "withdrawals",
      label: "Withdrawal requests",
      detail:
        pending.withdrawals.count > 0
          ? `${withdrawalAmount.value} requested`
          : undefined,
      count: pending.withdrawals.count,
      href: "/admin/withdrawals",
      icon: Wallet,
    },
    {
      key: "stockist-requests",
      label: "Stockist requests",
      detail: "Waiting for approval",
      count: pending.stockistRequests,
      href: "/admin/stockists",
      icon: UserPlus,
    },
    {
      key: "low-stock",
      label: "Low stock products",
      detail: "Running out soon",
      count: pending.lowStock,
      href: "/admin/products",
      icon: Package,
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
          Pending actions
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
            Requests and stock alerts will show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper"
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
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-border/70" />
        ))}
      </div>
    </div>
  );
}
