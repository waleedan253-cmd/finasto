"use client";

import type { ProductState } from "@/data/products";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const stateOptions: { value: ProductState; label: string }[] = [
  { value: "new", label: "New" },
  { value: "available", label: "Available" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export type ShopFiltersState = {
  categories: string[];
  maxPrice: number | null;
  states: ProductState[];
};

export function ShopFilters({
  allCategories,
  priceMin,
  priceMax,
  currency,
  value,
  onChange,
}: {
  allCategories: string[];
  priceMin: number;
  priceMax: number;
  currency: string;
  value: ShopFiltersState;
  onChange: (next: ShopFiltersState) => void;
}) {
  function toggleCategory(category: string) {
    const isSelected = value.categories.includes(category);
    onChange({
      ...value,
      categories: isSelected
        ? value.categories.filter((c) => c !== category)
        : [...value.categories, category],
    });
  }

  function toggleState(state: ProductState) {
    const isSelected = value.states.includes(state);
    onChange({
      ...value,
      states: isSelected
        ? value.states.filter((s) => s !== state)
        : [...value.states, state],
    });
  }
  const activeCount =
    value.categories.length +
    value.states.length +
    (value.maxPrice !== null && value.maxPrice < priceMax ? 1 : 0);

  function clearAll() {
    onChange({ categories: [], states: [], maxPrice: null });
  }
  const [isOpen, setIsOpen] = useState(false);
  // IDR and PKR have large numbers, other currencies need small steps.
  const step = currency === "IDR" ? 1000 : currency === "PKR" ? 100 : 0.5;
  return (
    <aside className="w-full shrink-0 lg:w-[240px]">
      <div className="rounded-[16px] border border-border bg-white p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="flex items-center gap-2 font-sans text-[15px] font-semibold text-espresso">
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso px-1.5 font-sans text-[11px] font-semibold text-white">
                {activeCount}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-4">
            {activeCount > 0 && (
              <button
                style={{
                  cursor: "pointer",
                }}
                type="button"
                onClick={clearAll}
                className="font-sans text-[13px] text-copper underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="shop-filter-panel"
              className="flex items-center gap-1 font-sans text-[13px] text-espresso/80 lg:hidden"
            >
              {isOpen ? "Hide" : "Show"}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <div
          id="shop-filter-panel"
          className={cn(isOpen ? "block" : "hidden", "lg:block")}
        >
          <FilterGroup title="Shop by Category">
            <ul className="flex flex-col gap-2.5">
              {allCategories.map((category) => (
                <li key={category}>
                  <Checkbox
                    label={category}
                    checked={value.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup title="Filter by Price">
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              step={1000}
              value={value.maxPrice ?? priceMax}
              onChange={(e) =>
                onChange({ ...value, maxPrice: Number(e.target.value) })
              }
              className="w-full accent-copper"
              aria-label="Maximum price"
            />
            <div className="mt-1 flex items-center justify-between font-sans text-[12px] text-warm-gray">
              <span>{formatPrice(priceMin, currency)}</span>
              <span>{formatPrice(value.maxPrice ?? priceMax, currency)}</span>
            </div>
          </FilterGroup>

          <FilterGroup title="Availability">
            <ul className="flex flex-col gap-2.5">
              {stateOptions.map((option) => (
                <li key={option.value}>
                  <Checkbox
                    label={option.label}
                    checked={value.states.includes(option.value)}
                    onChange={() => toggleState(option.value)}
                  />
                </li>
              ))}
            </ul>
          </FilterGroup>
        </div>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-5 last:border-b-0 last:pb-0">
      <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-espresso">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 font-sans text-[14px] text-espresso/85">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border-strong accent-copper"
      />
      {label}
    </label>
  );
}
