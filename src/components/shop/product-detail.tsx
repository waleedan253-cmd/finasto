"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getComparePrice, getPrice, type Product } from "@/data/products";
import { useMarket } from "@/components/providers/market-provider";
import { useCart } from "@/components/providers/cart-provider";
import { formatStoreDate } from "@/lib/store-time";

// Product detail view. Client component because the price depends on the
// visitor's market (currency) and the cart lives in a client provider.
// The server page finds the product and passes it in.

export function ProductDetail({ product }: { product: Product }) {
  const { market } = useMarket();
  const { addItem } = useCart();

  const isOutOfStock = product.state === "out-of-stock";
  const price = getPrice(product, market.currencyCode);
  const compare = getComparePrice(product, market.currencyCode);
  const onOffer = compare !== undefined && compare > price;
  const percentOff = onOffer ? Math.round((1 - price / compare) * 100) : 0;

  const facts = [
    product.origin && { label: "Origin", value: product.origin },
    product.weight && { label: "Weight", value: product.weight },
    product.category && { label: "Category", value: product.category },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:py-12">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 font-sans text-[13px] text-warm-gray transition-colors hover:text-espresso"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to shop
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-14">
        {/* Image */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-[16px] border border-border"
          style={{ backgroundColor: `${product.accentColor}1A` }}
        >
          <Image
            src={product.image}
            alt={`${product.name} — ${product.category}`}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain p-8"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="font-sans text-[12px] text-warm-gray">
            {product.category}
          </p>
          <h1 className="mt-1 font-display text-[34px] leading-tight text-espresso md:text-[44px]">
            {product.name}
          </h1>

          {product.rating !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <Star
                className="h-4 w-4 fill-copper text-copper"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="font-sans text-[13px] font-medium text-espresso">
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount ? (
                <span className="font-sans text-[13px] text-warm-gray">
                  ({product.reviewCount} reviews)
                </span>
              ) : null}
            </div>
          )}

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3">
            <span className="font-sans text-[26px] font-semibold text-espresso">
              {formatPrice(price, market.currencyCode)}
            </span>
            {onOffer && (
              <>
                <span className="font-sans text-[16px] text-warm-gray line-through">
                  {formatPrice(compare, market.currencyCode)}
                </span>
                <span className="font-sans text-[14px] font-medium text-copper">
                  -{percentOff}%
                </span>
              </>
            )}
          </div>
          {onOffer && product.offerEndsAt && (
            <p
              suppressHydrationWarning
              className="mt-1 font-sans text-[13px] text-warm-gray"
            >
              Offer ends {formatStoreDate(product.offerEndsAt)}
            </p>
          )}

          {product.shortDescription && (
            <p className="mt-5 max-w-prose font-sans text-[15px] leading-relaxed text-warm-gray">
              {product.shortDescription}
            </p>
          )}

          {product.tagline.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {product.tagline.map((word) => (
                <li
                  key={word}
                  className="rounded-full border border-border bg-white px-3 py-1 font-sans text-[13px] text-espresso"
                >
                  {word}
                </li>
              ))}
            </ul>
          )}

          {/* Add to cart */}
          <button
            type="button"
            onClick={() => addItem(product.id)}
            disabled={isOutOfStock}
            className="mt-7 h-12 w-full cursor-pointer rounded-full bg-gradient-to-b from-espresso to-espresso-deep font-sans text-[15px] font-medium text-cream shadow-sm transition-all hover:from-espresso-deep hover:to-espresso-deep hover:shadow-md disabled:cursor-not-allowed disabled:bg-none disabled:bg-disabled disabled:shadow-none sm:max-w-xs"
          >
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </button>
          {product.state === "low-stock" && (
            <p className="mt-2 font-sans text-[13px] text-copper">
              Only a few left.
            </p>
          )}

          {/* Tasting note */}
          {product.tastingNote && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-sans text-[14px] font-semibold text-espresso">
                Tasting notes
              </h2>
              <p className="mt-2 font-sans text-[14px] italic leading-relaxed text-warm-gray">
                {product.tastingNote}
              </p>
            </div>
          )}

          {/* Features */}
          {product.features.length > 0 && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="font-sans text-[14px] font-semibold text-espresso">
                What&apos;s inside
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="font-sans text-[14px] text-warm-gray"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Facts */}
          {facts.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-sans text-[12px] text-warm-gray">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 font-sans text-[14px] text-espresso">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
