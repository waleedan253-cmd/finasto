"use client";

// Orders per day (bars) and commission in USD (line), for a period the
// affiliate picks: last 7 / 30 / 90 days, last month, or last 12 months
// (one bar per month).
//
// Same look as the rest of the dashboard: Ant Design Card, theme colors
// (green bars, copper line, espresso text and grid). It is a client
// component because recharts draws in the browser and the chosen
// currency comes from useMarket().
//
// The period lives in the URL (?range=30d). Changing the dropdown
// updates the URL, and the server page loads the new numbers. Nothing is
// calculated here except formatting and the totals for the screen-reader
// label. Amounts stay USD; the chosen currency is shown beside the
// commission in the tooltip as "approx." (same rule as withApprox).
//
// Needs: npm install recharts

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Empty, Segmented, Select, Skeleton } from "antd";
import { cn } from "@/lib/utils";
// Type-only import: erased at build, so no server code reaches the browser.
import type { DashboardDay } from "@/lib/affiliate/dashboard-queries";
import {
  DASHBOARD_RANGES,
  type DashboardRange,
} from "@/lib/affiliate/dashboard-ranges";

import { withApprox, type RateMap } from "@/lib/currency";

// "2026-10-08" is a UTC day, so format it as one (no local-time shift).
const dayFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

// Monthly bars are labelled with the month and year, e.g. "Oct 2026".
const monthFmt = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatBucket(day: string, bucket: "day" | "month"): string {
  const d = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return day;
  return bucket === "month" ? monthFmt.format(d) : dayFmt.format(d);
}

// Theme colors (defined as CSS variables in your theme).
const ORDERS_COLOR = "var(--color-green)";
const COMMISSION_COLOR = "var(--color-copper)";
const TEXT_COLOR = "var(--color-espresso)";

export function OrdersChart({
  daily,
  range,
  bucket,
  rates,
  currency,
}: {
  daily: DashboardDay[];
  range: DashboardRange;
  bucket: "day" | "month";
  rates: RateMap;
  currency: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [metric, setMetric] = useState<"commission" | "orders">("commission");

  // Tooltip uses theme tokens, so it flips with light and dark mode.
  const tooltipProps = {
    contentStyle: {
      backgroundColor: "var(--color-white)",
      border: "1px solid var(--color-border-strong)",
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      fontSize: 12,
    },
    labelStyle: { color: "var(--color-warm-gray)", marginBottom: 4 },
    itemStyle: { color: "var(--color-espresso)" },
  };

  // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
  const amount = (n: number) => withApprox(n, "USD", currency, rates);

  const label =
    DASHBOARD_RANGES.find((r) => r.value === range)?.label ?? "Chart";

  const totalOrders = daily.reduce((sum, d) => sum + d.orders, 0);
  const totalCommission = daily.reduce((sum, d) => sum + d.commissionUsd, 0);
  const isEmpty = totalOrders === 0 && totalCommission === 0;

  // "$12.50" or "$12.50 (approx. ...)" when another currency is chosen.
  const commissionText = (n: number) => {
    const a = amount(n);
    return a.approx ? `${a.original} (${a.approx})` : a.original;
  };

  const onRangeChange = (value: DashboardRange) => {
    startTransition(() => {
      router.replace(`?range=${value}`, { scroll: false });
    });
  };

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-white p-4 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] transition-opacity dark:border-border dark:shadow-none sm:p-5",
        isPending && "opacity-60",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
            {label}
          </p>
          <p className="mt-2 font-display text-[32px] leading-none tabular-nums text-espresso">
            {metric === "commission"
              ? amount(totalCommission).original
              : totalOrders}
          </p>
          <p className="mt-1.5 font-sans text-[12px] text-warm-gray">
            {metric === "commission"
              ? `${totalOrders} orders`
              : `${commissionText(totalCommission)} commission`}
            {" · "}
            {bucket === "month" ? "Months are UTC" : "Days are UTC"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented<"commission" | "orders">
            value={metric}
            onChange={setMetric}
            options={[
              { label: "Commission", value: "commission" },
              { label: "Orders", value: "orders" },
            ]}
          />
          <Select<DashboardRange>
            placeholder=""
            value={range}
            onChange={onRangeChange}
            options={DASHBOARD_RANGES.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
            style={{ minWidth: 150 }}
            aria-label="Chart period"
          />
        </div>
      </div>

      {isPending ? (
        <div className="mt-4 flex-1">
          <Skeleton active title={false} paragraph={{ rows: 4 }} />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No orders in this period. Share your link and they will appear here."
          />
        </div>
      ) : (
        <div
          className="mt-4 min-h-[220px] w-full flex-1"
          role="img"
          aria-label={`Chart, ${label.toLowerCase()}: ${totalOrders} orders and ${amount(totalCommission).original} commission.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            {metric === "commission" ? (
              <AreaChart
                data={daily}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="commissionFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: COMMISSION_COLOR, stopOpacity: 0.35 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: COMMISSION_COLOR, stopOpacity: 0 }}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke={TEXT_COLOR}
                  strokeOpacity={0.12}
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => formatBucket(String(v), bucket)}
                  tick={{ fill: TEXT_COLOR, fillOpacity: 0.6, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fill: TEXT_COLOR, fillOpacity: 0.6, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={{ stroke: TEXT_COLOR, strokeOpacity: 0.2 }}
                  labelFormatter={(l) => formatBucket(String(l), bucket)}
                  formatter={(value) => [
                    commissionText(Number(value)),
                    "Commission",
                  ]}
                />
                <Area
                  dataKey="commissionUsd"
                  name="Commission"
                  type="monotone"
                  stroke={COMMISSION_COLOR}
                  strokeWidth={2}
                  fill="url(#commissionFill)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={daily}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke={TEXT_COLOR}
                  strokeOpacity={0.12}
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => formatBucket(String(v), bucket)}
                  tick={{ fill: TEXT_COLOR, fillOpacity: 0.6, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: TEXT_COLOR, fillOpacity: 0.6, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={{ fill: TEXT_COLOR, fillOpacity: 0.06 }}
                  labelFormatter={(l) => formatBucket(String(l), bucket)}
                  formatter={(value) => [String(value), "Orders"]}
                />
                <Bar
                  dataKey="orders"
                  name="Orders"
                  fill={ORDERS_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={bucket === "month" ? 32 : 20}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
