// Admin list of all payout requests. Server component: it reads the
// filters from the URL, loads one page of rows, and hands them to client
// components.
//
// Next 15: searchParams is a Promise, so it must be awaited.
// (Next 14: type it as a plain object and remove the await.)

import {
  getAdminPayoutList,
  PAYOUT_STATUSES,
} from "@/lib/admin/payout-queries";
import PayoutFilters from "@/components/admin/payouts/payout-filters";
import PayoutTable from "@/components/admin/payouts/payout-table";

import { createClient } from "@/lib/supabase/server";
import type { RateMap } from "@/lib/currency";

export const metadata = { title: "Payouts" };

type SearchParams = Promise<{
  status?: string | string[];
  search?: string | string[];
  page?: string | string[];
}>;

// A query value can be a string, an array (?status=a&status=b) or missing.
const first = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  // Only a known status is kept. Anything else means "all statuses".
  const rawStatus = first(sp.status);
  const status = PAYOUT_STATUSES.some((s) => s === rawStatus) ? rawStatus : "";
  const search = first(sp.search).trim().slice(0, 40);
  const page = Math.max(1, parseInt(first(sp.page), 10) || 1);

  const list = await getAdminPayoutList({ status, search, page });
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
      <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 26px)" }}>
        Payout Requests
      </h1>

      <PayoutFilters status={status} search={search} />

      <PayoutTable list={list} status={status} search={search} rates={rates} />
    </div>
  );
}
