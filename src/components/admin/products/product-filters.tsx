"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Segmented, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/admin/product-queries";

// Search + status filter bar for the Products list. State lives in the
// URL (?q=&status=), same pattern as the dashboard's date range, so the
// server component re-queries and the page stays shareable/bookmarkable.

const STATUS_OPTIONS: { value: ProductStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "disabled", label: "Disabled" },
];

// Keeps keystrokes from firing a navigation on every letter.
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function ProductFilters({
  search,
  status,
  resultCount,
}: {
  search: string;
  status: ProductStatus | "all";
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
      params.delete("page"); // any filter change resets pagination

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  // Fires only after the debounce settles, and only when it actually
  // changed from what's in the URL (avoids a redundant push on mount).
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
          // loading={isPending}
          placeholder="Search by name..."
          aria-label="Search products"
          onChange={(e) => setQuery(e.target.value)}
          // Enter / search icon applies immediately, skipping the debounce.
          onSearch={(value) => updateParams({ q: value.trim() })}
          className="w-full sm:max-w-sm"
        />

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => router.push("/admin/products/new")}
        >
          Add product
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: String(value) })}
          aria-label="Filter by status"
        />

        <Typography.Text
          type="secondary"
          aria-live="polite"
          className={cn("transition-opacity", isPending && "opacity-60")}
        >
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </Typography.Text>
      </div>
    </div>
  );
}
