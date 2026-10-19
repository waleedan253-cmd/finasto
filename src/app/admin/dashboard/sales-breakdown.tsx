import { cn } from "@/lib/utils";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";

// Where sales come from: the split between direct and affiliate orders,
// and the top countries. Server component. Revenue arrives in USD and is
// converted at the live rate, same rule as the other cards.

const count = new Intl.NumberFormat("en-US");
const COUNTRY_LIMIT = 5;

const CHANNEL_LABEL: Record<string, string> = {
  affiliate: "Affiliates",
  direct: "Direct",
};
// Static class names, so Tailwind can see them at build time.
const CHANNEL_BAR: Record<string, string> = {
  affiliate: "bg-green",
  direct: "bg-copper",
};

// "PK" -> "Pakistan". Falls back to the code if the browser/runtime does
// not know it (Intl throws on an invalid code).
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

const percent = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

export function SalesBreakdown({
  channels,
  countries,
  rates,
  currency,
  className,
}: {
  channels: DashboardData["channels"];
  countries: DashboardData["topCountries"];
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  const channelRows = channels.map((c) => ({
    ...c,
    revenueMoney: money(c.revenue, currency, rates),
  }));
  const countryRows = countries.slice(0, COUNTRY_LIMIT).map((c) => ({
    ...c,
    revenueMoney: money(c.revenue, currency, rates),
  }));

  const totalRevenue = channelRows.reduce((sum, c) => sum + c.revenue, 0);
  const maxCountry = Math.max(...countryRows.map((c) => c.revenue), 0);
  const anyRateFallback = [...channelRows, ...countryRows].some(
    (r) => r.revenueMoney.fallback,
  );
  const isEmpty = channelRows.length === 0 && countryRows.length === 0;

  return (
    <section
      aria-labelledby="sales-breakdown-heading"
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.04)]",
        className,
      )}
    >
      <h2
        id="sales-breakdown-heading"
        className="font-display text-[22px] leading-tight text-espresso"
      >
        Sales breakdown
      </h2>

      {isEmpty ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-strong py-10 text-center">
          <p className="font-sans text-[14px] text-espresso">
            No sales in this period
          </p>
          <p className="mt-1 font-sans text-[13px] text-warm-gray">
            Channels and countries appear here once orders come in.
          </p>
        </div>
      ) : (
        <>
          {/* By channel */}
          <div className="mt-4">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
              By channel
            </p>

            {/* One bar, split by share of revenue */}
            <div
              role="img"
              aria-label={channelRows
                .map(
                  (c) =>
                    `${CHANNEL_LABEL[c.channel] ?? c.channel} ${percent(c.revenue, totalRevenue)} percent`,
                )
                .join(", ")}
              className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-cream"
            >
              {channelRows.map((c) => (
                <div
                  key={c.channel}
                  className={CHANNEL_BAR[c.channel] ?? "bg-warm-gray"}
                  style={{ width: `${percent(c.revenue, totalRevenue)}%` }}
                />
              ))}
            </div>

            <ul className="mt-3 space-y-2">
              {channelRows.map((c) => (
                <li
                  key={c.channel}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        CHANNEL_BAR[c.channel] ?? "bg-warm-gray",
                      )}
                    />
                    <p className="truncate font-sans text-[14px] text-espresso">
                      {CHANNEL_LABEL[c.channel] ?? c.channel}
                    </p>
                    <p className="shrink-0 font-sans text-[12px] text-warm-gray">
                      {count.format(c.orders)}{" "}
                      {c.orders === 1 ? "order" : "orders"} ·{" "}
                      {percent(c.revenue, totalRevenue)}%
                    </p>
                  </div>
                  <p className="shrink-0 font-sans text-[14px] font-semibold tabular-nums text-espresso">
                    {c.revenueMoney.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Top countries */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
              Top countries
            </p>

            {countryRows.length === 0 ? (
              <p className="mt-3 font-sans text-[13px] text-warm-gray">
                No country data for this period.
              </p>
            ) : (
              <ol className="mt-3 space-y-3">
                {countryRows.map((c, i) => (
                  <li key={`${c.country}-${i}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-sans text-[14px] text-espresso">
                        {countryName(c.country)}
                      </p>
                      <p className="shrink-0 font-sans text-[14px] font-semibold tabular-nums text-espresso">
                        {c.revenueMoney.text}
                      </p>
                    </div>
                    <div
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-cream"
                    >
                      <div
                        className="h-full rounded-full bg-green"
                        style={{
                          width: `${maxCountry > 0 ? Math.max(4, (c.revenue / maxCountry) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 font-sans text-[12px] text-warm-gray">
                      {count.format(c.orders)}{" "}
                      {c.orders === 1 ? "order" : "orders"}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}

      {anyRateFallback && (
        <p className="mt-3 font-sans text-[12px] text-copper">
          Rate unavailable, showing USD
        </p>
      )}
    </section>
  );
}

// Loading placeholder with the same footprint as SalesBreakdown.
export function SalesBreakdownSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-2xl border border-border bg-white p-5", className)}
    >
      <div className="h-6 w-44 animate-pulse rounded bg-border/70" />
      <div className="mt-5 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-border/70" />
        ))}
      </div>
    </div>
  );
}
