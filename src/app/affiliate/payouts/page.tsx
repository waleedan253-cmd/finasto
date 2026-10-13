// Affiliate Payout Requests page. Server component: it only loads data and
// hands it to client components. Ant Design components run in the browser,
// so no antd component is used directly in this file.

import { redirect } from "next/navigation";
import { getMyPayoutPageData } from "@/lib/affiliate/payout-queries";
import EligibleOrdersTable from "@/components/affiliate/payouts/eligible-orders-table";
import PayoutRequestsList from "@/components/affiliate/payouts/payout-requests-list";
import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";

export const metadata = { title: "Payout Requests" };

export default async function AffiliatePayoutsPage() {
  const data = await getMyPayoutPageData();

  // No affiliate row for this user: nothing to show here.
  if (!data) redirect("/login");

  const { summary, eligibleOrders, bank, minPayoutUsd, requests } = data;
  // The affiliate's locked display currency and the rates (display only).
  const { currency, rates } = await getAffiliateDisplay();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
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
