// // // Affiliate Dashboard (server component).
// // // Everything is read through getMyDashboard(), which finds the affiliate
// // // from the signed-in user, so no affiliate id comes from the browser.
// // // If a query fails it throws and the route's error boundary takes over,
// // // so the page never shows fake zeros. `rates` feeds the "approx." amounts.
// // //
// // // A server component: it reads everything through getMyDashboard(),
// // // which finds the affiliate from the signed-in user, so no affiliate id
// // // ever comes from the browser. If a query fails, getMyDashboard() throws
// // // and the route's error boundary shows an error instead of fake zeros.
// // //
// // // `rates` feeds the "approx." amounts in the currency chosen in the
// // // header menu. Load it exactly the way the Payout Requests page does
// // // (see the TODO below).

// // import Image from "next/image";
// // import { getMyDashboard } from "@/lib/affiliate/dashboard-queries";

// // import { StatCards } from "@/components/affiliate/dashboard/stat-cards";
// // import { OrdersChart } from "@/components/affiliate/dashboard/orders-chart";
// // import { RecentOrders } from "@/components/affiliate/dashboard/recent-orders";
// // import { EarningsDonut } from "@/components/affiliate/dashboard/earnings-donut";
// // import { ReferralStrip } from "@/components/affiliate/dashboard/referral-strip";
// // import { getMyReferralLink } from "@/lib/affiliate/referral-link-queries";
// // import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";
// // import { parseRange } from "@/lib/affiliate/dashboard-ranges";
// // import { Reveal } from "@/components/affiliate/dashboard/reveal";
// // // import { GrowthStrip } from "@/components/affiliate/dashboard/growth-strip";

// // // Always read fresh numbers for the signed-in affiliate.
// // export const dynamic = "force-dynamic";

// // export const metadata = { title: "Affiliate - Dashboard" };

// // export default async function AffiliateDashboardPage({
// //   searchParams,
// // }: {
// //   searchParams: Promise<{ range?: string | string[] }>;
// // }) {
// //   const { range: rawRange } = await searchParams;
// //   const range = parseRange(Array.isArray(rawRange) ? rawRange[0] : rawRange);
// //    // Independent reads run together instead of one after another.
// //   const [data, { currency, rates }, link] = await Promise.all([
// //     getMyDashboard(range),
// //     getAffiliateDisplay(), // locked display currency + rates (display only)
// //     getMyReferralLink(),
// //   ]);

// //   // Safety net: the layout normally blocks a login with no affiliate row.
// //   if (!data) {
// //     return (
// //       <div className="relative mx-auto mt-6 w-full max-w-lg overflow-hidden rounded-2xl border border-aff-border bg-white p-6 text-center sm:p-8">
// //         <span
// //           aria-hidden="true"
// //           className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-transparent, text-green-deep"
// //         />
// //         <h1 className="font-display text-[24px] leading-tight text-green-deep">
// //           Dashboard
// //         </h1>
// //         <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
// //           We could not find an affiliate account for this login. Contact
// //           support if this looks wrong.
// //         </p>
// //       </div>
// //     );
// //   }
// //   // New affiliate = nothing has happened on the account yet.
// //   const isNew =
// //     data.counts.totalOrders === 0 &&
// //     data.earnings.pendingUsd === 0 &&
// //     data.earnings.availableUsd === 0 &&
// //     data.earnings.inReviewUsd === 0 &&
// //     data.earnings.paidUsd === 0;

// //   return (
// //         <div className="flex flex-col gap-4">
// //       {/* Light header: the dark green is reserved for the sidebar and the earnings card */}
// //            {/* Welcome banner: dark botanical green with the artwork on the right */}
// //            {/* Welcome banner: dark botanical green, gold edge, artwork on the right */}
// //            <Reveal>
// //         <header className="rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
// //           <div className="aff-sheen relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800">
// //             {/* One static gold glow (not animated, so it is cheap on phones) */}
// //             <span
// //               aria-hidden="true"
// //               className="pointer-events-none absolute -left-16 -top-16 -z-10 h-56 w-56 rounded-full bg-aff-gold-400/15 blur-3xl"
// //             />
// //             {/* Thin inner gold frame */}
// //             <span
// //               aria-hidden="true"
// //               className="pointer-events-none absolute inset-[6px] rounded-[11px] border border-aff-gold-400/15"
// //             />
// //             {/* Gold line on top */}
// //             <span
// //               aria-hidden="true"
// //               className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
// //             />

