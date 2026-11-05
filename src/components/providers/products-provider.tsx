"use client";

import { createContext, useContext } from "react";
import type { Product } from "@/data/products";

const ProductsContext = createContext<Product[]>([]);

export function ProductsProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  return (
    <ProductsContext.Provider value={products}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}