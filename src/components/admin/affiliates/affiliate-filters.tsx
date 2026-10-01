"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, Segmented, Select } from "antd";
import { Plus } from "lucide-react";
import type {
  AffiliateStatus,
  AffiliateStockistFilter,
} from "@/lib/admin/affiliate-queries";

// Search + status + stockist filter bar for the Affiliates list. State
// lives in the URL (?q=&status=&stockist=), same pattern as
// stockist-filters.tsx, so the list stays shareable/bookmarkable and the
// server component re-queries on every change.
//
// The stockist filter has three kinds of value:
//   "all"        -> every affiliate (param removed from the URL)
//   "unassigned" -> affiliates with no stockist
//   <uuid>       -> affiliates assigned to that stockist

const STATUS_OPTIONS: { value: AffiliateStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function AffiliateFilters({
  search,
  status,
  stockist,
  stockistOptions,
  resultCount,
}: {
  search: string;
  status: AffiliateStatus | "all";
  stockist: AffiliateStockistFilter;
  stockistOptions: { id: string; name: string }[];
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(search);
  const debouncedQuery = useDebouncedValue(query, 350);

  const updateParams = useCallback(
    (next: { q?: string; status?: string; stockist?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.status !== undefined) {
        if (next.status && next.status !== "all")
          params.set("status", next.status);
        else params.delete("status");
      }
      if (next.stockist !== undefined) {
        if (next.stockist && next.stockist !== "all")
          params.set("stockist", next.stockist);
        else params.delete("stockist");
      }
      params.delete("page");

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (debouncedQuery !== search) updateParams({ q: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input.Search
          size="large"
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full sm:max-w-sm"
          aria-label="Search affiliates"
        />

        <Link
          href="/admin/affiliates/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Add Affiliate
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={status}
            onChange={(value) => updateParams({ status: value as string })}
            options={STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />

          <Select
            value={stockist}
            onChange={(value) => updateParams({ stockist: value })}
            showSearch
            variant="borderless"
            style={{
              minWidth: 200,
              border: "none",
              boxShadow: "none",
              outline: "none",
            }}
            className="stockist-select"
            optionFilterProp="label"
            aria-label="Filter by stockist"
            options={[
              { value: "all", label: "All stockists" },
              { value: "unassigned", label: "Unassigned" },
              ...stockistOptions.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
          />
        </div>

        <p
          aria-live="polite"
          className="font-sans text-[13px] text-warm-gray transition-opacity"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {resultCount} {resultCount === 1 ? "affiliate" : "affiliates"}
        </p>
      </div>
    </div>
  );
}
