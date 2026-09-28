import Link from "next/link";
import { cn } from "@/lib/utils";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";

// Section 6: best-selling products. Server component. Sales arrive in
// USD and are converted at the live rate, same rule as the stockist list.

const count = new Intl.NumberFormat("en-US");
const TOP_LIMIT = 5;

export function TopProducts({
  products,
  rates,
  currency,
  className,
}: {
  products: DashboardData["topProducts"];
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  const rows = products.slice(0, TOP_LIMIT).map((p) => ({
    ...p,
    salesMoney: money(p.sales, currency, rates),
  }));
  const maxSales = Math.max(...rows.map((r) => r.sales), 0);
  const anyRateFallback = rows.some((r) => r.salesMoney.fallback);

  return (
    <section
      aria-labelledby="top-products-heading"
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="top-products-heading"
          className="font-display text-[22px] leading-tight text-espresso"
        >
          Top products
        </h2>
        <Link
          href="/admin/products"
          className="font-sans text-[13px] text-green transition-colors hover:text-green-deep"
        >
          View all
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-strong py-10 text-center">
          <p className="font-sans text-[14px] text-espresso">
            No product sales in this period
          </p>
          <p className="mt-1 font-sans text-[13px] text-warm-gray">
            Best sellers appear here once orders come in.
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
                  {count.format(row.units)} {row.units === 1 ? "unit" : "units"}{" "}
                  sold
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

// Loading placeholder with the same footprint as TopProducts.
export function TopProductsSkeleton({ className }: { className?: string }) {
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
