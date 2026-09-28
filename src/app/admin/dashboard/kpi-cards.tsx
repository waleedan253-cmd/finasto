import { MousePointerClick, ShoppingCart, Users, Wallet } from "lucide-react";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";
import { StatCard, StatCardSkeleton, percentChange } from "./stat-card";

// Section 1: the four headline numbers. Server component, so it needs no
// "use client". Revenue arrives in USD and is converted at the live rate;
// if that rate is missing or stale it shows USD with a clear note instead
// of a wrong number.

const count = new Intl.NumberFormat("en-US");

// Hide the trend when both periods are empty, so a new store doesn't
// show a meaningless "0.0%" on every card.
function trendFor(current: number, previous: number) {
  if (current === 0 && previous === 0) return null;
  return { percent: percentChange(current, previous) };
}

export function KpiCards({
  kpis,
  rates,
  currency,
}: {
  kpis: DashboardData["kpis"];
  rates: RateMap;
  currency: string;
}) {
  const revenue = money(kpis.revenue, currency, rates);
  const avgOrder =
    kpis.orders > 0 ? money(kpis.revenue / kpis.orders, currency, rates) : null;

  return (
    <section
      aria-label="Key metrics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        label="Revenue"
        value={revenue.text}
        icon={Wallet}
        tone="copper"
        iconClassName="bg-copper/10 text-copper"
        trend={trendFor(kpis.revenue, kpis.revenuePrev)}
        hint={avgOrder ? `Avg. order ${avgOrder.text}` : undefined}
        note={revenue.fallback ? "Rate unavailable, showing USD" : undefined}
      />

      <StatCard
        label="Orders"
        value={count.format(kpis.orders)}
        icon={ShoppingCart}
        tone="copper"
        iconClassName="bg-green-bg text-green"
        trend={trendFor(kpis.orders, kpis.ordersPrev)}
      />

      <StatCard
        label="Active affiliates"
        value={count.format(kpis.activeAffiliates)}
        icon={Users}
        tone="copper"
        iconClassName="bg-blue-50 text-blue-600"
        hint={
          kpis.newAffiliates > 0
            ? `${count.format(kpis.newAffiliates)} new this period`
            : undefined
        }
      />

      <StatCard
        label="Referral clicks"
        value={count.format(kpis.clicks)}
        icon={MousePointerClick}
        tone="copper"
        iconClassName="bg-purple-50 text-purple-600"
        trend={trendFor(kpis.clicks, kpis.clicksPrev)}
      />
    </section>
  );
}

// Loading placeholder with the same grid as KpiCards.
export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
