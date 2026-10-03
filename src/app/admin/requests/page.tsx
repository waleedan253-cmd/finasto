import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  getRequestCounts,
  listRequests,
  type RequestStatus,
} from "@/lib/admin/request-queries";
import { RequestFilters } from "@/components/admin/requests/request-filters";
import { RequestTable } from "@/components/admin/requests/request-table";

// Admin Requests page: stockist requests to move an affiliate to another
// stockist, in three tabs (Pending | Approved | Rejected).
//
// The tab and the page number live in the URL (?status=...&page=...), so
// this is a server component: it reads them, loads one page of rows plus
// the tab counts in parallel, and hands plain data to the client components.

export const metadata: Metadata = {
  title: "Requests — Finasto Admin",
  robots: { index: false, follow: false },
};

const STATUSES: RequestStatus[] = ["pending", "approved", "rejected"];

function pageHref(status: RequestStatus, page: number) {
  const params = new URLSearchParams({ status });
  if (page > 1) params.set("page", String(page));
  return `/admin/requests?${params.toString()}`;
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;

  // Anything that is not a known tab falls back to Pending.
  const status: RequestStatus = STATUSES.includes(
    params.status as RequestStatus,
  )
    ? (params.status as RequestStatus)
    : "pending";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [result, counts] = await Promise.all([
    listRequests({ status, page }),
    getRequestCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  // E.g. the admin decided the last request on page 2, so page 2 is now
  // empty: send them to the last page that still exists.
  if (page > totalPages) redirect(pageHref(status, totalPages));

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Requests
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Stockists ask to move an affiliate to another stockist. Nothing
          changes until you approve a request.
        </p>
      </div>

      <Suspense fallback={null}>
        <RequestFilters status={status} counts={counts} />
      </Suspense>

      <RequestTable
        requests={result.items}
        status={status}
        startIndex={(result.page - 1) * result.pageSize}
      />

      {totalPages > 1 && (
        <nav
          aria-label="Requests pagination"
          className="flex items-center justify-between gap-3"
        >
          <p className="font-sans text-[13px] text-warm-gray">
            Page {result.page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={pageHref(status, result.page - 1)}
                className="inline-flex h-9 items-center rounded-full border border-border-strong px-4 font-sans text-[13px] font-medium text-espresso transition-colors hover:border-copper"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center rounded-full border border-border px-4 font-sans text-[13px] text-warm-gray opacity-50">
                Previous
              </span>
            )}
            {result.page < totalPages ? (
              <Link
                href={pageHref(status, result.page + 1)}
                className="inline-flex h-9 items-center rounded-full border border-border-strong px-4 font-sans text-[13px] font-medium text-espresso transition-colors hover:border-copper"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center rounded-full border border-border px-4 font-sans text-[13px] text-warm-gray opacity-50">
                Next
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
