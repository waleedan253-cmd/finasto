"use client";

// src/components/affiliate/dashboard/orders-chart.tsx
//
// Last 30 days: bars for orders per day, a line for commission in USD.
// Each day is a UTC day, and days with no orders arrive as zeros from
// my_dashboard_stats(), so the chart has no gaps.
//
// Client component because recharts needs the browser to measure its size.
// Needs: npm install recharts

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "@/lib/affiliate/dashboard-queries";

const ORDERS_COLOR = "#059669"; // emerald-600
const COMMISSION_COLOR = "#4f46e5"; // indigo-600

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// "2026-10-08" -> "Oct 8". Parsed and formatted in UTC so the label never
// shifts a day depending on the viewer's time zone.
const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? day : shortDate.format(d);
}

type TooltipPayload = {
  dataKey?: string | number;
  value?: number | string;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const orders = Number(
    payload.find((p) => p.dataKey === "orders")?.value ?? 0,
  );
  const commission = Number(
    payload.find((p) => p.dataKey === "commission_usd")?.value ?? 0,
  );

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium text-slate-900 dark:text-slate-50">
        {formatDay(String(label ?? ""))}
      </p>
      <p className="text-slate-600 dark:text-slate-300">Orders: {orders}</p>
      <p className="text-slate-600 dark:text-slate-300">
        Commission: {usd.format(commission)}
      </p>
    </div>
  );
}

type Props = {
  daily: DailyPoint[];
};

export default function OrdersChart({ daily }: Props) {
  const totalOrders = daily.reduce((sum, d) => sum + d.orders, 0);
  const totalCommission = daily.reduce((sum, d) => sum + d.commission_usd, 0);

  return (
    <section
      aria-labelledby="orders-chart-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2
        id="orders-chart-heading"
        className="text-base font-semibold text-slate-900 dark:text-slate-50"
      >
        Last {daily.length || 30} days
      </h2>
      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
        {totalOrders} {totalOrders === 1 ? "order" : "orders"} and{" "}
        {usd.format(totalCommission)} in commission
      </p>

      {totalOrders === 0 ? (
        <p className="mt-6 pb-4 text-sm text-slate-600 dark:text-slate-400">
          No orders in this period yet. Once someone orders through your link,
          you'll see each day here.
        </p>
      ) : (
        <>
          <div className="mt-4 h-72 w-full text-slate-500 dark:text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={daily}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.15}
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={formatDay}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  yAxisId="orders"
                  allowDecimals={false}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <YAxis
                  yAxisId="commission"
                  orientation="right"
                  tickFormatter={(v: number) => `$${v}`}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "currentColor", fillOpacity: 0.08 }}
                />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  fill={ORDERS_COLOR}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={20}
                />
                <Line
                  yAxisId="commission"
                  dataKey="commission_usd"
                  type="monotone"
                  stroke={COMMISSION_COLOR}
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: ORDERS_COLOR }}
                aria-hidden
              />
              Orders per day (left)
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block h-0.5 w-4"
                style={{ backgroundColor: COMMISSION_COLOR }}
                aria-hidden
              />
              Commission in USD (right)
            </span>
          </div>
        </>
      )}
    </section>
  );
}
