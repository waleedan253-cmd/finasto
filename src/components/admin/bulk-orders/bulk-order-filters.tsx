"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Segmented } from "antd";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
// Type-only imports: bulk-order-queries.ts is server-only, so nothing
// runtime may be imported from it into a client component.
import type {
  BulkOrderStatus,
  BulkOrderStatusCounts,
} from "@/lib/admin/bulk-order-queries";
import {
  BULK_ORDER_STATUS_LABELS,
  bulkOrderNeedsAction,
} from "@/components/admin/bulk-orders/bulk-order-status-badge";

// Search + status tabs for the Bulk Orders list. State lives in the URL
// (?q=&status=), the same pattern as every other admin list, so the page
// is shareable and the server component re-queries on every change.
//
// There is no "Add" button here on purpose: bulk orders are created by
// stockists from their own dashboard, never by the admin.

const STATUS_ORDER: (BulkOrderStatus | "all")[] = [
  "all",
  "requested",
  "awaiting_payment",
  "payment_submitted",
  "approved",
  "rejected",
  "cancelled",
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function BulkOrderFilters({
  search,
  status,
  counts,
  resultCount,
}: {
  search: string;
  status: BulkOrderStatus | "all";
  counts: BulkOrderStatusCounts;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(search);
  const debouncedQuery = useDebouncedValue(query, 350);

  const updateParams = useCallback(
    (next: { q?: string; status?: string }) => {
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
      params.delete("page"); // any filter change goes back to page 1

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  // Fires only after typing pauses, and only if it differs from the URL.
  useEffect(() => {
    if (debouncedQuery !== search) updateParams({ q: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const options = STATUS_ORDER.map((value) => {
    const label = value === "all" ? "All" : BULK_ORDER_STATUS_LABELS[value];
    const count = counts[value];
    // Copper count = "this is waiting for you".
    const highlight =
      value !== "all" && bulkOrderNeedsAction(value) && count > 0;

    return {
      value,
      label: (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {label}
          <span
            className={cn(
              "rounded-full px-1.5 font-sans text-[11px] tabular-nums",
              highlight
                ? "bg-copper/15 font-medium text-copper"
                : "text-warm-gray",
            )}
          >
            {count}
          </span>
        </span>
      ),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <Input
        prefix={
          <Search
            className="h-4 w-4 text-warm-gray"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by order number (BO-000123) or stockist..."
        allowClear
        className="w-full sm:max-w-md"
        style={{ height: 44 }}
        aria-label="Search bulk orders"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Seven tabs are wider than a phone, so they scroll sideways
            inside this box instead of breaking the page layout. */}
        <div className="max-w-full overflow-x-auto pb-1">
          <Segmented
            value={status}
            onChange={(value) => updateParams({ status: value as string })}
            options={options}
          />
        </div>

        <p
          aria-live="polite"
          className="font-sans text-[13px] text-warm-gray transition-opacity"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {resultCount} {resultCount === 1 ? "order" : "orders"}
        </p>
      </div>
    </div>
  );
}
