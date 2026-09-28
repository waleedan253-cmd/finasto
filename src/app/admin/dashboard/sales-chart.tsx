"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { convert, formatMoney, money, type RateMap } from "@/lib/currency";
import { parseISODate, toISODate } from "@/lib/admin/date-range";
import type { SalesPoint } from "@/lib/admin/dashboard-queries";

// Section 4: sales trend for the selected date range. Client component
// because recharts needs the browser. Sales arrive in USD and are
// converted here at the live rate; days with no orders are filled with
// zero so the line never skips a day.

type Metric = "sales" | "orders";

type Point = {
  date: string;
  label: string; // "28 Sep"
  fullLabel: string; // "Mon, 28 Sep 2026"
  sales: number; // display currency
  orders: number;
};

// Brand tokens as constants (SVG attributes are the most reliable with hex).
const GREEN = "#3E762F";
const GRID = "#E6DED3";
const MUTED = "#756B62";

const DAY_MS = 86_400_000;

const shortFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const longFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const count = new Intl.NumberFormat("en-US");

function buildPoints(
  series: SalesPoint[],
  from: string,
  to: string,
  rates: RateMap,
  currency: string,
): Point[] {
  const start = parseISODate(from);
  const end = parseISODate(to);
  if (!start || !end) return [];

  const byDate = new Map(series.map((p) => [p.date, p]));
  const points: Point[] = [];

  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    const day = new Date(t);
    const found = byDate.get(toISODate(day));
    points.push({
      date: toISODate(day),
      label: shortFmt.format(day),
      fullLabel: longFmt.format(day),
      sales: found ? convert(found.sales, currency, rates).amount : 0,
      orders: found?.orders ?? 0,
    });
  }
  return points;
}

export function SalesChart({
  series,
  from,
  to,
  rates,
  currency,
  className,
}: {
  series: SalesPoint[];
  from: string;
  to: string;
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  const [metric, setMetric] = useState<Metric>("sales");
  const reducedMotion = useReducedMotion();

  // If the rate is missing or stale, convert() falls back to USD, and the
  // chart must label the axis with the currency it really shows.
  const effective = convert(0, currency, rates);

  const points = useMemo(
    () => buildPoints(series, from, to, rates, currency),
    [series, from, to, rates, currency],
  );

  const totalUsd = series.reduce((sum, p) => sum + p.sales, 0);
  const totalOrders = series.reduce((sum, p) => sum + p.orders, 0);
  const totalMoney = money(totalUsd, currency, rates);
  const isEmpty = totalUsd === 0 && totalOrders === 0;

  return (
    <section
      aria-labelledby="sales-chart-heading"
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.04)]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="sales-chart-heading"
            className="font-display text-[22px] leading-tight text-espresso"
          >
            Sales trend
          </h2>
          <p className="mt-1 font-sans text-[13px] tabular-nums text-warm-gray">
            {totalMoney.text} · {count.format(totalOrders)}{" "}
            {totalOrders === 1 ? "order" : "orders"}
          </p>
        </div>

        <div
          role="group"
          aria-label="Chart metric"
          className="flex w-fit rounded-full border border-border bg-cream p-1"
        >
          {(["sales", "orders"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              aria-pressed={metric === m}
              className={cn(
                "h-9 rounded-full px-4 font-sans text-[13px] capitalize transition-colors",
                metric === m
                  ? "bg-white text-espresso shadow-sm"
                  : "text-warm-gray hover:text-espresso",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="mt-5 flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border-strong text-center sm:h-[300px]">
          <p className="font-sans text-[14px] text-espresso">
            No sales in this period
          </p>
          <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
            Try a wider date range, or check back after your first order.
          </p>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Line chart of daily ${metric} from ${from} to ${to}. Total ${totalMoney.text} from ${count.format(totalOrders)} orders.`}
          className="mt-5 h-[260px] w-full sm:h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={points}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke={GRID}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: MUTED, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: MUTED, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={44}
                allowDecimals={metric === "sales"}
                tickFormatter={(v: number) => compact.format(v)}
              />
              <Tooltip
                cursor={{ stroke: GRID }}
                content={
                  <ChartTooltip metric={metric} currency={effective.currency} />
                }
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={GREEN}
                strokeWidth={2}
                fill="url(#sales-fill)"
                dot={points.length <= 31}
                activeDot={{
                  r: 4,
                  fill: GREEN,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                isAnimationActive={!reducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="mt-3 font-sans text-[12px] text-warm-gray">
        Amounts in {effective.currency}
        {effective.fallback && (
          <span className="text-copper"> · Rate unavailable, showing USD</span>
        )}
      </p>
    </section>
  );
}

function ChartTooltip({
  active,
  payload,
  metric,
  currency,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Point }>;
  metric: Metric;
  currency: string;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-lg">
      <p className="font-sans text-[12px] text-warm-gray">{point.fullLabel}</p>
      <p
        className={cn(
          "mt-1 font-sans text-[13px] tabular-nums",
          metric === "sales"
            ? "font-semibold text-espresso"
            : "text-espresso/80",
        )}
      >
        Sales {formatMoney(point.sales, currency)}
      </p>
      <p
        className={cn(
          "font-sans text-[13px] tabular-nums",
          metric === "orders"
            ? "font-semibold text-espresso"
            : "text-espresso/80",
        )}
      >
        Orders {count.format(point.orders)}
      </p>
    </div>
  );
}

// Loading placeholder with the same footprint as SalesChart.
export function SalesChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-2xl border border-border bg-white p-5", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="h-6 w-32 animate-pulse rounded bg-border/70" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-border/70" />
        </div>
        <div className="h-11 w-44 animate-pulse rounded-full bg-border/70" />
      </div>
      <div className="mt-5 h-[260px] animate-pulse rounded-xl bg-border/50 sm:h-[300px]" />
    </div>
  );
}
