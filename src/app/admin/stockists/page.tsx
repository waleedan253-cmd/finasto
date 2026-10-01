import type { Metadata } from "next";
import { listStockists } from "@/lib/admin/stockist-queries";
import { StockistFilters } from "@/components/admin/stockists/stockist-filters";
import { StockistTable } from "@/components/admin/stockists/stockist-table";
import type { StockistStatus } from "@/lib/admin/stockist-queries";

export const metadata: Metadata = {
  title: "Stockists — Finasto Admin",
  robots: { index: false, follow: false },
};

const VALID_STATUSES: (StockistStatus | "all")[] = [
  "all",
  "active",
  "inactive",
];

function parseStatus(value: string | undefined): StockistStatus | "all" {
  return VALID_STATUSES.includes(value as StockistStatus | "all")
    ? (value as StockistStatus | "all")
    : "all";
}

export default async function AdminStockistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const status = parseStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, pageSize } = await listStockists({
    search,
    status,
    page,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Stockists
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Manage bulk-buying partners, their assigned affiliates, and default
          profit share.
        </p>
      </div>

      <StockistFilters search={search} status={status} resultCount={total} />
      <StockistTable stockists={items} page={page} pageSize={pageSize} />

      {total > pageSize && (
        <p className="text-center font-sans text-[13px] text-warm-gray">
          Showing {items.length} of {total} stockists
        </p>
      )}
    </div>
  );
}
