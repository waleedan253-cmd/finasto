"use client";

import { Input } from "antd";
import { Select } from "antd";
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
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between" >
      <div className="relative flex-1 sm:max-w-sm"  >
      
       
        <Input.Search
          id="shop-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for tea or blend..."
          className="   pl-10 pr-4 font-sans text-[14px] text-espresso placeholder:text-warm-gray focus:border-copper focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="font-sans text-[13px] text-warm-gray">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
                <div className="flex items-center gap-2 font-sans text-[13px] text-warm-gray">
          <span>Sort by</span>
          <Select<SortOption>
            className="sort-select"
            value={sort}
            onChange={onSortChange}
            options={Object.entries(sortLabels).map(([value, label]) => ({
              value: value as SortOption,
              label,
            }))}
            style={{ minWidth: 170 }}
            aria-label="Sort products"
          />
        </div>
      </div>
    </div>
  );
}
