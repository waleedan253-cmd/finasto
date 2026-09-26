"use client";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Coffee, Sprout } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getPrice, type Product } from "@/data/products";
import { useMarket } from "@/components/providers/market-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useRouter } from "next/navigation";

const stateLabel: Record<Product["state"], string> = {
  new: "New",
  available: "Available",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
  offer: "Offer",
};

// Card + pill tint per accent — swap "panel" for the soft card background,

const tint = {
  green: {
    card: "bg-[#EFF3E8]",
    pill: "bg-[#DCE6CB] text-espresso",
  },
  blue: {
    card: "bg-[#E7EEF5]",
    pill: "bg-[#CFE0F0] text-espresso",
  },
} as const;

const featureIcons = [Leaf, Coffee, Sprout];

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const isOutOfStock = product.state === "out-of-stock";
  const colors = tint[product.accentTint];
  const { market } = useMarket();
  const { addItem } = useCart();

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border p-6 shadow-[0_1px_2px_rgba(50,30,24,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(50,30,24,0.08)]",
        "flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8",
        colors.card,
      )}
    >
      {product.state === "new" && (
        <span className="absolute left-6 top-6 z-10 rounded-full bg-white/90 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-espresso shadow-sm">
          {stateLabel.new}
        </span>
      )}

      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative mx-auto block aspect-square w-full max-w-[240px] shrink-0 sm:mx-0 sm:w-[38%] sm:max-w-none"
      >
        <Image
          src={product.image}
          alt={`${product.name} — ${product.category} pouch`}
          fill
          sizes="(min-width: 640px) 30vw, 60vw"
          className="object-contain"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col text-center sm:text-left">
        <h3 className="font-serif text-[26px] leading-tight text-espresso">
          {product.name}
        </h3>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          {product.category}
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          {product.tagline.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-3 py-1 font-sans text-[12px] font-medium",
                colors.pill,
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-4 font-sans text-[14px] leading-relaxed text-warm-gray">
          {product.shortDescription}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
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

        {(product.origin || product.weight) && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-1 font-sans text-[13px] text-warm-gray sm:justify-start">
            {product.origin && (
              <span>
                <span className="text-espresso/70">Origin</span> ·{" "}
                {product.origin}
              </span>
            )}
            {product.weight && (
              <span>
                <span className="text-espresso/70">Weight</span> ·{" "}
                {product.weight}
              </span>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:justify-between">
          <button
            style={{ cursor: "pointer" }}
            type="button"
            onClick={() => router.push("/shop")}
            disabled={isOutOfStock}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
          >
            {isOutOfStock ? "Out of Stock" : "Shop Now"}
            {!isOutOfStock && <span aria-hidden="true">→</span>}
          </button>

          <p className="font-sans text-[17px] font-medium text-espresso">
            {formatPrice(
              getPrice(product, market.currencyCode),
              market.currencyCode,
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
