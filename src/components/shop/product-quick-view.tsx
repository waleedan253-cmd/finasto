"use client";

import Image from "next/image";
import Link from "next/link";
import { Modal } from "antd";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getComparePrice, getPrice, type Product } from "@/data/products";
import { useMarket } from "@/components/providers/market-provider";
import { useCart } from "@/components/providers/cart-provider";

export function ProductQuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { market } = useMarket();
  const { addItem } = useCart();

  const isOutOfStock = product.state === "out-of-stock";
  const price = getPrice(product, market.currencyCode);
  const compare = getComparePrice(product, market.currencyCode);
  const onOffer = compare !== undefined && compare > price;
  const percentOff = onOffer ? Math.round((1 - price / compare) * 100) : 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      destroyOnClose
      aria-label={`${product.name} quick view`}
    >
      <div className="grid gap-6 pt-4 md:grid-cols-2">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border"
          style={{ backgroundColor: `${product.accentColor}1A` }}
        >
          <Image
            src={product.image}
            alt={`${product.name} — ${product.category}`}
            fill
            sizes="(min-width: 768px) 400px, 100vw"
            className="object-contain p-6"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-warm-gray">
            {product.category}
          </p>
          <h3 className="mt-1 font-display text-[30px] leading-tight text-espresso">
            {product.name}
          </h3>

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

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
            <span className="font-sans text-[24px] font-semibold text-espresso">
              {formatPrice(price, market.currencyCode)}
            </span>
            {onOffer && (
              <>
                <span className="font-sans text-[15px] text-warm-gray line-through">
                  {formatPrice(compare, market.currencyCode)}
                </span>
                <span className="font-sans text-[13px] font-medium text-copper">
                  -{percentOff}%
                </span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 font-sans text-[14px] leading-relaxed text-warm-gray">
              {product.shortDescription}
            </p>
          )}

          {product.tastingNote && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-espresso">
                Tasting notes
              </p>
              <p className="mt-1.5 font-sans text-[13px] italic leading-relaxed text-warm-gray">
                {product.tastingNote}
              </p>
            </div>
          )}

          {product.features.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
              {product.features.slice(0, 4).map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 font-sans text-[13px] text-warm-gray"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-copper"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                addItem(product.id);
                onClose();
              }}
              disabled={isOutOfStock}
              className="h-11 cursor-pointer rounded-full bg-gradient-to-b from-espresso to-espresso-deep px-7 font-sans text-[14px] font-medium text-cream shadow-sm transition-all hover:shadow-md dark:bg-none dark:bg-copper dark:text-espresso-deep dark:shadow-none dark:hover:bg-copper-light disabled:cursor-not-allowed disabled:bg-none disabled:bg-disabled disabled:shadow-none dark:disabled:bg-disabled dark:disabled:text-espresso"
            >
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </button>
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[13px] font-medium text-copper underline-offset-4 hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}