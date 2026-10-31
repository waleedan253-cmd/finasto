// "use client";

// import type { ProductState } from "@/data/products";
// import { useState } from "react";
// import { ChevronDown } from "lucide-react";
// import { cn, formatPrice } from "@/lib/utils";

// const stateOptions: { value: ProductState; label: string }[] = [
//   { value: "new", label: "New" },
//   { value: "available", label: "Available" },
//   { value: "low-stock", label: "Low Stock" },
//   { value: "out-of-stock", label: "Out of Stock" },
//   { value: "offer", label: "Offer" },
// ];

// export type ShopFiltersState = {
//   categories: string[];
//   maxPrice: number | null;
//   states: ProductState[];
// };

// export function ShopFilters({
//   allCategories,
//   priceMin,
//   priceMax,
//   currency,
//   value,
//   onChange,
// }: {
//   allCategories: string[];
//   priceMin: number;
//   priceMax: number;
//   currency: string;
//   value: ShopFiltersState;
//   onChange: (next: ShopFiltersState) => void;
// }) {
//   function toggleCategory(category: string) {
//     const isSelected = value.categories.includes(category);
//     onChange({
//       ...value,
//       categories: isSelected
//         ? value.categories.filter((c) => c !== category)
//         : [...value.categories, category],
//     });
//   }

//   function toggleState(state: ProductState) {
//     const isSelected = value.states.includes(state);
//     onChange({
//       ...value,
//       states: isSelected
//         ? value.states.filter((s) => s !== state)
//         : [...value.states, state],
//     });
//   }
//   const activeCount =
//     value.categories.length +
//     value.states.length +
//     (value.maxPrice !== null && value.maxPrice < priceMax ? 1 : 0);

//   function clearAll() {
//     onChange({ categories: [], states: [], maxPrice: null });
//   }
//   const [isOpen, setIsOpen] = useState(false);
//   // IDR and PKR have large numbers, other currencies need small steps.
//   const step = currency === "IDR" ? 1000 : currency === "PKR" ? 100 : 0.5;
//   return (
//     <aside className="w-full shrink-0 lg:w-[240px]">
//       <div className="rounded-2xl border border-border-strong bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] dark:border-border dark:shadow-[inset_0_1px_0_rgba(247,240,228,0.07)] lg:sticky lg:top-24">
//         <div className="flex items-center justify-between border-b border-border pb-4">
//           <h2 className="flex items-center gap-2 font-sans text-[15px] font-semibold text-espresso">
//             Filters
//             {activeCount > 0 && (
//               <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1.5 font-sans text-[11px] font-semibold text-espresso-deep">
//                 {activeCount}
//               </span>
//             )}
//           </h2>
//           <div className="flex items-center gap-4">
//             {activeCount > 0 && (
//               <button
//                 style={{
//                   cursor: "pointer",
//                 }}
//                 type="button"
//                 onClick={clearAll}
//                 className="font-sans text-[13px] text-copper underline-offset-4 hover:underline"
//               >
//                 Clear all
//               </button>
//             )}
//             <button
//               type="button"
//               onClick={() => setIsOpen((prev) => !prev)}
//               aria-expanded={isOpen}
//               aria-controls="shop-filter-panel"
//               className="flex items-center gap-1 font-sans text-[13px] text-espresso/80 lg:hidden"
//             >
//               {isOpen ? "Hide" : "Show"}
//               <ChevronDown
//                 className={cn(
//                   "h-4 w-4 transition-transform duration-200",
//                   isOpen && "rotate-180",
//                 )}
//                 aria-hidden="true"
//               />
//             </button>
//           </div>
//         </div>
//         <div
//           id="shop-filter-panel"
//           className={cn(isOpen ? "block" : "hidden", "lg:block")}
//         >
//           <FilterGroup title="Shop by Category">
//             <ul className="flex flex-col gap-2.5">
//               {allCategories.map((category) => (
//                 <li key={category}>
//                   <Checkbox
//                     label={category}
//                     checked={value.categories.includes(category)}
//                     onChange={() => toggleCategory(category)}
//                   />
//                 </li>
//               ))}
//             </ul>
//           </FilterGroup>

//           <FilterGroup title="Filter by Price">
//             <input
//               type="range"
//               min={priceMin}
//               max={priceMax}
//               step={step}
//               value={value.maxPrice ?? priceMax}
//               onChange={(e) =>
//                 onChange({ ...value, maxPrice: Number(e.target.value) })
//               }
//               className="w-full accent-copper"
//               aria-label="Maximum price"
//             />
//             <div className="mt-1 flex items-center justify-between font-sans text-[12px] text-warm-gray">
//               <span>{formatPrice(priceMin, currency)}</span>
//               <span>{formatPrice(value.maxPrice ?? priceMax, currency)}</span>
//             </div>
//           </FilterGroup>

//           <FilterGroup title="Availability">
//             <ul className="flex flex-col gap-2.5">
//               {stateOptions.map((option) => (
//                 <li key={option.value}>
//                   <Checkbox
//                     label={option.label}
//                     checked={value.states.includes(option.value)}
//                     onChange={() => toggleState(option.value)}
//                   />
//                 </li>
//               ))}
//             </ul>
//           </FilterGroup>
//         </div>
//       </div>
//     </aside>
//   );
// }

