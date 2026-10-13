"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardEarnings } from "@/lib/affiliate/dashboard-queries";
import { withApprox, type RateMap } from "@/lib/currency";

export function EarningsDonut({
  earnings,
  rates,
  currency,
}: {
  earnings: DashboardEarnings;
  rates: RateMap;
  currency: string;
}) {
  const usd = (n: number) => withApprox(n, "USD", currency, rates).original;

  // Negative values (refund adjustments) are shown as 0 in the donut.
  const slices = [
    {
      name: "Available",
      value: Math.max(earnings.availableUsd, 0),
      color: "var(--color-copper)",
    },
    {
      name: "Pending",
      value: Math.max(earnings.pendingUsd, 0),
      color: "var(--color-warm-gray)",
    },
    {
      name: "In review",
      value: Math.max(earnings.inReviewUsd, 0),
      color: "var(--color-espresso)",
    },
    {
      name: "Paid out",
      value: Math.max(earnings.paidUsd, 0),
      color: "var(--color-green)",
    },
  ];

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const totalApprox = withApprox(total, "USD", currency, rates).approx;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border-strong bg-white p-4 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] dark:border-border dark:shadow-none sm:p-5">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />
      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
        Earnings split
      </p>

      {total === 0 ? (
        <p className="py-10 text-center font-sans text-[13px] text-warm-gray">
          No earnings yet.
        </p>
      ) : (
        <>
          <div
            className="relative mx-auto mt-3 h-[160px] w-full"
            role="img"
            aria-label={`Earnings split, total ${usd(total)}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="92%"
                  paddingAngle={
                    slices.filter((s) => s.value > 0).length > 1 ? 3 : 0
                  }
                  stroke="none"
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    usd(Number(value)),
                    String(name),
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--color-white)",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: "var(--color-espresso)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-sans text-[11px] text-warm-gray">
                Total
              </span>
              <span className="font-display text-[22px] leading-tight tabular-nums text-espresso">
                {usd(total)}
              </span>
              {totalApprox && (
                <span className="mt-0.5 max-w-[110px] truncate font-sans text-[8px] tabular-nums text-warm-gray">
                  {totalApprox}
                </span>
              )}
            </div>
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {slices.map((s) => (
              <li
                key={s.name}
                className="flex items-center gap-2 font-sans text-[12px]"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate text-warm-gray">{s.name}</span>
                <span className="ml-auto tabular-nums text-espresso">
                  {usd(s.value)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
