// Affiliate Dashboard (server component).
// Everything is read through getMyDashboard(), which finds the affiliate
// from the signed-in user, so no affiliate id comes from the browser.
// If a query fails it throws and the route's error boundary takes over,
// so the page never shows fake zeros. `rates` feeds the "approx." amounts.
//
// A server component: it reads everything through getMyDashboard(),
// which finds the affiliate from the signed-in user, so no affiliate id
// ever comes from the browser. If a query fails, getMyDashboard() throws
// and the route's error boundary shows an error instead of fake zeros.
//
// `rates` feeds the "approx." amounts in the currency chosen in the
// header menu. Load it exactly the way the Payout Requests page does
// (see the TODO below).

import { LayoutDashboard } from "lucide-react";
import { getMyDashboard } from "@/lib/affiliate/dashboard-queries";
import { PayoutCallout } from "@/components/affiliate/dashboard/payout-callout";
import { StatCards } from "@/components/affiliate/dashboard/stat-cards";
import { OrdersChart } from "@/components/affiliate/dashboard/orders-chart";
import { RecentOrders } from "@/components/affiliate/dashboard/recent-orders";
import { EarningsDonut } from "@/components/affiliate/dashboard/earnings-donut";
import { ReferralStrip } from "@/components/affiliate/dashboard/referral-strip";
import { getMyReferralLink } from "@/lib/affiliate/referral-link-queries";
import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";
import { parseRange } from "@/lib/affiliate/dashboard-ranges";
import { Reveal } from "@/components/affiliate/dashboard/reveal";

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
   // Independent reads run together instead of one after another.
  const [data, { currency, rates }, link] = await Promise.all([
    getMyDashboard(range),
    getAffiliateDisplay(), // locked display currency + rates (display only)
    getMyReferralLink(),
  ]);

  // Safety net: the layout normally blocks a login with no affiliate row.
  if (!data) {
    return (
      <div className="finasto-card relative mx-auto mt-6 w-full max-w-lg overflow-hidden p-6 text-center sm:p-8">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-copper via-copper-light to-copper"
        />
        <h1 className="font-display text-[24px] leading-tight text-espresso">
          Dashboard
        </h1>
        <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
          We could not find an affiliate account for this login. Contact
          support if this looks wrong.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 xl:h-[calc(100dvh_-_68px_-_4rem)] xl:min-h-[680px] bg-pattern">
      {/* Premium green header */}
      <Reveal>
        <header className="relative overflow-hidden rounded-2xl border border-copper/30 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] px-5 py-4 text-white shadow-[0_20px_40px_-24px_rgba(16,38,15,0.8)] sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-copper/30 blur-[40px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-copper via-copper-light to-copper"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-copper-light ring-1 ring-copper/40">
                <LayoutDashboard
                  className="h-5 w-5"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-[24px] font-semibold leading-tight sm:text-[30px]">
                  Dashboard
                </h1>
                <p className="mt-0.5 font-sans text-[13px] text-white/75">
                  Your referrals, earnings and payouts at a glance.
                </p>
              </div>
            </div>
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-copper-light/40 bg-white/10 px-3.5 py-1.5 font-sans text-[12px] text-white/85">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-copper-light ring-2 ring-copper-light/20"
              />
              <span className="truncate">Amounts shown in {currency}</span>
            </p>
          </div>
        </header>
      </Reveal>

      <div className="grid min-h-0 gap-4 lg:grid-cols-3 xl:-mx-1 xl:flex-1 xl:grid-rows-[minmax(0,1fr)] xl:overflow-y-auto xl:px-1 xl:pb-2">
        {/* Left (2/3): payout banner, KPI cards, chart */}
        <Reveal
          delay={0.1}
          className="flex min-h-0 flex-col gap-4 lg:col-span-2"
        >
          <PayoutCallout
            availableUsd={data.earnings.availableUsd}
            canRequestPayout={data.canRequestPayout}
            rates={rates}
            currency={currency}
          />
          {link && <ReferralStrip link={link} />}

          <StatCards
            counts={data.counts}
            earnings={data.earnings}
            rates={rates}
            currency={currency}
          />

          <div className="min-h-0 flex-1">
            <OrdersChart
              daily={data.daily}
              range={data.range}
              bucket={data.bucket}
              rates={rates}
              currency={currency}
            />
          </div>
        </Reveal>

        {/* Right (1/3): earnings donut, then recent orders */}
        <Reveal delay={0.2} className="flex min-h-0 flex-col gap-4">
          <EarningsDonut
            earnings={data.earnings}
            rates={rates}
            currency={currency}
          />
          <div className="min-h-[280px] flex-1 xl:min-h-0">
            <RecentOrders
              orders={data.recentOrders}
              rates={rates}
              currency={currency}
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
