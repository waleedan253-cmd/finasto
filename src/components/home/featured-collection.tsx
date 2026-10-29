import Link from "next/link";
import { collectionMode } from "@/data/products";
import { getStorefrontProducts } from "@/lib/storefront-queries";
import { ProductCard } from "@/components/home/product-card";

const headingByMode = {
  featured: {
    label: "Featured Collection",
    heading: "Wellness in Every Blend",
    subheading:
      "Discover thoughtfully curated teas, coffees, and more, inspired by nature’s beauty and Bali’s rich heritage, crafted to elevate everyday moments.",
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
export async function FeaturedCollection() {
  const copy = headingByMode[collectionMode];
  const allProducts = await getStorefrontProducts();
  // const products =
  //   collectionMode === "featured"
  //     ? allProducts.filter((p) => p.featured)
  //     : allProducts;
  // Featured = products with an active offer; if none, show everything.
  const offers = allProducts.filter((p) => p.compareAtPrice !== undefined);
  const products =
    collectionMode === "featured" && offers.length > 0 ? offers : allProducts;

  return (
    <section className="bg-pattern relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_0%,#1d3a22_0%,#0f1d12_45%,#0b0806_90%)] py-20 lg:py-28">
      {/* Soft botanical-green touch — decorative, not a full-section block */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full bg-[#e8c06a]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-[300px] w-[300px] rounded-full bg-[#e8c06a]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1300px] px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-[#e8c06a]">
              {copy.label}
              <span aria-hidden="true" className="h-px w-10 bg-[#e8c06a]/60" />
            </p>
            <h2 className="mt-3 bg-gradient-to-b from-white via-[#fbe7a6] to-[#e8c06a] bg-clip-text font-display text-[38px] leading-tight text-transparent sm:text-[46px]">
              {copy.heading}
            </h2>
            <p className="mt-3 font-sans text-[15px] leading-relaxed text-white/65">
              {copy.subheading}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e8c06a]/40 px-5 py-2 font-sans text-[14px] font-medium text-[#fbe7a6] transition-colors hover:border-[#e8c06a] hover:bg-[#e8c06a]/10 hover:text-white"
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
