import { requireRole } from "@/lib/auth/server";
import { getDashboardData } from "@/lib/admin/dashboard-queries";
import { resolveDateRange } from "@/lib/admin/date-range";
import { getCurrencyContext } from "@/lib/rates";

import { DateRangePicker } from "./dashboard/date-range-picker";
import { KpiCards } from "./dashboard/kpi-cards";
import { SalesChart } from "./dashboard/sales-chart";
import { PendingActions } from "./dashboard/pending-actions";
import { CommissionSummary } from "./dashboard/commission-summary";
import { StockistSummary } from "./dashboard/stockist-summary";
import { RecentOrders } from "./dashboard/recent-orders";
import { TopProducts } from "./dashboard/top-products";

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

  // Next.js 15: searchParams is a Promise. On Next 14, remove the await.
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
          <p className="font-sans text-[12px] uppercase tracking-[0.22em] text-copper"></p>
        </div>
        <DateRangePicker from={range.from} to={range.to} />
      </header>

      <KpiCards kpis={data.kpis} rates={rates} currency={currency} />

      <div className="grid gap-4 lg:grid-cols-3">
        <SalesChart
          className="lg:col-span-2"
          series={data.salesSeries}
          from={range.from}
          to={range.to}
          rates={rates}
          currency={currency}
        />
        <PendingActions
          pending={data.pending}
          rates={rates}
          currency={currency}
        />
      </div>

      <CommissionSummary
        commissions={data.commissions}
        withdrawals={data.pending.withdrawals}
        rates={rates}
        currency={currency}
      />

      <StockistSummary
        stockists={data.stockists}
        rates={rates}
        currency={currency}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentOrders orders={data.recentOrders} />
        <TopProducts
          products={data.topProducts}
          rates={rates}
          currency={currency}
        />
      </div>
    </div>
  );
}
