// Affiliate Payout Requests page. Server component: it only loads data and
// hands it to client components. Ant Design components run in the browser,
// so no antd component is used directly in this file.

import { redirect } from "next/navigation";
import { getMyPayoutPageData } from "@/lib/affiliate/payout-queries";
import EligibleOrdersTable from "@/components/affiliate/payouts/eligible-orders-table";
import PayoutRequestsList from "@/components/affiliate/payouts/payout-requests-list";
import { createClient } from "@/lib/supabase/server";
import type { RateMap } from "@/lib/currency";

export const metadata = { title: "Payout Requests" };

export default async function AffiliatePayoutsPage() {
  const data = await getMyPayoutPageData();

  // No affiliate row for this user: nothing to show here.
  if (!data) redirect("/login");

  const { summary, eligibleOrders, bank, minPayoutUsd, requests } = data;
  const supabase = await createClient();
  const { data: rateRows } = await supabase
    .from("currency_rates")
    .select("currency_code, rate_to_base, updated_at");
  const rates: RateMap = {};
  for (const r of rateRows ?? []) {
    rates[String(r.currency_code).toUpperCase()] = {
      rateToBase: Number(r.rate_to_base),
      updatedAt: r.updated_at as string,
    };
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "16px clamp(12px, 3vw, 24px)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 26px)" }}>
        Payout Requests
      </h1>

      <EligibleOrdersTable
        summary={summary}
        orders={eligibleOrders}
        bank={bank}
        minPayoutUsd={minPayoutUsd}
        rates={rates}
      />

      <PayoutRequestsList requests={requests} rates={rates} />
    </div>
  );
}
