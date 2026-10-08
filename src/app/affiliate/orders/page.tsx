import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listMyOrders } from "@/lib/affiliate/orders-queries";
import { createClient } from "@/lib/supabase/server";
import type { RateMap } from "@/lib/currency";
import { OrdersFilters } from "@/components/affiliate/orders/orders-filters";
import { OrdersTable } from "@/components/affiliate/orders/orders-table";
import {
  isCommissionState,
  isOrderStatus,
  isPaymentStatus,
} from "@/components/affiliate/orders/order-status-badge";

// /affiliate/orders
//
// The affiliate's order history: customer first name and masked email,
// order and payment status, commission and where that commission stands.
// Role and active-status checks happen in app/affiliate/layout.tsx;
// listMyOrders() re-checks the role, and the database only ever returns
// this affiliate's own orders.

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  payment?: string;
  commission?: string;
  page?: string;
}>;

export default async function AffiliateOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  // Never trust URL params: whitelist every value before it reaches a query.
  const search = (sp.q ?? "").trim().slice(0, 100);
  const status = isOrderStatus(sp.status) ? sp.status : undefined;
  const paymentStatus = isPaymentStatus(sp.payment) ? sp.payment : undefined;
  const commissionState = isCommissionState(sp.commission)
    ? sp.commission
    : undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const result = await listMyOrders({
    search,
    status,
    paymentStatus,
    commissionState,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

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

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    if (paymentStatus) params.set("payment", paymentStatus);
    if (commissionState) params.set("commission", commissionState);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/affiliate/orders?${qs}` : "/affiliate/orders";
  }

  // A hand-edited ?page=99 (or a filter that shrank the list) would show
  // an empty page: go to the last real page instead.
  if (page > totalPages) redirect(pageHref(totalPages));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Orders
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Orders placed through your referral links, with their status and the
          commission you earn on each.
        </p>
      </div>

      <OrdersFilters
        search={search}
        status={status}
        paymentStatus={paymentStatus}
        commissionState={commissionState}
        resultCount={result.total}
      />

      <OrdersTable
        orders={result.rows}
        page={result.page}
        pageSize={result.pageSize}
        rates={rates}
      />

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between font-sans text-[13px] text-warm-gray"
        >
          <span>
            Page {result.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={pageHref(result.page - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-border-strong px-4 text-espresso hover:border-copper"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Link>
            ) : null}
            {result.page < totalPages ? (
              <Link
                href={pageHref(result.page + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-border-strong px-4 text-espresso hover:border-copper"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </nav>
      )}
    </div>
  );
}