// //             <div className="relative z-10 flex min-h-[140px] flex-col justify-center gap-4 px-5 py-5 sm:min-h-[150px] sm:flex-row sm:items-center sm:justify-between sm:px-8">
// //               <div className="min-w-0">
// //                 {/* <p className="font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-aff-gold-400/80">
// //                   Affiliate Dashboard
// //                 </p> */}
// //                 <h1 className="mt-1 break-words font-display text-[26px] font-semibold leading-tight text-aff-cream-50 sm:text-[34px]">
// //                   {isNew ? "Welcome," : "Welcome back,"}{" "}
// //                   <span className="bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 bg-clip-text text-transparent">
// //                     {data.affiliateName ?? "Affiliate"}
// //                   </span>
// //                 </h1>
// //                 <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-aff-cream-50/75 sm:text-[14px]">
// //                   {isNew
// //                     ? "Your account is ready. Share your referral link to earn your first commission."
// //                     : "Track your performance, manage orders and grow your earnings."}
// //                 </p>
// //               </div>

// //               <p className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-aff-gold-400/40 bg-aff-green-950/60 px-3.5 py-1.5 font-sans text-[12px] font-medium text-aff-gold-300">
// //                 <span
// //                   aria-hidden="true"
// //                   className="h-1.5 w-1.5 shrink-0 rounded-full bg-aff-gold-300 shadow-[0_0_8px_2px_rgba(241,204,156,0.6)]"
// //                 />
// //                 <span className="truncate">Your Currency is {currency}</span>
// //               </p>
// //             </div>
// //           </div>
// //         </header>
// //       </Reveal>
// //       <div className="grid gap-4 lg:grid-cols-3">
// //         {/* Left (2/3): payout banner, KPI cards, chart */}
// //         <Reveal
// //           delay={0.1}
// //           className="flex flex-col gap-4 lg:col-span-2"
// //         >
          
// //           {link && <ReferralStrip link={link} />}

// //                    <StatCards
// //             counts={data.counts}
// //             earnings={data.earnings}
// //             rates={rates}
// //             currency={currency}
// //             canRequestPayout={data.canRequestPayout}
// //           />

// //           <div className="h-[380px]">
// //             <OrdersChart
// //               daily={data.daily}
// //               range={data.range}
// //               bucket={data.bucket}
// //               rates={rates}
// //               currency={currency}
// //             />
// //           </div>
// //         </Reveal>

// //         {/* Right (1/3): earnings donut, then recent orders */}
// //        <Reveal
// //   delay={0.2}
// //   className="flex flex-col gap-4"
// // >
// //           <EarningsDonut
// //             earnings={data.earnings}
// //             rates={rates}
// //             currency={currency}
// //           />
// //          <div className="relative min-h-[420px] flex-1 lg:min-h-[300px]">
// //   <div className="absolute inset-0">
// //     <RecentOrders
// //       orders={data.recentOrders}
// //       rates={rates}
// //       currency={currency}
// //     />
// //   </div>
// // </div>
// //         </Reveal>
// //       </div> 
// //     </div>
// //   );
// // }
// // Affiliate Dashboard (server component).
// // Everything is read through getMyDashboard(), which finds the affiliate
// // from the signed-in user, so no affiliate id comes from the browser.
// // If a query fails it throws and the route's error boundary takes over,
// // so the page never shows fake zeros. `rates` feeds the "approx." amounts.
// //
// // A server component: it reads everything through getMyDashboard(),
// // which finds the affiliate from the signed-in user, so no affiliate id
// // ever comes from the browser. If a query fails, getMyDashboard() throws
// // and the route's error boundary shows an error instead of fake zeros.
// //
// // `rates` feeds the "approx." amounts in the currency chosen in the
// // header menu. Load it exactly the way the Payout Requests page does
// // (see the TODO below).
// //
// // RESPONSIVE NOTES
// // Desktop (lg: 1024px and up) keeps the exact same classes as before.
// // Only mobile (base), small (sm) and tablet (md) values were changed or added.

