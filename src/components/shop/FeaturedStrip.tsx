import Image from "next/image";
import type { Product } from "@/data/products";
import { getPrice } from "@/data/products";

type Props = {
  products: Product[];
  // Pass the shopper's active currency if you have it (e.g. from your
  // currency context/cookie). Falls back to USD.
  currencyCode?: string;
};

function formatMoney(amount: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount}`;
  }
}

export function FeaturedStrip({ products, currencyCode = "USD" }: Props) {
  // Nothing flagged featured -> render nothing, no empty gap.
  if (products.length === 0) return null;

  return (
    <section
      aria-label="Featured products"
      className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-16"
    >
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.22em] text-copper">
          Featured
        </p>
        <h2 className="mt-3 font-display text-2xl md:text-4xl">
          Start with our favourites
        </h2>
      </div>

      {/* Mobile: swipe row. Desktop: auto-fit grid. */}
      <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
{products.slice(0, 2).map((p) => {
          const accent = p.accentColor || "#1b4a31";
          const price = getPrice(p, currencyCode);

          return (
            <li
              key={p.id}
              className="w-[82%] shrink-0 snap-center sm:w-[calc(50%-0.5rem)] lg:w-[420px]"
            >
              <a
                // href={`#product-${p.id}`}
                className="group relative flex h-full items-center gap-4 overflow-hidden rounded-[2rem] p-5 text-white transition hover:-translate-y-1 md:p-6"
                style={{
                  background: `linear-gradient(135deg, ${accent} 0%, #0b1f1a 130%)`,
                }}
              >
                {/* Ambient glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
                  style={{ background: accent, opacity: 0.45 }}
                />

                {/* Text */}
                <div className="relative min-w-0 flex-1">
                  {p.state === "new" || p.state === "offer" ? (
                    <span className="inline-block rounded-full border border-white/30 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-widest">
                      {p.state === "offer" ? "Offer" : "New"}
                    </span>
                  ) : null}

                  <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.22em] text-white/60">
                    {p.category}
                  </p>
                  <h3 className="mt-1 truncate font-display text-2xl md:text-3xl">
                    {p.name}
                  </h3>

                  {p.tagline.length > 0 && (
                    <p className="mt-1 font-sans text-xs text-white/75">
                      {p.tagline.join(" · ")}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="font-sans text-sm text-white/90">
                      {p.state === "out-of-stock"
                        ? "Out of stock"
                        : `From ${formatMoney(price, currencyCode)}`}
                    </span>
                    {/* <span
                      aria-hidden
                      className="font-sans text-sm transition group-hover:translate-x-1"
                    >
                      ↓
                    </span> */}
                  </div>
                </div>

                {/* Pack image */}
                <div className="relative h-32 w-24 shrink-0 md:h-40 md:w-28">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(min-width: 768px) 120px, 96px"
                    className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] transition duration-700 group-hover:scale-105 group-hover:-rotate-2"
                  />
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}