"use client";

import { Search } from "lucide-react";

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

const sortLabels: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A to Z",
};

export function ShopToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  resultCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  resultCount: number;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
          strokeWidth={1.6}
          aria-hidden="true"
        />
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <input
          id="shop-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for tea or blend..."
          className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 font-sans text-[14px] text-espresso placeholder:text-warm-gray focus:border-copper focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="font-sans text-[13px] text-warm-gray">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
        <label className="flex items-center gap-2 font-sans text-[13px] text-espresso/80">
          Sort by
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-10 rounded-full border border-border bg-white px-3 font-sans text-[13px] text-espresso focus:border-copper focus:outline-none"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
