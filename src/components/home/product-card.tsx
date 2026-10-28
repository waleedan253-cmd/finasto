"use client";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Coffee, Sprout } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getComparePrice, getPrice, type Product } from "@/data/products";
import { useMarket } from "@/components/providers/market-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useRouter } from "next/navigation";
import { formatStoreDate } from "@/lib/store-time";

const stateLabel: Record<Product["state"], string> = {
  new: "New",
  available: "Available",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
  offer: "Offer",
};

const featureIcons = [Leaf, Coffee, Sprout];

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const isOutOfStock = product.state === "out-of-stock";
  const cardBg = `linear-gradient(135deg, color-mix(in srgb, ${product.accentColor} 45%, black), color-mix(in srgb, ${product.accentColor} 75%, black) 50%, ${product.accentColor})`;
  const glowColor = `${product.accentColor}55`;
  const { market } = useMarket();
  const { addItem } = useCart();

  const price = getPrice(product, market.currencyCode);
  const compare = getComparePrice(product, market.currencyCode);
  const onOffer = compare !== undefined && compare > price;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[2rem] p-8 text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]",
        "flex flex-col gap-8 sm:min-h-[420px] sm:flex-row sm:items-center sm:gap-10 sm:p-12",
      )}
      style={{ backgroundImage: cardBg }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: glowColor }}
      />
      {(product.state === "new" || product.state === "offer") && (
        <span className="absolute left-6 top-6 z-10 rounded-full bg-white/90 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-espresso shadow-sm">
          {stateLabel[product.state]}
        </span>
      )}

      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative mx-auto block aspect-square w-full max-w-[300px] shrink-0 sm:mx-0 sm:w-[45%] sm:max-w-none"
      >
        <Image
          src={product.image}
          alt={`${product.name} — ${product.category} pouch`}
          fill
          sizes="(min-width: 640px) 30vw, 60vw"
          className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)] transition duration-700 group-hover:-rotate-2 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="relative flex flex-1 flex-col text-center sm:text-left">
        <h3 className="font-serif text-[32px] leading-tight text-white sm:text-[38px]">
          {product.name}
        </h3>
        <p className="mt-1 font-sans text-[13px] uppercase tracking-[0.2em] text-white/70">
          {product.category}
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          {product.tagline.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-3 py-1 font-sans text-[12px] font-medium text-white backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-4 font-sans text-[15px] leading-relaxed text-white/85">
          {product.shortDescription}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
          {product.features.map((feature, i) => {
            const Icon = featureIcons[i % featureIcons.length];
            return (
              <span
                key={feature}
                className="flex items-center gap-2 font-sans text-[12px] text-white/75"
              >
                <Icon
                  className="h-4 w-4 text-white/60"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {feature}
              </span>
            );
          })}
        </div>

        {(product.origin || product.weight) && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-1 font-sans text-[13px] text-white/75 sm:justify-start">
            {product.origin && (
              <span>
                <span className="text-white/60">Origin</span> ·{" "}
                {product.origin}
              </span>
            )}
            {product.weight && (
              <span>
                <span className="text-white/60">Weight</span> ·{" "}
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
            className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-white px-6 font-sans text-[14px] font-medium text-espresso transition hover:gap-3 hover:bg-copper-light disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70"
          >
            {isOutOfStock ? "Out of Stock" : "Shop Now"}
            {!isOutOfStock && <span aria-hidden="true">→</span>}
          </button>

          <div className="text-right">
            <p className="font-sans text-[20px] font-medium text-white">
              {onOffer && (
                <span className="mr-2 text-[13px] text-white/60 line-through">
                  {formatPrice(compare, market.currencyCode)}
                </span>
              )}
              {formatPrice(price, market.currencyCode)}
            </p>
            {onOffer && product.offerEndsAt && (
              <p
                suppressHydrationWarning
                className="font-sans text-[11px] text-white/60"
              >
                Offer ends {formatStoreDate(product.offerEndsAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
