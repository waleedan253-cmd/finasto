"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { convert, formatMoney, money, type RateMap } from "@/lib/currency";
import type { SeriesPoint } from "@/lib/admin/dashboard-queries";

// Sales trend for the selected date range. Client component because
// recharts needs the browser. Revenue arrives in USD and is converted here
// at the live rate. The database already returns one point per day (or per
// month for long periods) with zeros included, so the line never skips a
// bucket and nothing is filled in here.

type Metric = "sales" | "orders";

type Point = {
  date: string;
  label: string; // "28 Sep"
  fullLabel: string; // "Mon, 28 Sep 2026"
  sales: number; // display currency
  orders: number;
};

// Brand tokens as constants (SVG attributes are the most reliable with hex).
const SALES_COLOR = "var(--color-copper)";
const ORDERS_COLOR = "var(--color-green)";
const TEXT_COLOR = "var(--color-espresso)";
const GRID = "var(--color-border-strong)";
const MUTED = "var(--color-warm-gray)";

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
const monthShortFmt = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const monthLongFmt = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const count = new Intl.NumberFormat("en-US");

function buildPoints(
  series: SeriesPoint[],
  bucket: "day" | "month",
  rates: RateMap,
  currency: string,
): Point[] {
  return series.map((p) => {
    const d = new Date(`${p.day}T00:00:00Z`);
    return {
      date: p.day,
      label: (bucket === "month" ? monthShortFmt : shortFmt).format(d),
      fullLabel: (bucket === "month" ? monthLongFmt : longFmt).format(d),
      sales: convert(p.revenue, currency, rates).amount,
      orders: p.orders,
    };
  });
}

export function SalesChart({
  series,
  bucket,
  from,
  to,
  rates,
  currency,
  className,
}: {
  series: SeriesPoint[];
  bucket: "day" | "month";
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
    () => buildPoints(series, bucket, rates, currency),
    [series, bucket, rates, currency],
  );

  const totalUsd = series.reduce((sum, p) => sum + p.revenue, 0);
  const totalOrders = series.reduce((sum, p) => sum + p.orders, 0);
  const totalMoney = money(totalUsd, currency, rates);
  const isEmpty = totalUsd === 0 && totalOrders === 0;

  return (
    <section
      aria-labelledby="sales-chart-heading"
      className={cn("finasto-card p-5 sm:p-6", className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="sales-chart-heading"
            className="font-display text-[22px] leading-tight text-espresso"
          >
            Sales trend
          </h2>
          <p className="mt-3 font-display text-[32px] leading-none tabular-nums text-espresso">
            {metric === "sales" ? totalMoney.text : count.format(totalOrders)}
          </p>
          <p className="mt-1.5 font-sans text-[12px] tabular-nums text-warm-gray">
            {metric === "sales"
              ? `${count.format(totalOrders)} ${totalOrders === 1 ? "order" : "orders"}`
              : `${totalMoney.text} sales`}
          </p>
        </div>

        <div
          role="group"
          aria-label="Chart metric"
          className="flex w-fit rounded-full border border-border bg-cream-soft p-1 "
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
                  ? "bg-copper/15 text-espresso ring-1 ring-copper/30"
                  : "text-warm-gray hover:text-espresso",
              )}
              style={{
                cursor: "pointer",
              }}
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
            Try a wider date range, or check back after the next paid order.
          </p>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Chart of ${bucket === "month" ? "monthly" : "daily"} ${metric} from ${from} to ${to}. Total ${totalMoney.text} from ${count.format(totalOrders)} orders.`}
          className="mt-5 h-[260px] w-full sm:h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {metric === "sales" ? (
              <AreaChart
                data={points}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      style={{ stopColor: SALES_COLOR, stopOpacity: 0.35 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: SALES_COLOR, stopOpacity: 0 }}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={GRID}
                  strokeOpacity={0.6}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: MUTED, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v: number) => compact.format(v)}
                />
                <Tooltip
                  cursor={{ stroke: TEXT_COLOR, strokeOpacity: 0.2 }}
                  content={
                    <ChartTooltip
                      metric={metric}
                      currency={effective.currency}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke={SALES_COLOR}
                  strokeWidth={2}
                  fill="url(#sales-fill)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: SALES_COLOR,
                    stroke: "var(--color-white)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={!reducedMotion}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={points}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  stroke={GRID}
                  strokeOpacity={0.6}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: MUTED, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: TEXT_COLOR, fillOpacity: 0.06 }}
                  content={
                    <ChartTooltip
                      metric={metric}
                      currency={effective.currency}
                    />
                  }
                />
                <Bar
                  dataKey="orders"
                  fill={ORDERS_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={bucket === "month" ? 32 : 20}
                  isAnimationActive={!reducedMotion}
                />
              </BarChart>
            )}
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
