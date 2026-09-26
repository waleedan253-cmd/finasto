"use client";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { getPrice, type Product } from "@/data/products";
import { useMarket } from "@/components/providers/market-provider";
import { useCart } from "@/components/providers/cart-provider";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
const stateLabel: Record<Product["state"], string> = {
  new: "New",
  available: "Available",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
  offer: "Offer",
};

const stateClass: Record<Product["state"], string> = {
  new: "bg-copper text-white",
  available: "bg-green text-white",
  "low-stock": "bg-copper-light text-espresso",
  "out-of-stock": "bg-disabled text-white",
  offer: "bg-copper-light text-espresso",
};

const tint = {
  green: "bg-gradient-to-b from-[#E7ECDF] to-white",
  blue: "bg-gradient-to-b from-[#DEE7EF] to-white",
} as const;

/**
 * Vertical image-top card used by the shop grid. Unlike the homepage's
 * horizontal `ProductCard` (built for exactly two editorial items), this
 * scales cleanly across 2/3/4-column grids as the catalog grows.
 */
export function ProductCardGrid({ product }: { product: Product }) {
  const isOutOfStock = product.state === "out-of-stock";
  const [wishlisted, setWishlisted] = useState(false);
  const { market } = useMarket();
  const { addItem } = useCart();

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[16px] border border-border bg-white transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(50,30,24,0.08)]">
      <Link
        href={`/shop/${product.slug}`}
        className={cn(
          "relative block aspect-square w-full overflow-hidden",
          tint[product.accentTint],
        )}
      >
        <span
          className={cn(
            "absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-wide",
            stateClass[product.state],
          )}
        >
          {stateLabel[product.state]}
        </span>
        <Image
          src={product.image}
          alt={`${product.name} — ${product.category} pouch`}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </Link>
      <button
        type="button"
        onClick={() => setWishlisted((prev) => !prev)}
        aria-pressed={wishlisted}
        aria-label={
          wishlisted
            ? `Remove ${product.name} from wishlist`
            : `Add ${product.name} to wishlist`
        }
        className={cn(
          "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:bg-white focus-visible:translate-y-0 focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100",
          wishlisted
            ? "text-copper md:translate-y-0 md:opacity-100"
            : "text-espresso hover:text-copper md:translate-y-1 md:opacity-0",
        )}
      >
        <Heart
          style={{
            cursor: "pointer",
          }}
          className={cn("h-4 w-4", wishlisted && "fill-copper")}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </button>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-warm-gray">
          {product.category}
        </p>
        <h3 className="mt-1 font-sans text-[15px] font-semibold text-espresso">
          {product.name}
        </h3>
        {product.rating !== undefined && (
          <div
            className="mt-1.5 flex items-center gap-1.5"
            role="img"
            aria-label={`Rated ${product.rating} out of 5${
              product.reviewCount ? ` from ${product.reviewCount} reviews` : ""
            }`}
          >
            <Star
              className="h-3.5 w-3.5 fill-copper text-copper"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="font-sans text-[12px] font-medium text-espresso">
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount ? (
              <span className="font-sans text-[12px] text-warm-gray">
                ({product.reviewCount})
              </span>
            ) : null}
          </div>
        )}
        {(product.origin || product.weight) && (
          <p className="mt-1 font-sans text-[12px] text-warm-gray">
            {[product.origin, product.weight].filter(Boolean).join(" · ")}
          </p>
        )}

        {product.tastingNote && (
          <p className="mt-2 line-clamp-2 font-sans text-[12px] italic leading-relaxed text-warm-gray">
            {product.tastingNote}
          </p>
        )}
        <p className="mt-1.5 font-sans text-[13px] font-medium text-espresso">
          {formatPrice(
            getPrice(product, market.currencyCode),
            market.currencyCode,
          )}
        </p>

        <button
          style={{
            cursor: "pointer",
          }}
          type="button"
          onClick={() => addItem(product.id)}
          disabled={isOutOfStock}
          className="mt-3 h-10 w-full rounded-full bg-gradient-to-b from-espresso to-espresso-deep font-sans text-[13px] font-medium text-cream shadow-sm transition-all hover:from-espresso-deep hover:to-espresso-deep hover:shadow-md disabled:cursor-not-allowed disabled:bg-none disabled:bg-disabled disabled:shadow-none"
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