// import Image from "next/image";
// import { getMyDashboard } from "@/lib/affiliate/dashboard-queries";

// import { StatCards } from "@/components/affiliate/dashboard/stat-cards";
// import { OrdersChart } from "@/components/affiliate/dashboard/orders-chart";
// import { RecentOrders } from "@/components/affiliate/dashboard/recent-orders";
// import { EarningsDonut } from "@/components/affiliate/dashboard/earnings-donut";
// import { ReferralStrip } from "@/components/affiliate/dashboard/referral-strip";
// import { getMyReferralLink } from "@/lib/affiliate/referral-link-queries";
// import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";
// import { parseRange } from "@/lib/affiliate/dashboard-ranges";
// import { Reveal } from "@/components/affiliate/dashboard/reveal";
// // import { GrowthStrip } from "@/components/affiliate/dashboard/growth-strip";

// // Always read fresh numbers for the signed-in affiliate.
// export const dynamic = "force-dynamic";

// export const metadata = { title: "Affiliate - Dashboard" };

// export default async function AffiliateDashboardPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ range?: string | string[] }>;
// }) {
//   const { range: rawRange } = await searchParams;
//   const range = parseRange(Array.isArray(rawRange) ? rawRange[0] : rawRange);
//   // Independent reads run together instead of one after another.
//   const [data, { currency, rates }, link] = await Promise.all([
//     getMyDashboard(range),
//     getAffiliateDisplay(), // locked display currency + rates (display only)
//     getMyReferralLink(),
//   ]);

//   // Safety net: the layout normally blocks a login with no affiliate row.
//   if (!data) {
//     return (
//       <div className="relative mx-auto mt-6 w-full max-w-lg overflow-hidden rounded-2xl border border-aff-border bg-white p-6 text-center sm:p-8">
//         <span
//           aria-hidden="true"
//           className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-transparent, text-green-deep"
//         />
//         <h1 className="font-display text-[24px] leading-tight text-green-deep">
//           Dashboard
//         </h1>
//         <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
//           We could not find an affiliate account for this login. Contact
//           support if this looks wrong.
//         </p>
//       </div>
//     );
//   }
//   // New affiliate = nothing has happened on the account yet.
//   const isNew =
//     data.counts.totalOrders === 0 &&
//     data.earnings.pendingUsd === 0 &&
//     data.earnings.availableUsd === 0 &&
//     data.earnings.inReviewUsd === 0 &&
//     data.earnings.paidUsd === 0;

//   return (
//     // w-full + min-w-0: lets the page shrink inside the layout's flex/grid
//     // parent instead of forcing sideways scroll on small phones.
//     // gap-3 on phones, gap-4 from sm up (desktop value unchanged).
//     <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4">
//       {/* Welcome banner: dark botanical green, gold edge, artwork on the right */}
//       <Reveal>
//         <header className="rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
//           <div className="aff-sheen relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800">
//             {/* One static gold glow (not animated, so it is cheap on phones) */}
//             <span
//               aria-hidden="true"
//               className="pointer-events-none absolute -left-16 -top-16 -z-10 h-56 w-56 rounded-full bg-aff-gold-400/15 blur-3xl"
//             />
//             {/* Thin inner gold frame */}
//             <span
//               aria-hidden="true"
//               className="pointer-events-none absolute inset-[6px] rounded-[11px] border border-aff-gold-400/15"
//             />
//             {/* Gold line on top */}
//             <span
//               aria-hidden="true"
//               className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
//             />

//             {/* Phones: stacked, tighter padding. sm and up: same as before. */}
//             <div className="relative z-10 flex min-h-[120px] flex-col justify-center gap-3 px-4 py-4 min-[400px]:min-h-[140px] min-[400px]:gap-4 min-[400px]:px-5 min-[400px]:py-5 sm:min-h-[150px] sm:flex-row sm:items-center sm:justify-between sm:px-8">
//               <div className="min-w-0">
//                 {/* <p className="font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-aff-gold-400/80">
//                   Affiliate Dashboard
//                 </p> */}
//                 {/* 22px on very small phones, 26px on normal phones, 34px from sm up */}
//                 <h1 className="mt-1 break-words font-display text-[22px] font-semibold leading-tight text-aff-cream-50 min-[400px]:text-[26px] sm:text-[34px]">
//                   {isNew ? "Welcome," : "Welcome back,"}{" "}
//                   <span className="bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 bg-clip-text text-transparent">
//                     {data.affiliateName ?? "Affiliate"}
//                   </span>
//                 </h1>
//                 <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-aff-cream-50/75 min-[400px]:text-[13px] sm:text-[14px]">
//                   {isNew
//                     ? "Your account is ready. Share your referral link to earn your first commission."
//                     : "Track your performance, manage orders and grow your earnings."}
//                 </p>
//               </div>

