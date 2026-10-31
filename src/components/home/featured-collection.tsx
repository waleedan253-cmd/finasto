import Link from "next/link";
import { ArrowRight, Leaf, Sprout, Sparkles } from "lucide-react";
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

// Edit these three to match your real brand claims
const highlights = [
  { icon: Leaf, text: "Naturally sourced" },
  { icon: Sprout, text: "Bali heritage" },
  { icon: Sparkles, text: "Small-batch blends" },
];

const sectionBg = [
  "radial-gradient(ellipse 55% 45% at 12% 0%, rgba(134,239,172,0.32) 0%, transparent 70%)",
  "radial-gradient(ellipse 50% 40% at 92% 100%, rgba(125,211,252,0.28) 0%, transparent 70%)",
  "radial-gradient(ellipse 40% 30% at 50% 50%, rgba(255,255,255,0.35) 0%, transparent 70%)",
  "var(--color-cream)",
].join(", ");

export async function FeaturedCollection() {
  const copy = headingByMode[collectionMode];
  const allProducts = await getStorefrontProducts();
  const offers = allProducts.filter((p) => p.compareAtPrice !== undefined);
  const products =
    collectionMode === "featured" && offers.length > 0 ? offers : allProducts;

  return (
    <section
      aria-labelledby="featured-collection-heading"
      className="bg-pattern relative overflow-hidden py-24 lg:py-18"
      style={{ background: sectionBg }}
    >
      {/* Top + bottom copper hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent"
      />

      {/* Ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[460px] w-[460px] rounded-full bg-green-100/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-sky-100/15 blur-3xl"
      />

      {/* Large decorative rings behind the header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/3 rounded-full border border-copper/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[880px] w-[880px] -translate-x-1/2 -translate-y-1/3 rounded-full border border-copper/[0.06]"
      />

      <div className="relative mx-auto max-w-[1300px] px-5 sm:px-8">
        {/* Header (centered, editorial) */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-3 rounded-full border border-copper/30 bg-white/50 px-5 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-copper shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] backdrop-blur">
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-copper"
            />
            {copy.label}
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-copper"
            />
          </p>

          <h2
            id="featured-collection-heading"
            className="mt-8 font-display text-[44px] font-medium leading-[1.04] tracking-[-0.015em] text-green-deep sm:text-[60px] lg:text-[76px]"
          >
            {copy.heading}
          </h2>

          {/* Ornament */}
          <div
            aria-hidden="true"
            className="mt-8 flex w-full max-w-xs items-center gap-4"
          >
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-copper/60" />
            <Leaf className="h-4 w-4 text-copper" strokeWidth={1.5} />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-copper/60" />
          </div>

          <p className="mt-8 max-w-2xl font-sans text-[16px] leading-[1.85] text-warm-gray sm:text-[17px]">
            {copy.subheading}
          </p>

          {/* Highlights row */}
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-warm-gray"
              >
                <Icon
                  className="h-4 w-4 text-copper"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Grid: each card sits in a thin framed "gallery" mount */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="group/frame overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(35,77,42,0.35)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_40px_80px_-30px_rgba(35,77,42,0.45)] [&>article]:h-full"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-5">
          <div
            aria-hidden="true"
            className="h-12 w-px bg-gradient-to-b from-copper/60 to-transparent"
          />
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 rounded-full bg-green-deep px-8 py-4 font-sans text-[14px] font-medium tracking-wide text-cream shadow-[0_12px_30px_-10px_rgba(35,77,42,0.6)] transition-all duration-300 hover:gap-4 hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/70 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Explore the Full Collection
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}