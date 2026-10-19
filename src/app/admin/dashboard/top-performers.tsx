import Link from "next/link";
import { cn } from "@/lib/utils";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";

// Top affiliates and top stockists by revenue for the selected period.
// Server components in the same card style as Top products. Revenue
// arrives in USD and is converted at the live rate.

const count = new Intl.NumberFormat("en-US");
const TOP_LIMIT = 5;

type Row = {
  name: string;
  detail: string;
  revenue: number;
};

// One ranked list with bars, used by both cards.
function RankedCard({
  headingId,
  title,
  href,
  rows,
  emptyTitle,
  emptyText,
  rates,
  currency,
  className,
}: {
  headingId: string;
  title: string;
  href: string;
  rows: Row[];
  emptyTitle: string;
  emptyText: string;
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  const withMoney = rows.slice(0, TOP_LIMIT).map((r) => ({
    ...r,
    revenueMoney: money(r.revenue, currency, rates),
  }));
  const maxRevenue = Math.max(...withMoney.map((r) => r.revenue), 0);
  const anyRateFallback = withMoney.some((r) => r.revenueMoney.fallback);

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={headingId}
          className="font-display text-[22px] leading-tight text-espresso"
        >
          {title}
        </h2>
        <Link
          href={href}
          className="font-sans text-[13px] text-green transition-colors hover:text-green-deep"
        >
          View all
        </Link>
      </div>

      {withMoney.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-strong py-10 text-center">
          <p className="font-sans text-[14px] text-espresso">{emptyTitle}</p>
          <p className="mt-1 font-sans text-[13px] text-warm-gray">
            {emptyText}
          </p>
        </div>
      ) : (
        <ol className="mt-4 divide-y divide-border">
          {withMoney.map((row, i) => (
            <li
              key={`${row.name}-${i}`}
              className="flex items-center gap-3 py-3"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-bg font-sans text-[12px] font-medium text-green"
              >
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-sans text-[14px] font-medium text-espresso">
                    {row.name}
                  </p>
                  <p className="shrink-0 font-sans text-[14px] font-semibold tabular-nums text-espresso">
                    {row.revenueMoney.text}
                  </p>
                </div>

                <div
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream"
                >
                  <div
                    className="h-full rounded-full bg-green"
                    style={{
                      width: `${maxRevenue > 0 ? Math.max(4, (row.revenue / maxRevenue) * 100) : 0}%`,
                    }}
                  />
                </div>

                <p className="mt-1.5 truncate font-sans text-[12px] text-warm-gray">
                  {row.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {anyRateFallback && (
        <p className="mt-3 font-sans text-[12px] text-copper">
          Rate unavailable, showing USD
        </p>
      )}
    </section>
  );
}

const ordersLabel = (n: number) =>
  `${count.format(n)} ${n === 1 ? "order" : "orders"}`;

export function TopAffiliates({
  affiliates,
  rates,
  currency,
  className,
}: {
  affiliates: DashboardData["topAffiliates"];
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  return (
    <RankedCard
      headingId="top-affiliates-heading"
      title="Top affiliates"
      href="/admin/affiliates"
      rows={affiliates.map((a) => ({
        name: a.name,
        detail: `${ordersLabel(a.orders)} · ${a.stockist ?? "No stockist"}`,
        revenue: a.revenue,
      }))}
      emptyTitle="No affiliate sales in this period"
      emptyText="Your best affiliates appear here once orders come in."
      rates={rates}
      currency={currency}
      className={className}
    />
  );
}

export function TopStockists({
  stockists,
  rates,
  currency,
  className,
}: {
  stockists: DashboardData["topStockists"];
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  return (
    <RankedCard
      headingId="top-stockists-heading"
      title="Top stockists"
      href="/admin/stockists"
      rows={stockists.map((s) => ({
        name: s.name,
        detail: ordersLabel(s.orders),
        revenue: s.revenue,
      }))}
      emptyTitle="No stockist sales in this period"
      emptyText="Your best stockists appear here once orders come in."
      rates={rates}
      currency={currency}
      className={className}
    />
  );
}

// Loading placeholder with the same footprint as the cards above.
export function TopPerformersSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-2xl border border-border bg-white p-5", className)}
    >
      <div className="h-6 w-36 animate-pulse rounded bg-border/70" />
      <div className="mt-5 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-border/70" />
        ))}
      </div>
    </div>
  );
}