//               <p className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-aff-gold-400/40 bg-aff-green-950/60 px-3 py-1.5 font-sans text-[11.5px] font-medium text-aff-gold-300 min-[400px]:px-3.5 min-[400px]:text-[12px]">
//                 <span
//                   aria-hidden="true"
//                   className="h-1.5 w-1.5 shrink-0 rounded-full bg-aff-gold-300 shadow-[0_0_8px_2px_rgba(241,204,156,0.6)]"
//                 />
//                 <span className="truncate">Your Currency is {currency}</span>
//               </p>
//             </div>
//           </div>
//         </header>
//       </Reveal>

//       {/* grid-cols-1 = minmax(0,1fr): children can shrink, so charts/tables
//           never push the page wider than the screen. lg+ is unchanged. */}
//       <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
//         {/* Left (2/3): payout banner, KPI cards, chart */}
//         <Reveal
//           delay={0.1}
//           className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:col-span-2"
//         >
//           {link && <ReferralStrip link={link} />}

//           <StatCards
//             counts={data.counts}
//             earnings={data.earnings}
//             rates={rates}
//             currency={currency}
//             canRequestPayout={data.canRequestPayout}
//           />

//           {/* Shorter chart on phones, 380px from sm up (same as before) */}
//           <div className="h-[380px] min-w-0">
//             <OrdersChart
//               daily={data.daily}
//               range={data.range}
//               bucket={data.bucket}
//               rates={rates}
//               currency={currency}
//             />
//           </div>
//         </Reveal>

//         {/* Right (1/3): earnings donut, then recent orders.
//             Phones: stacked. Tablets (md): two columns side by side.
//             lg+: back to the original flex column. */}
//         <Reveal
//           delay={0.2}
//           className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:flex lg:flex-col"
//         >
//           <div className="min-w-0">
//             <EarningsDonut
//               earnings={data.earnings}
//               rates={rates}
//               currency={currency}
//             />
//           </div>
//           <div className="relative min-h-[360px] min-w-0 flex-1 sm:min-h-[420px] lg:min-h-[300px]">
//             <div className="absolute inset-0">
//               <RecentOrders
//                 orders={data.recentOrders}
//                 rates={rates}
//                 currency={currency}
//               />
//             </div>
//           </div>
//         </Reveal>
//       </div>
//     </div>
//   );
// }
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
//
// RESPONSIVE NOTES
// Desktop (lg: 1024px and up) keeps the exact same classes as before.
// Only mobile (base), small (sm) and tablet (md) values were changed or added.

import Image from "next/image";
import { getMyDashboard } from "@/lib/affiliate/dashboard-queries";

