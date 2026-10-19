import {
  Banknote,
  Coins,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  Undo2,
  Users,
  Wallet,
} from "lucide-react";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";
import { StatCard, StatCardSkeleton, percentChange } from "./stat-card";

// Section 1: the headline numbers, in two rows of four.
//   Sales   : Revenue, Orders, Average order, Refunds
//   Network : Wholesale (bulk orders), Commission earned, Payouts paid,
//             Active affiliates
// Server component, so it needs no "use client". Amounts arrive in USD and
// are converted at the live rate; if that rate is missing or stale it shows
// USD with a clear note instead of a wrong number.
//
// Every card that has a previous-period number shows the change against it.
// Refunds show no arrow on purpose: a "rise" there is bad news, and a green
// arrow would say the opposite.

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
  const m = (usd: number) => money(usd, currency, rates);
  const fallbackNote = (fallback: boolean) =>
    fallback ? "Rate unavailable, showing USD" : undefined;

  const revenue = m(kpis.revenue);
  const aov = m(kpis.aov);
  const refunded = m(kpis.refundsUsd);
  const wholesale = m(kpis.wholesaleUsd);
  const commission = m(kpis.commissionUsd);
  const paidOut = m(kpis.payoutsPaidUsd);

  return (
    <section
      aria-label="Key metrics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {/* Sales */}
      <StatCard
        label="Revenue"
        value={revenue.text}
        icon={Wallet}
        tone="copper"
        iconClassName="bg-copper/10 text-copper"
        trend={trendFor(kpis.revenue, kpis.revenuePrev)}
        hint="Paid orders, retail"
        note={fallbackNote(revenue.fallback)}
      />

      <StatCard
        label="Orders"
        value={count.format(kpis.orders)}
        icon={ShoppingCart}
        tone="copper"
        iconClassName="bg-green-bg text-green"
        trend={trendFor(kpis.orders, kpis.ordersPrev)}
        hint="Paid orders"
      />
      <StatCard
        label="Refunds"
        value={count.format(kpis.refunds)}
        icon={Undo2}
        tone="copper"
        iconClassName="bg-red/10 text-red"
        hint={
          kpis.refunds > 0
            ? `${refunded.text} refunded`
            : "No refunds this period"
        }
        note={kpis.refunds > 0 ? fallbackNote(refunded.fallback) : undefined}
      />
      <StatCard
        label="Average order"
        value={kpis.orders > 0 ? aov.text : "—"}
        icon={Receipt}
        tone="copper"
        iconClassName="bg-blue-50 text-blue-600"
        trend={trendFor(kpis.aov, kpis.aovPrev)}
        note={kpis.orders > 0 ? fallbackNote(aov.fallback) : undefined}
      />

      {/* Network */}
      <StatCard
        label="Wholesale"
        value={wholesale.text}
        icon={Package}
        tone="copper"
        iconClassName="bg-purple-50 text-purple-600"
        trend={trendFor(kpis.wholesaleUsd, kpis.wholesaleUsdPrev)}
        hint={`Bulk orders · ${count.format(kpis.activeStockists)} active ${
          kpis.activeStockists === 1 ? "stockist" : "stockists"
        }`}
        note={fallbackNote(wholesale.fallback)}
      />

      <StatCard
        label="Commission earned"
        value={commission.text}
        icon={Coins}
        tone="copper"
        iconClassName="bg-copper/10 text-copper"
        hint="On this period's affiliate orders"
        note={fallbackNote(commission.fallback)}
      />

      <StatCard
        label="Payouts paid"
        value={paidOut.text}
        icon={Banknote}
        tone="copper"
        iconClassName="bg-green-bg text-green"
        trend={trendFor(kpis.payoutsPaidUsd, kpis.payoutsPaidUsdPrev)}
        note={fallbackNote(paidOut.fallback)}
      />
      <StatCard
        label="Active stockists"
        value={count.format(kpis.activeStockists)}
        icon={Store}
        tone="copper"
        iconClassName="bg-green-bg text-green"
        hint="Active right now"
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
            : "None new this period"
        }
      />
    </section>
  );
}

// Loading placeholder with the same grid as KpiCards.
export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
