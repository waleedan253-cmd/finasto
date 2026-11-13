import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listMyOrders } from "@/lib/affiliate/orders-queries";

import { getAffiliateDisplay } from "@/lib/affiliate/display-currency";
import { Reveal } from "@/components/affiliate/dashboard/reveal";
import { OrdersFilters } from "@/components/affiliate/orders/orders-filters";
import { OrdersTable } from "@/components/affiliate/orders/orders-table";
import {
  isCommissionState,
  isOrderStatus,
  isPaymentStatus,
} from "@/components/affiliate/orders/order-status-badge";

export const metadata = { title: "Orders" };
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

  // The affiliate's locked display currency and the rates (display only).
  const { currency, rates } = await getAffiliateDisplay();

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
    <div className="flex flex-col gap-4 sm:gap-6">
      <Reveal>
        <header className="rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-20px_rgba(172,131,78,0.55)]">
          <div className="relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800">
            {/* static gold glow */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 -z-10 h-48 w-48 rounded-full bg-aff-gold-400/15 blur-3xl"
            />
            {/* thin gold line on top */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
            />

            <div className="relative z-10 flex flex-col justify-center gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div className="min-w-0">
                <h1 className="break-words font-display text-[24px] font-semibold leading-tight text-aff-cream-50 sm:text-[30px]">
                  Your{" "}
                  <span className="bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 bg-clip-text text-transparent">
                    Orders
                  </span>
                </h1>
                <p className="mt-1.5 max-w-xl font-sans text-[13px] leading-relaxed text-aff-cream-50/75 sm:text-[14px]">
                  Orders placed through your referral links, with their status
                  and the commission you earn on each.
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
        currency={currency}
      />

   
              {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-aff-border bg-white px-4 py-3 font-sans text-[13px] text-aff-muted"
        >
          <span>
            Page{" "}
            <span className="font-semibold text-aff-green-900">
              {result.page}
            </span>{" "}
            of {totalPages}
          </span>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={pageHref(result.page - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-aff-border bg-white px-4 font-medium text-aff-green-900 transition-colors hover:border-aff-gold-500 hover:bg-aff-ivory"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Link>
            ) : null}
            {result.page < totalPages ? (
              <Link
                href={pageHref(result.page + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-aff-green-900 px-4 font-medium text-aff-gold-300 transition-colors hover:bg-aff-green-800"
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
