import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { getMyStockistDashboard } from "@/lib/stockist/dashboard-queries";
import { parseRange } from "@/lib/affiliate/dashboard-ranges";
import { StatCards } from "@/components/stockist/dashboard/stat-cards";
import { SalesChart } from "@/components/stockist/dashboard/sales-chart";
import {
  LowStockCard,
  RecentOrdersCard,
} from "@/components/stockist/dashboard/dashboard-lists";

// Server component. The period comes from the URL (?range=30d) and is
// cleaned by parseRange(), so an unknown value falls back to the default
// instead of reaching the database. getMyStockistDashboard() checks the
// stockist role itself and returns only the signed-in stockist's own data.

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function StockistDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { name } = await requireRole("stockist");
  const { range } = await searchParams;

  const data = await getMyStockistDashboard(parseRange(range));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] leading-tight text-espresso">
            Welcome{name ? `, ${name}` : ""}
          </h1>
          <p className="mt-1 font-sans text-[14px] text-warm-gray">
            Your stock, sales and affiliates at a glance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/stockist/bulk-orders/new"
            className="inline-flex h-10 items-center rounded-full bg-espresso px-5 font-sans text-[13px] font-medium text-cream transition-colors hover:bg-espresso-deep"
          >
            Request packs
          </Link>
          <Link
            href="/stockist/affiliate-requests"
            className="inline-flex h-10 items-center rounded-full border border-border-strong bg-white px-5 font-sans text-[13px] font-medium text-espresso transition-colors hover:border-copper"
          >
            Affiliate requests
          </Link>
        </div>
      </div>

      <StatCards data={data} />

      <SalesChart daily={data.daily} range={data.range} bucket={data.bucket} />

      <div className="grid gap-4 lg:grid-cols-2">
        <LowStockCard items={data.lowStock} />
        <RecentOrdersCard orders={data.recentOrders} />
      </div>
    </div>
  );
}
