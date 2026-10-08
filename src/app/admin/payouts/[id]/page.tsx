// Admin page for ONE payout request. Server component: it loads the
// request and hands it to a client component that draws everything and
// holds the action buttons.
//
// Next 15: params is a Promise, so it must be awaited.
// (Next 14: type it as { id: string } and remove the await.)

import { notFound } from "next/navigation";
import { getAdminPayoutDetail } from "@/lib/admin/payout-queries";
import PayoutDetail from "@/components/admin/payouts/payout-detail";
import { createClient } from "@/lib/supabase/server";
import type { RateMap } from "@/lib/currency";

export const metadata = { title: "Payout Request" };

export default async function AdminPayoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const detail = await getAdminPayoutDetail(id);

  // A bad id, or a request that does not exist, is a 404 page.
  if (!detail) notFound();

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
        gap: 16,
      }}
    >
      <PayoutDetail detail={detail} rates={rates} />
    </div>
  );
}
