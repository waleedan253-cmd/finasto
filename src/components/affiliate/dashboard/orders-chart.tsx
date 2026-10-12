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

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Empty, Select, Typography } from "antd";
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
    <Card
      size="small"
      title={label}
      loading={isPending}
      extra={
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
      }
    >
      <Typography.Text
        type="secondary"
        style={{ display: "block", fontSize: 12, marginBottom: 8 }}
      >
        {bucket === "month" ? "Orders per month" : "Orders per day"} and
        commission on paid orders.{" "}
        {bucket === "month" ? "Months are UTC." : "Days are UTC."}
      </Typography.Text>

      {isEmpty ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No orders in this period. Share your link and they will appear here."
        />
      ) : (
        <div
          style={{ height: 288, width: "100%" }}
          role="img"
          aria-label={`Chart, ${label.toLowerCase()}: ${totalOrders} orders and ${amount(totalCommission).original} commission.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={daily}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke={TEXT_COLOR}
                strokeOpacity={0.15}
              />
              <XAxis
                dataKey="day"
                tickFormatter={(v) => formatBucket(String(v), bucket)}
                tick={{ fill: TEXT_COLOR, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                yAxisId="orders"
                allowDecimals={false}
                tick={{ fill: ORDERS_COLOR, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <YAxis
                yAxisId="commission"
                orientation="right"
                tickFormatter={(v) => `$${v}`}
                tick={{ fill: COMMISSION_COLOR, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                labelFormatter={(l) => formatBucket(String(l), bucket)}
                formatter={(value, name) => [
                  name === "Commission"
                    ? commissionText(Number(value))
                    : String(value),
                  String(name),
                ]}
              />
              <Legend verticalAlign="bottom" height={28} />
              <Bar
                yAxisId="orders"
                dataKey="orders"
                name="Orders"
                fill={ORDERS_COLOR}
                radius={[2, 2, 0, 0]}
                maxBarSize={bucket === "month" ? 32 : 20}
              />
              <Line
                yAxisId="commission"
                dataKey="commissionUsd"
                name="Commission"
                type="monotone"
                stroke={COMMISSION_COLOR}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
