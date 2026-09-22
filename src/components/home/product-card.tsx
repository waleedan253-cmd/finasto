import Image from "next/image";
import Link from "next/link";
import { Coffee, Leaf, Sprout } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/data/products";

const stateLabel: Record<Product["state"], string> = {
  new: "New",
  available: "Available",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

const tint = {
  green: {
    panel: "bg-[#E7ECDF]",
    footer: "bg-[#F1F4EC]",
  },
  blue: {
    panel: "bg-[#DEE7EF]",
    footer: "bg-[#EDF2F6]",
  },
} as const;

const featureIcons = [Leaf, Coffee, Sprout];

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.state === "out-of-stock";
  const colors = tint[product.accentTint];

  return (
    <article className="overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_1px_2px_rgba(50,30,24,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(50,30,24,0.08)]">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Image panel */}
        <Link
          href={`/shop/${product.slug}`}
          className={cn(
            "relative block aspect-[4/5] w-full overflow-hidden",
            colors.panel,
          )}
        >
          {product.state === "new" && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-green px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-white">
              {stateLabel.new}
            </span>
          )}
          <Image
            src={product.image}
            alt={`${product.name} — ${product.category} pouch`}
            fill
            sizes="(min-width: 640px) 45vw, 90vw"
            className="object-contain p-8"
          />
        </Link>

        {/* Content panel */}
        <div className="flex flex-col justify-center p-7 sm:p-8">
          <h3 className="font-sans text-[20px] font-semibold uppercase tracking-wide text-espresso">
            {product.name}
          </h3>
          <p className="mt-0.5 font-sans text-[13px] uppercase tracking-[0.14em] text-warm-gray">
            {product.category}
          </p>

          <p className="mt-3 font-sans text-[13px] uppercase tracking-wide text-copper">
            {product.tagline.join(" · ")}
          </p>

          <p className="mt-3 font-sans text-[14px] leading-relaxed text-warm-gray">
            {product.shortDescription}
          </p>

          <p className="mt-4 font-sans text-[17px] font-medium text-espresso">
            {formatPrice(product.price, product.currency)}
          </p>

          <button
            style={{
              cursor: "pointer",
            }}
            type="button"
            disabled={isOutOfStock}
            className="mt-4 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            {!isOutOfStock && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </div>

      {/* Feature strip */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4 sm:px-8",
          colors.footer,
        )}
      >
        {product.features.map((feature, i) => {
          const Icon = featureIcons[i % featureIcons.length];
          return (
            <span
              key={feature}
              className="flex items-center gap-2 font-sans text-[12px] text-warm-gray"
            >
              <Icon
                className="h-4 w-4 text-espresso/60"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              {feature}
            </span>
          );
        })}
      </div>
    </article>
  );
}
