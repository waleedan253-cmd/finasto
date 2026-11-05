"use client";

import Image from "next/image";
import type { Product } from "@/data/products";
import { getPrice, getComparePrice } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useMarket } from "@/components/providers/market-provider";

function daysLeft(iso?: string): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso) - Date.now();
  return ms > 0 ? Math.ceil(ms / 86400000) : null;
}

function OfferCard({ p }: { p: Product }) {
  const { market } = useMarket();
  const currencyCode = market.currencyCode;
  const price = getPrice(p, currencyCode);
  const compare = getComparePrice(p, currencyCode);
  const off =
    compare && compare > price ? Math.round((1 - price / compare) * 100) : null;
  const days = daysLeft(p.offerEndsAt);

  return (
    <article className="relative mr-4 flex w-[300px] shrink-0 items-center gap-4 overflow-hidden rounded-[2rem] border border-copper/40 bg-gradient-to-br from-green via-[#143018] to-[#1e728ce7]  p-5 text-white shadow-[0_24px_50px_-28px_rgba(35,77,42,0.9)] sm:w-[380px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-copper/30 blur-3xl"
      />

      {off && (
        <span className="absolute left-4 top-4 rounded-full bg-copper px-2.5 py-0.5 font-sans text-[11px] font-semibold text-white">
          -{off}%
        </span>
      )}

      <div className="relative min-w-0 flex-1 pt-6">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/60">
          {p.category}
        </p>
        <h3 className="mt-1 truncate font-display text-2xl">{p.name}</h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-sans text-lg font-semibold text-copper-light">
            {formatPrice(price, currencyCode)}
          </span>
          {compare && (
            <span className="font-sans text-sm text-white/50 line-through">
              {formatPrice(compare, currencyCode)}
            </span>
          )}
        </div>

        {days && (
          <p suppressHydrationWarning className="mt-1 font-sans text-[12px] text-copper-light">
            Ends in {days} {days === 1 ? "day" : "days"}
          </p>
        )}
      </div>

      <div className="relative h-28 w-20 shrink-0 sm:h-32 sm:w-24">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="96px"
          className="object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.5)]"
        />
      </div>
    </article>
  );
}

export function OffersCarousel({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const heading = (
    <div className="mb-8 text-center">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.22em] text-copper">
        Special offers
      </p>
      <h2 className="mt-3 font-display text-2xl md:text-4xl">
        Limited-time offers
      </h2>
    </div>
  );

  // Repeat the cards so the strip always fills the screen width
  const loop = Array.from(
    { length: Math.ceil(8 / products.length) },
    () => products,
  ).flat();

  return (
    <section aria-label="Special offers" className="py-12">
      <style>{`
        @keyframes offers-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .offers-track {
          display: flex;
          width: max-content;
          animation: offers-scroll 60s linear infinite;
        }
        .offers-marquee:hover .offers-track {
          animation-play-state: paused;
        }
      `}</style>
      {heading}
      <div className="offers-marquee overflow-hidden">
        <div className="offers-track">
          {loop.map((p, i) => (
            <OfferCard key={`a-${i}`} p={p} />
          ))}
          {/* duplicate set for a seamless loop; hidden from screen readers */}
          <div aria-hidden="true" className="flex">
            {loop.map((p, i) => (
                           <OfferCard key={`b-${i}`} p={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}