import { StatCards } from "@/components/affiliate/dashboard/stat-cards";
import { OrdersChart } from "@/components/affiliate/dashboard/orders-chart";
import { RecentOrders } from "@/components/affiliate/dashboard/recent-orders";
import { EarningsDonut } from "@/components/affiliate/dashboard/earnings-donut";
import { ReferralStrip } from "@/components/affiliate/dashboard/referral-strip";
import { getMyReferralLink } from "@/lib/affiliate/referral-link-queries";
import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";
import { parseRange } from "@/lib/affiliate/dashboard-ranges";
import { Reveal } from "@/components/affiliate/dashboard/reveal";
// import { GrowthStrip } from "@/components/affiliate/dashboard/growth-strip";

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
      <div className="relative mx-auto mt-6 w-full max-w-lg overflow-hidden rounded-2xl border border-aff-border bg-white p-6 text-center sm:p-8">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-transparent, text-green-deep"
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
  // New affiliate = nothing has happened on the account yet.
  const isNew =
    data.counts.totalOrders === 0 &&
    data.earnings.pendingUsd === 0 &&
    data.earnings.availableUsd === 0 &&
    data.earnings.inReviewUsd === 0 &&
    data.earnings.paidUsd === 0;

  return (
    // w-full + min-w-0: lets the page shrink inside the layout's flex/grid
    // parent instead of forcing sideways scroll on small phones.
    // gap-3 on phones, gap-4 from sm up (desktop value unchanged).
    <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4">
      {/* Welcome banner: dark botanical green, gold edge, artwork on the right */}
      <Reveal>
        <header className="rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
          <div className="aff-sheen relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800">
            {/* One static gold glow (not animated, so it is cheap on phones) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 -z-10 h-56 w-56 rounded-full bg-aff-gold-400/15 blur-3xl"
            />
            {/* Thin inner gold frame */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[6px] rounded-[11px] border border-aff-gold-400/15"
            />
            {/* Gold line on top */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
            />

            {/* Phones: stacked, tighter padding. sm and up: same as before. */}
            <div className="relative z-10 flex min-h-[120px] flex-col justify-center gap-3 px-4 py-4 min-[400px]:min-h-[140px] min-[400px]:gap-4 min-[400px]:px-5 min-[400px]:py-5 sm:min-h-[150px] sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="min-w-0">
                {/* <p className="font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-aff-gold-400/80">
                  Affiliate Dashboard
                </p> */}
                {/* 22px on very small phones, 26px on normal phones, 34px from sm up */}
                <h1 className="mt-1 break-words font-display text-[22px] font-semibold leading-tight text-aff-cream-50 min-[400px]:text-[26px] sm:text-[34px]">
                  {isNew ? "Welcome," : "Welcome back,"}{" "}
                  <span className="bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 bg-clip-text text-transparent">
                    {data.affiliateName ?? "Affiliate"}
                  </span>
                </h1>
                <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-aff-cream-50/75 min-[400px]:text-[13px] sm:text-[14px]">
                  {isNew
                    ? "Your account is ready. Share your referral link to earn your first commission."
                    : "Track your performance, manage orders and grow your earnings."}
                </p>
              </div>

              <p className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-aff-gold-400/40 bg-aff-green-950/60 px-3 py-1.5 font-sans text-[11.5px] font-medium text-aff-gold-300 min-[400px]:px-3.5 min-[400px]:text-[12px]">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-aff-gold-300 shadow-[0_0_8px_2px_rgba(241,204,156,0.6)]"
                />
                <span className="truncate">Your Currency is {currency}</span>
              </p>
            </div>
          </div>
        </header>
      </Reveal>

      {/* grid-cols-1 = minmax(0,1fr): children can shrink, so charts/tables
          never push the page wider than the screen. lg+ is unchanged. */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Left (2/3): payout banner, KPI cards, chart */}
        <Reveal
          delay={0.1}
          className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:col-span-2"
        >
          {link && <ReferralStrip link={link} />}

          <StatCards
            counts={data.counts}
            earnings={data.earnings}
            rates={rates}
            currency={currency}
            canRequestPayout={data.canRequestPayout}
          />

          {/* Below lg the card sizes itself (its header wraps on small screens
              and needs the room). From lg up it is the same fixed 380px as before. */}
          <div className="min-w-0 lg:h-[380px]">
            <OrdersChart
              daily={data.daily}
              range={data.range}
              bucket={data.bucket}
              rates={rates}
              currency={currency}
            />
          </div>
        </Reveal>

        {/* Right (1/3): earnings donut, then recent orders.
            Phones: stacked. Tablets (md): two columns side by side.
            lg+: back to the original flex column. */}
        <Reveal
          delay={0.2}
          className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:flex lg:flex-col"
        >
          <div className="min-w-0">
            <EarningsDonut
              earnings={data.earnings}
              rates={rates}
              currency={currency}
            />
          </div>
          <div className="relative min-h-[360px] min-w-0 flex-1 sm:min-h-[420px] lg:min-h-[300px]">
            <div className="absolute inset-0">
              <RecentOrders
                orders={data.recentOrders}
                rates={rates}
                currency={currency}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}