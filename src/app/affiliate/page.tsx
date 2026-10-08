// src/app/affiliate/page.tsx
//
// The affiliate dashboard. Replaces the "coming soon" placeholder.
// Server component: loads everything in one call, then hands each piece
// to its component. Only the chart runs in the browser.

import { getMyDashboard } from "@/lib/affiliate/dashboard-queries";
import StatCards from "@/components/affiliate/dashboard/stat-cards";
import PayoutCallout from "@/components/affiliate/dashboard/payout-callout";
import OrdersChart from "@/components/affiliate/dashboard/orders-chart";
import RecentOrders from "@/components/affiliate/dashboard/recent-orders";

// Always show fresh numbers; never serve a cached copy of someone's earnings.
export const dynamic = "force-dynamic";

export default async function AffiliateDashboardPage() {
  let dashboard: Awaited<ReturnType<typeof getMyDashboard>>;

  try {
    dashboard = await getMyDashboard();
  } catch (error) {
    // Log the real reason on the server; show the affiliate something useful.
    console.error("Affiliate dashboard failed to load:", error);

    return (
      <main className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Dashboard
        </h1>
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
        >
          We couldn't load your dashboard. Refresh the page to try again. If it
          keeps happening, contact support.
        </div>
      </main>
    );
  }

  const { stats, earnings, recentOrders } = dashboard;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        Dashboard
      </h1>

      <PayoutCallout availableUsd={earnings.available_usd} />
      <StatCards stats={stats} earnings={earnings} />
      <OrdersChart daily={stats.daily} />
      <RecentOrders orders={recentOrders} />
    </main>
  );
}
