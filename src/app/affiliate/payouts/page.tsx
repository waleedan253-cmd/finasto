// Affiliate Payout Requests page. Server component: it only loads data and
// hands it to client components. Ant Design components run in the browser,
// so no antd component is used directly in this file.

import { redirect } from "next/navigation";
import { getMyPayoutPageData } from "@/lib/affiliate/payout-queries";
import EligibleOrdersTable from "@/components/affiliate/payouts/eligible-orders-table";
import PayoutRequestsList from "@/components/affiliate/payouts/payout-requests-list";
import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";
import { Reveal } from "@/components/affiliate/dashboard/reveal";

export const metadata = { title: "Payout Requests" };

export default async function AffiliatePayoutsPage() {
  const data = await getMyPayoutPageData();

  // No affiliate row for this user: nothing to show here.
  if (!data) redirect("/login");

  const { summary, eligibleOrders, bank, minPayoutUsd, requests } = data;
  // The affiliate's locked display currency and the rates (display only).
  const { currency, rates } = await getAffiliateDisplay();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:gap-6">
      <Reveal>
        <header className="rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
          <div className="relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 -z-10 h-48 w-48 rounded-full bg-aff-gold-400/15 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
            />

            <div className="relative z-10 flex flex-col justify-center gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div className="min-w-0">
                <h1 className="break-words font-display text-[24px] font-semibold leading-tight text-aff-cream-50 sm:text-[30px]">
                  Payout{" "}
                  <span className="bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 bg-clip-text text-transparent">
                    Requests
                  </span>
                </h1>
                <p className="mt-1.5 max-w-xl font-sans text-[13px] leading-relaxed text-aff-cream-50/75 sm:text-[14px]">
                  Pick the orders you want paid, send a request, and track it
                  until the money reaches your bank.
                </p>
              </div>

              <p className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-aff-gold-400/40 bg-aff-green-950/60 px-3.5 py-1.5 font-sans text-[12px] font-medium text-aff-gold-300">
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

      <EligibleOrdersTable
        summary={summary}
        orders={eligibleOrders}
        bank={bank}
        minPayoutUsd={minPayoutUsd}
        rates={rates}
        currency={currency}
      />

      <PayoutRequestsList
        requests={requests}
        rates={rates}
        currency={currency}
      />
    </div>
  );
}
