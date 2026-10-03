"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Switch } from "antd";
import { Search } from "lucide-react";

// Search + "low stock only" toggle for the Inventory list. Same
// URL-state pattern as every other admin list (product-filters.tsx,
// stockist-filters.tsx): state lives in ?q=&low=, so the page stays
// shareable/bookmarkable and the server component re-queries.

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function InventoryFilters({
  search,
  lowStockOnly,
  resultCount,
}: {
  search: string;
  lowStockOnly: boolean;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(search);
  const debouncedQuery = useDebouncedValue(query, 350);

  const updateParams = useCallback(
    (next: { q?: string; low?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.low !== undefined) {
        if (next.low) params.set("low", "1");
        else params.delete("low");
      }
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (debouncedQuery !== search) updateParams({ q: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input.Search
        size="large"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by product or SKU..."
        allowClear
        className="w-full sm:max-w-sm"
        aria-label="Search inventory"
      />

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <label className="flex items-center gap-2 font-sans text-[13px] text-espresso/80">
          <Switch
            checked={lowStockOnly}
            onChange={(checked) => updateParams({ low: checked })}
            size="small"
          />
          Low stock only
        </label>

        <p
          aria-live="polite"
          className="font-sans text-[13px] text-warm-gray transition-opacity"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {resultCount} {resultCount === 1 ? "item" : "items"}
        </p>
      </div>
    </div>
  );
}
