import Link from "next/link";
import { Banknote, Clock, Store, UserCheck } from "lucide-react";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";
import { StatCard, StatCardSkeleton } from "./stat-card";
import { summarise } from "./commission-summary";

// Section 3: stockist counts, profit balances and the top stockists.
// Server component. Sales arrive in USD and are converted at the live
// rate. Profit stays in its original currency (same rule as commissions).

const count = new Intl.NumberFormat("en-US");
const TOP_LIMIT = 5;

export function StockistSummary({
  stockists,
  rates,
  currency,
}: {
  stockists: DashboardData["stockists"];
  rates: RateMap;
  currency: string;
}) {
  const pending = summarise(stockists.profitPending, currency, rates);
  const paid = summarise(stockists.profitPaid, currency, rates);
  const inactive = Math.max(0, stockists.total - stockists.active);

  const rows = stockists.top.slice(0, TOP_LIMIT).map((s) => ({
    ...s,
    salesMoney: money(s.sales, currency, rates),
    profitSummary: summarise(s.profit, currency, rates),
  }));
  const maxSales = Math.max(...rows.map((r) => r.sales), 0);
  const anyRateFallback = rows.some((r) => r.salesMoney.fallback);

  return (
    <section aria-labelledby="stockists-heading">
      <h2
        id="stockists-heading"
        className="mb-3 font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-espresso/70"
      >
        Stockists
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total stockists"
          value={count.format(stockists.total)}
          icon={Store}
          tone="copper"
          iconClassName="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Active stockists"
          value={count.format(stockists.active)}
          icon={UserCheck}
          tone="copper"
          iconClassName="bg-teal-50 text-teal-600"
          hint={inactive > 0 ? `${count.format(inactive)} inactive` : undefined}
        />
        <StatCard
          label="Profit pending"
          value={pending.value}
          icon={Clock}
          tone="copper"
          iconClassName="bg-amber-50 text-amber-600"
          hint={pending.hint ?? "Waiting for the refund window"}
          note={pending.note}
        />
        <StatCard
          label="Profit paid"
          value={paid.value}
          icon={Banknote}
          tone="copper"
          iconClassName="bg-blue-50 text-blue-600"
          hint={paid.hint}
          note={paid.note}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-[22px] leading-tight text-espresso">
            Top stockists by sales
          </h3>
          <Link
            href="/admin/stockists"
            className="font-sans text-[13px] text-green transition-colors hover:text-green-deep"
          >
            View all
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border-strong py-10 text-center">
            <p className="font-sans text-[14px] text-espresso">
              No stockist sales in this period
            </p>
            <p className="mt-1 font-sans text-[13px] text-warm-gray">
              Sales appear here once affiliates assigned to a stockist make
              their first order.
            </p>
          </div>
        ) : (
          <ol className="mt-4 divide-y divide-border">
            {rows.map((row, i) => (
              <li key={row.id} className="flex items-center gap-3 py-3">
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
                      {row.salesMoney.text}
                    </p>
                  </div>

                  <div
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream"
                  >
                    <div
                      className="h-full rounded-full bg-green"
                      style={{
                        width: `${maxSales > 0 ? Math.max(4, (row.sales / maxSales) * 100) : 0}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1.5 font-sans text-[12px] text-warm-gray">
                    {count.format(row.affiliates)}{" "}
                    {row.affiliates === 1 ? "affiliate" : "affiliates"} · Profit{" "}
                    {row.profitSummary.value}
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
      </div>
    </section>
  );
}

// Loading placeholder with the same layout as StockistSummary.
export function StockistSummarySkeleton() {
  return (
    <div>
      <div className="mb-3 h-4 w-24 animate-pulse rounded bg-border/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-white p-5">
        <div className="h-6 w-56 animate-pulse rounded bg-border/70" />
        <div className="mt-5 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-border/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
