import Link from "next/link";
import { collectionMode, products } from "@/data/products";
import { ProductCard } from "@/components/home/product-card";

const headingByMode = {
  featured: {
    label: "Featured Collection",
    heading: "Wellness in Every Blend",
    subheading:
      "Two unique herbal tea blends, crafted to support your well-being, naturally sourced from Bali's finest botanicals.",
  },
  bestsellers: {
    label: "Best Sellers",
    heading: "Loved by Our Community",
    subheading:
      "Two unique herbal tea blends, crafted to support your well-being, naturally sourced from Bali's finest botanicals.",
  },
} as const;

/**
 * Reads `collectionMode` from data/products.ts. When admin/content flips
 * it to "bestsellers" once real sales data exists, only label/heading
 * change — the grid and cards are unaffected.
 */
export function FeaturedCollection() {
  const copy = headingByMode[collectionMode];

  return (
    <section className="relative overflow-hidden bg-cream-soft py-20 lg:py-28">
      {/* Soft botanical-green touch — decorative, not a full-section block */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full bg-green/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-[300px] w-[300px] rounded-full bg-copper/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1300px] px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
              {copy.label}
              <span aria-hidden="true" className="h-px w-10 bg-copper-light" />
            </p>
            <h2 className="mt-3 font-display text-[38px] leading-tight text-espresso sm:text-[46px]">
              {copy.heading}
            </h2>
            <p className="mt-3 font-sans text-[15px] leading-relaxed text-warm-gray">
              {copy.subheading}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center gap-2 font-sans text-[14px] font-medium text-espresso underline-offset-4 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
