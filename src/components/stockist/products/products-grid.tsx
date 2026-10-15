"use client";

import { useMemo, useState } from "react";
import { Input, Select } from "antd";
import { PackageSearch, Percent, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { StockistCatalog } from "@/lib/stockist/products-queries";

// The stockist's product list: search, a category filter, and one card per
// product with its packs. Each pack shows the retail price (struck through)
// and the stockist's own price. Data comes from the server page
// (getStockistCatalog); filtering happens here in the browser, so there is
// no server round trip while typing. Read-only for now: the "request" step
// arrives with the Bulk Orders page.

const ALL = "__all__";

export function ProductsGrid({ catalog }: { catalog: StockistCatalog }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.products.filter((p) => {
      if (category !== ALL && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    });
  }, [catalog.products, search, category]);

  return (
    <>
      {/* Discount reminder */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-cream-soft px-4 py-3">
        <span className="flex h-9 w-15 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
          {catalog.discountPercent}{" "}
          <Percent className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <p className="font-sans text-[14px] leading-relaxed text-espresso">
          Your discount is off the retail price. All prices are in USD.
        </p>{" "}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          size="large"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          prefix={
            <Search
              className="h-4 w-4 text-warm-gray"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          }
          className="sm:max-w-sm"
        />
        <Select<string>
          size="large"
          value={category}
          onChange={setCategory}
          aria-label="Filter by category"
          className="sm:w-56"
          options={[
            { value: ALL, label: "All categories" },
            ...catalog.categories.map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>

      <p className="mt-4 font-sans text-[14px] text-warm-gray">
        {visible.length} {visible.length === 1 ? "product" : "products"}
      </p>

      {/* List */}
      {visible.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-border px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <PackageSearch
              className="h-5 w-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            {catalog.products.length === 0
              ? "No products available yet"
              : "No products match"}
          </h2>
          <p className="mt-2 max-w-sm font-sans text-[14px] leading-relaxed text-warm-gray">
            {catalog.products.length === 0
              ? "Products will appear here as soon as Finasto adds them."
              : "Try a different search or choose another category."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {visible.map((product) => (
            <li
              key={product.id}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3 px-4 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-[20px] leading-tight text-espresso">
                    {product.name}
                  </h2>
                  <p className="font-sans text-[12px] text-warm-gray">
                    {product.category}
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-border border-t border-border">
                {product.packs.map((pack) => (
                  <li
                    key={pack.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-[14px] font-medium text-espresso">
                        {pack.name}
                      </p>
                      <p className="font-sans text-[12px]">
                        {pack.inStock ? (
                          <span className="text-green">Available</span>
                        ) : (
                          <span className="text-copper">Out of stock</span>
                        )}
                        {pack.weight != null && (
                          <span className="text-warm-gray">
                            {" · "}
                            {pack.weight}g
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-[16px] font-medium text-espresso">
                        {formatPrice(pack.yourPriceUsd, "USD")}
                      </p>
                      {pack.yourPriceUsd !== pack.retailUsd && (
                        <p className="font-sans text-[12px] text-warm-gray line-through">
                          {formatPrice(pack.retailUsd, "USD")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
