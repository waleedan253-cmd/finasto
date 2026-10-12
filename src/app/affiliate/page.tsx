// Affiliate Dashboard. Replaces the "coming soon" placeholder.
//
// A server component: it reads everything through getMyDashboard(),
// which finds the affiliate from the signed-in user, so no affiliate id
// ever comes from the browser. If a query fails, getMyDashboard() throws
// and the route's error boundary shows an error instead of fake zeros.
//
// `rates` feeds the "approx." amounts in the currency chosen in the
// header menu. Load it exactly the way the Payout Requests page does
// (see the TODO below).

import { getMyDashboard } from "@/lib/affiliate/dashboard-queries";
import { PayoutCallout } from "@/components/affiliate/dashboard/payout-callout";
import { StatCards } from "@/components/affiliate/dashboard/stat-cards";
import { OrdersChart } from "@/components/affiliate/dashboard/orders-chart";
import { RecentOrders } from "@/components/affiliate/dashboard/recent-orders";
import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";
import { parseRange } from "@/lib/affiliate/dashboard-ranges";

// Always read fresh numbers for the signed-in affiliate.
export const dynamic = "force-dynamic";

export const metadata = { title: "Affiliate - Dashboard" };

export default async function AffiliateDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const { range: rawRange } = await searchParams;
  const range = parseRange(Array.isArray(rawRange) ? rawRange[0] : rawRange);
  const data = await getMyDashboard(range);
  // The affiliate's locked display currency and the rates (display only).
  const { currency, rates } = await getAffiliateDisplay();

  // Safety net: the layout normally blocks a login with no affiliate row.
  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-[28px] leading-tight text-espresso">
            Dashboard
          </h1>
          <p className="mt-1 font-sans text-[14px] text-warm-gray">
            We could not find an affiliate account for this login. Contact
            support if this looks wrong.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Dashboard</h1>

      <PayoutCallout
        availableUsd={data.earnings.availableUsd}
        canRequestPayout={data.canRequestPayout}
        rates={rates}
        currency={currency}
      />

      <StatCards
        counts={data.counts}
        earnings={data.earnings}
        rates={rates}
        currency={currency}
      />

      <OrdersChart
        daily={data.daily}
        range={data.range}
        bucket={data.bucket}
        rates={rates}
        currency={currency}
      />

      <RecentOrders
        orders={data.recentOrders}
        rates={rates}
        currency={currency}
      />
    </div>
  );
}