// function FilterGroup({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="border-b border-border py-5 last:border-b-0 last:pb-0">
//       <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-espresso">
//         {title}
//       </h3>
//       <div className="mt-4">{children}</div>
//     </div>
//   );
// }

// function Checkbox({
//   label,
//   checked,
//   onChange,
// }: {
//   label: string;
//   checked: boolean;
//   onChange: () => void;
// }) {
//   return (
//     <label className="flex cursor-pointer items-center gap-2.5 font-sans text-[14px] text-espresso/85">
//       <input
//         type="checkbox"
//         checked={checked}
//         onChange={onChange}
//         className="h-4 w-4 rounded border-border-strong accent-copper"
//       />
//       {label}
//     </label>
//   );
// }
"use client";

import type { ProductState } from "@/data/products";
import { useState } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const stateOptions: { value: ProductState; label: string; dot: string }[] = [
  { value: "new", label: "New", dot: "bg-green" },
  { value: "available", label: "Available", dot: "bg-green" },
  { value: "low-stock", label: "Low Stock", dot: "bg-copper" },
  { value: "out-of-stock", label: "Out of Stock", dot: "bg-red" },
  { value: "offer", label: "Offer", dot: "bg-copper-light" },
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

  const currentMax = value.maxPrice ?? priceMax;
  const pricePct =
    priceMax > priceMin
      ? Math.min(
          100,
          Math.max(0, ((currentMax - priceMin) / (priceMax - priceMin)) * 100),
        )
      : 100;

  return (
    <aside className="w-full shrink-0 lg:w-[250px]">
      <div className="relative overflow-hidden rounded-[22px] border border-border-strong bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_14px_34px_-18px_rgba(35,77,42,0.3)] dark:border-border dark:shadow-[inset_0_1px_0_rgba(247,240,228,0.07)] lg:sticky lg:top-24">
        {/* top accent line */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent"
        />

        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <h2 className="flex items-center gap-2.5 font-sans text-[15px] font-semibold text-espresso">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-copper/10 text-copper">
              <SlidersHorizontal
                className="h-4 w-4"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1.5 font-sans text-[11px] font-semibold text-espresso-deep">
                {activeCount}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                style={{
                  cursor: "pointer",
                }}
                type="button"
                onClick={clearAll}
                className="rounded font-sans text-[13px] text-copper underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="shop-filter-panel"
              style={{ cursor: "pointer" }}
              className="flex items-center gap-1 rounded-full border border-border-strong px-3 py-1.5 font-sans text-[13px] text-espresso/80 transition-colors hover:border-copper/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 lg:hidden"
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
            <ul className="-mx-2 flex flex-col gap-0.5">
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
            <div className="flex items-center justify-between">
              <span className="font-sans text-[12px] text-warm-gray">
                Up to
              </span>
              <span className="rounded-full bg-copper/10 px-3 py-1 font-sans text-[13px] font-semibold tabular-nums text-copper">
                {formatPrice(currentMax, currency)}
              </span>
            </div>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              step={step}
              value={currentMax}
              onChange={(e) =>
                onChange({ ...value, maxPrice: Number(e.target.value) })
              }
              style={{
                cursor: "pointer",
                background: `linear-gradient(to right, var(--color-copper) ${pricePct}%, var(--color-border-strong) ${pricePct}%)`,
              }}
              className="mt-4 h-1.5 w-full appearance-none rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-copper/25 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-copper [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(50,30,24,0.25)] [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-copper [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(50,30,24,0.25)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
              aria-label="Maximum price"
            />
            <div className="mt-3 flex items-center justify-between font-sans text-[12px] text-warm-gray">
              <span>{formatPrice(priceMin, currency)}</span>
              <span>{formatPrice(priceMax, currency)}</span>
            </div>
          </FilterGroup>

          <FilterGroup title="Availability">
            <ul className="flex flex-wrap gap-2">
              {stateOptions.map((option) => {
                const selected = value.states.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleState(option.value)}
                      style={{ cursor: "pointer" }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-sans text-[13px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50",
                        selected
                          ? "border-copper bg-copper/10 font-medium text-espresso shadow-[0_0_0_3px_rgba(201,130,69,0.12)]"
                          : "border-border-strong text-espresso/80 hover:border-copper/60 hover:text-espresso",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn("h-1.5 w-1.5 rounded-full", option.dot)}
                      />
                      {option.label}
                    </button>
                  </li>
                );
              })}
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
      <h3 className="flex items-center gap-2.5 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-espresso">
        <span aria-hidden="true" className="h-px w-4 bg-copper/70" />
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
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 font-sans text-[14px] transition-colors hover:bg-copper/5",
        checked ? "text-espresso" : "text-espresso/80",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-copper/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white",
          checked
            ? "border-copper bg-copper text-espresso-deep"
            : "border-border-strong bg-transparent",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className={cn(checked && "font-medium")}>{label}</span>
    </label>
  );
}