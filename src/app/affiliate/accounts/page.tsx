// Affiliate Accounts page: payouts that were paid, with the orders in each
// one, the date and time, and a link to the payment proof. Server
// component: it loads data and hands it to a client component.

import { redirect } from "next/navigation";
import { getMyPaidPayouts } from "@/lib/affiliate/payout-queries";
import PaidPayoutsList from "@/components/affiliate/accounts/paid-payouts-list";
import { createClient } from "@/lib/supabase/server";
import type { RateMap } from "@/lib/currency";

export const metadata = { title: "Accounts" };

export default async function AffiliateAccountsPage() {
  const payouts = await getMyPaidPayouts();

  // No affiliate row for this user: nothing to show here.
  if (!payouts) redirect("/login");
  if (!payouts) redirect("/login");

  // Exchange rates for the "approx." amounts (display only).
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
        Accounts
      </h1>

      <PaidPayoutsList payouts={payouts} rates={rates} />
    </div>
  );
}
