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

"use client";

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
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
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
const MUTED_COLOR = "var(--color-warm-gray)";
const GRID_COLOR = "var(--color-border-strong)";

// "$850", "$1.2k", "$12k": keeps the axis narrow on phones.
const axisUsd = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`;

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
    wrapperStyle: { outline: "none" },
    contentStyle: {
      backgroundColor: "var(--color-white)",
      border: "1px solid var(--color-copper)",
      borderRadius: 12,
      boxShadow: "0 12px 28px -12px rgba(16,38,15,0.35)",
      fontSize: 13,
      padding: "8px 12px",
    },
    labelStyle: {
      color: "var(--color-warm-gray)",
      marginBottom: 4,
      fontWeight: 500,
    },
    itemStyle: { color: "var(--color-espresso)", fontWeight: 600 },
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

  const headline =
    metric === "commission"
      ? amount(totalCommission).original
      : String(totalOrders);
  // Shrink the number as it gets longer, and wrap instead of cutting it.
  const headlineSize =
    headline.length > 16
      ? "text-[20px]"
      : headline.length > 12
        ? "text-[26px]"
        : "text-[32px]";

  const onRangeChange = (value: DashboardRange) => {
    startTransition(() => {
      router.replace(`?range=${value}`, { scroll: false });
    });
  };

  return (
    <motion.div
      aria-busy={isPending}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "finasto-card relative flex h-full flex-col overflow-hidden p-4 pt-5 transition-opacity sm:p-5 sm:pt-6",
        isPending && "opacity-60",
      )}
    >
      {/* thin accent bar on top, same as the other cards */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#10260f] via-green to-[#1b4a24]"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-green-deep">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#10260f] via-[#1f5a3a] to-[#1b4a24] text-white">
              <TrendingUp
                className="h-3.5 w-3.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>
            {label}
          </p>
          <motion.p
            key={metric}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`mt-2 break-words font-display font-semibold leading-tight text-espresso [font-variant-numeric:tabular-nums] ${headlineSize}`}
          >
            {headline}
          </motion.p>
          <p className="mt-1.5 break-words font-sans text-[12px] text-warm-gray">
            {metric === "commission"
              ? `${totalOrders} orders`
              : `${commissionText(totalCommission)} commission`}
            {" · "}
            <span className="text-warm-gray/80">
              {bucket === "month" ? "Months are UTC" : "Days are UTC"}
            </span>
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Segmented<"commission" | "orders">
            size="large"
            block
            className="touch-manipulation font-medium [&_.ant-segmented-item-selected]:!bg-[#1f5a3a] [&_.ant-segmented-item-selected]:!text-white [&_.ant-segmented-thumb]:!bg-[#1f5a3a]"
            value={metric}
            onChange={setMetric}
            options={[
              { label: "Commission", value: "commission" },
              { label: "Orders", value: "orders" },
            ]}
          />
          <Select<DashboardRange>
            size="large"
            placeholder=""
            value={range}
            onChange={onRangeChange}
            options={DASHBOARD_RANGES.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
            className="w-full sm:w-[170px]"
            aria-label="Chart period"
          />
        </div>
      </div>

      {isPending ? (
        <div className="mt-4 flex-1">
          <Skeleton active title={false} paragraph={{ rows: 4 }} />
        </div>
      ) : isEmpty ? (
        <div className="mt-4 flex min-h-[220px] flex-1 items-center justify-center rounded-xl border border-dashed border-copper/30 bg-green-bg/40">
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
                      style={{ stopColor: COMMISSION_COLOR, stopOpacity: 0.45 }}
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
                  stroke={GRID_COLOR}
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => formatBucket(String(v), bucket)}
                  tick={{ fill: MUTED_COLOR, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={(v) => axisUsd(Number(v))}
                  tick={{ fill: MUTED_COLOR, fontSize: 12 }}
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
                {/* soft glow: a wide, faint copy of the line (no blur filter) */}
                <Area
                  dataKey="commissionUsd"
                  type="monotone"
                  stroke={COMMISSION_COLOR}
                  strokeWidth={9}
                  strokeOpacity={0.14}
                  fill="none"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                  tooltipType="none"
                />
                <Area
                  dataKey="commissionUsd"
                  name="Commission"
                  type="monotone"
                  stroke={COMMISSION_COLOR}
                  strokeWidth={2.5}
                  animationDuration={900}
                  fill="url(#commissionFill)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: COMMISSION_COLOR,
                    stroke: "var(--color-white)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={daily}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      style={{ stopColor: ORDERS_COLOR, stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: ORDERS_COLOR, stopOpacity: 0.5 }}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke={GRID_COLOR}
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => formatBucket(String(v), bucket)}
                  tick={{ fill: MUTED_COLOR, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: MUTED_COLOR, fontSize: 12 }}
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
                  fill="url(#ordersFill)"
                  animationDuration={800}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={bucket === "month" ? 32 : 20}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
