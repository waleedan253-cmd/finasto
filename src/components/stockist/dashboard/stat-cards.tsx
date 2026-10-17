// The four headline numbers on the stockist Dashboard, in the same style as
// the affiliate stat cards: stock remaining, packs sold, sales and active
// affiliates. A plain server component (no hooks, no currency switching:
// stockist amounts are USD only). Nothing is calculated here except
// formatting; every number comes from getMyStockistDashboard().
//
// "Packs sold" and "Sales" follow the chart period (?range=); "Stock
// remaining" and "Active affiliates" are the situation right now.

import {
  Boxes,
  PackageCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { StockistDashboard } from "@/lib/stockist/dashboard-queries";
import { DASHBOARD_RANGES } from "@/lib/affiliate/dashboard-ranges";

const count = new Intl.NumberFormat("en-US");

// Static class names, so Tailwind can see them at build time.
const ACCENTS = {
  green: "bg-green/10 text-green",
  copper: "bg-copper/10 text-copper",
  gray: "bg-espresso/5 text-warm-gray",
} as const;

type StatProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  accent: keyof typeof ACCENTS;
  hint?: string;
};

function StatCard({ title, value, icon: Icon, accent, hint }: StatProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-white p-4 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(50,30,24,0.08),0_10px_24px_rgba(50,30,24,0.08)] dark:border-border dark:shadow-none">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
          {title}
        </p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            ACCENTS[accent],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.7} />
        </span>
      </div>

      <p className="mt-3 font-display text-[28px] leading-none tabular-nums text-espresso">
        {value}
      </p>

      {hint && (
        <p className="mt-1.5 font-sans text-[12px] text-warm-gray">{hint}</p>
      )}
    </div>
  );
}

export function StatCards({ data }: { data: StockistDashboard }) {
  const periodLabel =
    DASHBOARD_RANGES.find((r) => r.value === data.range)?.label ?? "";
  const lowCount = data.lowStock.length;

  return (
    <section aria-label="Summary">
      {/* 2 per row on phones, 4 on desktop. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Stock remaining"
          value={count.format(data.stockRemaining)}
          icon={Boxes}
          accent="green"
          hint={
            lowCount > 0
              ? `${lowCount} ${lowCount === 1 ? "pack is" : "packs are"} running low`
              : "All packs well stocked"
          }
        />
        <StatCard
          title="Packs sold"
          value={count.format(data.period.units)}
          icon={PackageCheck}
          accent="gray"
          hint={periodLabel}
        />
        <StatCard
          title="Sales"
          value={formatPrice(data.period.salesUsd, "USD")}
          icon={Wallet}
          accent="copper"
          hint={periodLabel}
        />
        <StatCard
          title="Active affiliates"
          value={count.format(data.activeAffiliates)}
          icon={Users}
          accent="green"
          hint="Assigned to you"
        />
      </div>
    </section>
  );
}
