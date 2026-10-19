import { requireRole } from "@/lib/auth/server";
import { getDashboardData } from "@/lib/admin/dashboard-queries";
import { resolveDateRange } from "@/lib/admin/date-range";
import { getCurrencyContext } from "@/lib/rates";

import { DateRangePicker } from "./dashboard/date-range-picker";
import { KpiCards } from "./dashboard/kpi-cards";
import { SalesChart } from "./dashboard/sales-chart";
import { PendingActions } from "./dashboard/pending-actions";
import { TopProducts } from "./dashboard/top-products";
import { SalesBreakdown } from "./dashboard/sales-breakdown";
import { TopAffiliates, TopStockists } from "./dashboard/top-performers";
import { RecentOrders } from "./dashboard/recent-orders";

// Admin dashboard, read top to bottom like a modern business dashboard:
//   1. How are we doing?      KPI cards, each compared with the previous period
//   2. What is the trend?     sales chart  |  what needs my attention now
//   3. Where do sales come from?  top products | channels and countries
//   4. Who performs?          top affiliates | top stockists
//   5. What just happened?    latest orders
// The old Commission and Stockist summary sections are gone: their
// per-currency numbers no longer exist; commission and payouts now live in
// the KPI cards and "Needs attention".

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// A query value can be a string, an array or missing. Take the first string.
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Security gate: only admins get past this line.
  const { name } = await requireRole("admin");

  // Next.js 15: searchParams is a Promise.
  const params = await searchParams;

  // The server clamps bad or future dates (see the picker's notes).
  const range = resolveDateRange({
    from: first(params.from),
    to: first(params.to),
  });

  const [data, { rates, currency }] = await Promise.all([
    getDashboardData(range),
    getCurrencyContext(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] leading-tight text-espresso">
            Overview
          </h1>
          <p className="mt-1 font-sans text-[14px] text-warm-gray">
            {name ? `Welcome back, ${name}. ` : ""}
            Compared with the previous{" "}
            {range.days === 1 ? "day" : `${range.days} days`}.
          </p>
        </div>
        <DateRangePicker from={range.from} to={range.to} />
      </header>

      <KpiCards kpis={data.kpis} rates={rates} currency={currency} />

      <div className="grid gap-4 lg:grid-cols-3">
        <SalesChart
          className="lg:col-span-2"
          series={data.series}
          bucket={data.range.bucket}
          from={range.from}
          to={range.to}
          rates={rates}
          currency={currency}
        />
        <PendingActions
          attention={data.attention}
          rates={rates}
          currency={currency}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopProducts
          products={data.topProducts}
          rates={rates}
          currency={currency}
        />
        <SalesBreakdown
          channels={data.channels}
          countries={data.topCountries}
          rates={rates}
          currency={currency}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopAffiliates
          affiliates={data.topAffiliates}
          rates={rates}
          currency={currency}
        />
        <TopStockists
          stockists={data.topStockists}
          rates={rates}
          currency={currency}
        />
      </div>

      <RecentOrders
        orders={data.recentOrders}
        rates={rates}
        currency={currency}
      />
    </div>
  );
}
