"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  products,
  productCategories,
  getPrice,
  getPriceRange,
} from "@/data/products";
import { useMarket } from "@/components/providers/market-provider";
import {
  ShopFilters,
  type ShopFiltersState,
} from "@/components/shop/shop-filters";
import { ShopToolbar, type SortOption } from "@/components/shop/shop-toolbar";
import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 12;

const initialFilters: ShopFiltersState = {
  categories: [],
  maxPrice: null,
  states: [],
};

export function ShopPageClient() {
  const [filters, setFilters] = useState<ShopFiltersState>(initialFilters);
  const [sort, setSort] = useState<SortOption>("featured");
  const [page, setPage] = useState(1);

  const { market } = useMarket();
  const currency = market.currencyCode;
  const priceRange = useMemo(() => getPriceRange(currency), [currency]);

  // A price limit set in one currency makes no sense in another.
  useEffect(() => {
    setFilters((prev) => ({ ...prev, maxPrice: null }));
  }, [currency]);

  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);

  // Header search on /shop changes the URL without remounting this
  // component, so keep the search box in sync with ?q=.
  useEffect(() => {
    setSearch(urlQuery);
    setPage(1);
  }, [urlQuery]);

  const filtered = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(product.category);
      const matchesPrice =
        getPrice(product, currency) <= (filters.maxPrice ?? Infinity);
      const matchesState =
        filters.states.length === 0 || filters.states.includes(product.state);
      const matchesSearch =
        search.trim() === "" ||
        product.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        product.category.toLowerCase().includes(search.trim().toLowerCase());

      return matchesCategory && matchesPrice && matchesState && matchesSearch;
    });

    result = [...result].sort((a, b) => {
      if (sort === "price-asc")
        return getPrice(a, currency) - getPrice(b, currency);
      if (sort === "price-desc")
        return getPrice(b, currency) - getPrice(a, currency);
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return 0; // "featured" — keep catalog order
    });

    return result;
  }, [filters, search, sort, currency]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateFilters(next: ShopFiltersState) {
    setFilters(next);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:py-12">
      <div className="flex flex-col gap-10 lg:flex-row">
        <ShopFilters
          allCategories={productCategories}
          priceMin={priceRange.min}
          priceMax={priceRange.max}
          currency={currency}
          value={filters}
          onChange={updateFilters}
        />

        <div className="flex-1">
          <ShopToolbar
            search={search}
            onSearchChange={updateSearch}
            sort={sort}
            onSortChange={setSort}
            resultCount={filtered.length}
          />

          <div className="mt-8">
            <ProductGrid products={paged} />
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
