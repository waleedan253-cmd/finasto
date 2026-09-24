import { Leaf } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductCardGrid } from "@/components/shop/product-card-grid";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border py-20 text-center">
        <Leaf
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-warm-gray">
          No products match your filters. Try adjusting or clearing them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:gap-6">
      {products.map((product) => (
        <ProductCardGrid key={product.id} product={product} />
      ))}
    </div>
  );
}
