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

import Image from "next/image";
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
import { GrowthStrip } from "@/components/affiliate/dashboard/growth-strip";

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
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-copper via-copper-light to-transparent"
        />
        <h1 className="font-display text-[24px] leading-tight text-green-deep">
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
        <div className="flex flex-col gap-4 xl:h-[calc(100dvh_-_68px_-_4rem)] xl:min-h-[680px]">
      {/* Light header: the dark green is reserved for the sidebar and the earnings card */}
           {/* Welcome banner: dark botanical green with the artwork on the right */}
           {/* Welcome banner: dark botanical green, gold edge, artwork on the right */}
      <Reveal>
        <header className="rounded-2xl bg-gradient-to-br from-[#AC834E] via-[#F1CC9C] to-[#C1A576] p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
          <div className="relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-[#031807] via-[#0A210C] to-[#183110]">
                      {/* Endless strip: golden bars rise, then a coffee cup, then again */}
            <GrowthStrip />

            {/* Gold glow in the top-left corner */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 -z-10 h-56 w-56 rounded-full bg-[#E6C399]/15 blur-3xl"
            />

            {/* Thin inner gold frame */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[6px] rounded-[11px] border border-[#E6C399]/15"
            />

            {/* Gold line on top */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#F1CC9C] to-transparent"
            />

            {/* Small gold sparkles (hidden on phones) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[46%] top-5 hidden h-2 w-2 rotate-45 bg-[#F1CC9C] shadow-[0_0_10px_2px_rgba(241,204,156,0.7)] lg:block"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[8%] top-6 hidden h-1.5 w-1.5 rotate-45 bg-[#E6C399] shadow-[0_0_8px_2px_rgba(230,195,153,0.6)] sm:block"
            />

            <div className="relative z-10 flex min-h-[220px] flex-col items-start justify-center gap-4 px-5 py-6 sm:min-h-[250px] sm:px-8 sm:py-8 lg:min-h-[300px] lg:py-10">
              <div className="min-w-0 max-w-[34rem]">
                <h1 className="font-display text-[26px] font-semibold leading-tight text-[#FDEEDC] sm:text-[34px] lg:text-[42px]">
                  Welcome Back,{" "}
                  <span className="bg-gradient-to-r from-[#AC834E] via-[#F1CC9C] to-[#C1A576] bg-clip-text text-transparent">
                    Affiliate!
                  </span>
                </h1>
                <span
                  aria-hidden="true"
                  className="mt-3 block h-[2px] w-16 rounded-full bg-gradient-to-r from-[#AC834E] to-[#F1CC9C]"
                />
                <p className="mt-3 font-sans text-[13px] leading-relaxed text-[#F5DEC4]/85 sm:text-[15px]">
                  Track your performance, manage orders and grow your earnings.
                </p>
              </div>

              <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#E6C399]/40 bg-[#031807]/60 px-3.5 py-1.5 font-sans text-[12px] font-medium text-[#F1CC9C] backdrop-blur-sm">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F1CC9C] shadow-[0_0_8px_2px_rgba(241,204,156,0.6)]"
                />
                <span className="truncate">Your Currency is {currency}</span>
              </p>
            </div>
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
