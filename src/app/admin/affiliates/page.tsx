import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  listAffiliates,
  type AffiliateStatus,
  type AffiliateStockistFilter,
} from "@/lib/admin/affiliate-queries";
import { listActiveStockistOptions } from "@/lib/admin/stockist-queries";
import { AffiliateFilters } from "@/components/admin/affiliates/affiliate-filters";
import { AffiliateTable } from "@/components/admin/affiliates/affiliate-table";

const PAGE_SIZE = 20;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  stockist?: string;
  page?: string;
}>;

export default async function AffiliatesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  // Never trust URL params: whitelist every value before it reaches a query.
  const search = (sp.q ?? "").trim();
  const status: AffiliateStatus | "all" =
    sp.status === "active" || sp.status === "inactive" ? sp.status : "all";
  const stockist: AffiliateStockistFilter =
    sp.stockist === "unassigned"
      ? "unassigned"
      : sp.stockist && UUID_RE.test(sp.stockist)
        ? sp.stockist
        : "all";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [result, stockistOptions] = await Promise.all([
    listAffiliates({ search, status, stockist, page, pageSize: PAGE_SIZE }),
    listActiveStockistOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status !== "all") params.set("status", status);
    if (stockist !== "all") params.set("stockist", stockist);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/admin/affiliates?${qs}` : "/admin/affiliates";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Affiliates
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Add affiliates, optionally assign them to a stockist, and track their
          status.
        </p>
      </div>

      <AffiliateFilters
        search={search}
        status={status}
        stockist={stockist}
        stockistOptions={stockistOptions}
        resultCount={result.total}
      />

      <AffiliateTable
        affiliates={result.items}
        page={result.page}
        pageSize={result.pageSize}
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
