// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { ArrowLeft, Star } from "lucide-react";
// import { formatPrice } from "@/lib/utils";
// import { getComparePrice, getPriceInfo, type Product } from "@/data/products";
// import { useMarket } from "@/components/providers/market-provider";
// import { useCart } from "@/components/providers/cart-provider";
// import { formatStoreDate } from "@/lib/store-time";

// // Product detail view. Client component because the price depends on the
// // visitor's market (currency) and the cart lives in a client provider.
// // The server page finds the product and passes it in.

// export function ProductDetail({ product }: { product: Product }) {
//   const { market } = useMarket();
//   const { addItem } = useCart();

//   const isOutOfStock = product.state === "out-of-stock";
//   const { amount: price, currency } = getPriceInfo(product, market.currencyCode);
//   const compare = getComparePrice(product, market.currencyCode);
//   const onOffer = compare !== undefined && compare > price;
//   const percentOff = onOffer ? Math.round((1 - price / compare) * 100) : 0;

//   const facts = [
//     product.origin && { label: "Origin", value: product.origin },
//     // product.weight && { label: "Weight", value: product.weight },
//     product.category && { label: "Category", value: product.category },
//   ].filter(Boolean) as { label: string; value: string }[];

//   return (
//     <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:py-12">
//       <Link
//         href="/shop"
//         className="inline-flex items-center gap-2 font-sans text-[13px] text-warm-gray transition-colors hover:text-espresso"
//       >
//         <ArrowLeft className="h-4 w-4" aria-hidden="true" />
//         Back to shop
//       </Link>

//       <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-14">
//         {/* Image */}
//         <div
//           className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border-strong shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] dark:border-border dark:shadow-none"
//           style={{ backgroundColor: `${product.accentColor}1A` }}
//         >
//           <Image
//             src={product.image}
//             alt={`${product.name} — ${product.category}`}
//             fill
//             priority
//             sizes="(min-width: 768px) 50vw, 100vw"
//             className="object-contain p-8"
//           />
//         </div>

//         {/* Details */}
//         <div className="flex flex-col">
//           <p className="font-sans text-[12px] text-warm-gray">
//             {product.category}
//           </p>
//           <h1 className="mt-1 font-display text-[34px] leading-tight text-espresso md:text-[44px]">
//             {product.name}
//           </h1>

//           {product.rating !== undefined && (
//             <div className="mt-2 flex items-center gap-1.5">
//               <Star
//                 className="h-4 w-4 fill-copper text-copper"
//                 strokeWidth={1.5}
//                 aria-hidden="true"
//               />
//               <span className="font-sans text-[13px] font-medium text-espresso">
//                 {product.rating.toFixed(1)}
//               </span>
//               {product.reviewCount ? (
//                 <span className="font-sans text-[13px] text-warm-gray">
//                   ({product.reviewCount} reviews)
//                 </span>
//               ) : null}
//             </div>
//           )}

//           {/* Price */}
//           <div className="mt-5 flex flex-wrap items-baseline gap-x-3">
//             <span className="font-sans text-[26px] font-semibold text-espresso">
//               {formatPrice(price, currency)}
//             </span>
//             {onOffer && (
//               <>
//                 <span className="font-sans text-[16px] text-warm-gray line-through">
//                   {formatPrice(compare, currency)}
//                 </span>
//                 <span className="font-sans text-[14px] font-medium text-copper">
//                   -{percentOff}%
//                 </span>
//               </>
//             )}
//           </div>
//           {onOffer && product.offerEndsAt && (
//             <p
//               suppressHydrationWarning
//               className="mt-1 font-sans text-[13px] text-warm-gray"
//             >
//               Offer ends {formatStoreDate(product.offerEndsAt)}
//             </p>
//           )}

//           {product.shortDescription && (
//             <p className="mt-5 max-w-prose font-sans text-[15px] leading-relaxed text-warm-gray">
//               {product.shortDescription}
//             </p>
//           )}

//           {product.description && (
//             <div className="mt-4 max-w-prose space-y-3">
//               {product.description.split("\n\n").map((para, i) => (
//                 <p
//                   key={i}
//                   className="font-sans text-[14px] leading-relaxed text-warm-gray"
//                 >
//                   {para}
//                 </p>
//               ))}
//             </div>
//           )}

//           {product.description && (
//             <div className="mt-4 max-w-prose space-y-3">
//               {product.description.split("\n\n").map((para, i) => (
//                 <p
//                   key={i}
//                   className="font-sans text-[14px] leading-relaxed text-warm-gray"
//                 >
//                   {para}
//                 </p>
//               ))}
//             </div>
//           )}

//           {product.description && (
//             <div className="mt-4 max-w-prose space-y-3">
//               {product.description.split("\n\n").map((para, i) => (
//                 <p
//                   key={i}
//                   className="font-sans text-[14px] leading-relaxed text-warm-gray"
//                 >
//                   {para}
//                 </p>
//               ))}
//             </div>
//           )}

//           {product.description && (
//             <div className="mt-4 max-w-prose space-y-3">
//               {product.description.split("\n\n").map((para, i) => (
//                 <p
//                   key={i}
//                   className="font-sans text-[14px] leading-relaxed text-warm-gray"
//                 >
//                   {para}
//                 </p>
//               ))}
//             </div>
//           )}

//           {product.tagline.length > 0 && (
//             <ul className="mt-5 flex flex-wrap gap-2">
//               {product.tagline.map((word) => (
//                 <li
//                   key={word}
//                   className="rounded-full border border-border-strong bg-white px-3 py-1 font-sans text-[13px] text-espresso dark:border-border"
//                 >
//                   {word}
//                 </li>
//               ))}
//             </ul>
//           )}

//           {/* Add to cart */}
//           <button
//             type="button"
//             onClick={() => addItem(product.id)}
//             disabled={isOutOfStock}
//             className="mt-7 h-12 w-full cursor-pointer rounded-full bg-gradient-to-b from-espresso to-espresso-deep font-sans text-[15px] font-medium text-cream shadow-sm transition-all hover:from-espresso-deep hover:to-espresso-deep hover:shadow-md dark:bg-none dark:bg-copper dark:text-espresso-deep dark:shadow-none dark:hover:bg-copper-light disabled:cursor-not-allowed disabled:bg-none disabled:bg-disabled disabled:shadow-none dark:disabled:bg-disabled dark:disabled:text-espresso sm:max-w-xs"
//           >
//             {isOutOfStock ? "Out of stock" : "Add to cart"}
//           </button>
//           {product.state === "low-stock" && (
//             <p className="mt-2 font-sans text-[13px] text-copper">
//               Only a few left.
//             </p>
//           )}

//           {/* Tasting note */}
//           {product.tastingNote && (
//             <div className="mt-8 border-t border-border pt-6">
//               <h2 className="font-sans text-[14px] font-semibold text-espresso">
//                 Tasting notes
//               </h2>
//               <p className="mt-2 font-sans text-[14px] italic leading-relaxed text-warm-gray">
//                 {product.tastingNote}
//               </p>
//             </div>
//           )}

//           {/* Features */}
//           {product.features.length > 0 && (
//             <div className="mt-6 border-t border-border pt-6">
//               <h2 className="font-sans text-[14px] font-semibold text-espresso">
//                 Highlights
//               </h2>
//               <ul className="mt-3 flex flex-col gap-2">
//                 {product.features.map((feature) => (
//                   <li
//                     key={feature}
//                     className="font-sans text-[14px] text-warm-gray"
//                   >
//                     {feature}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Sections */}
//           {product.sections.map((section, i) => (
//             <div
//               key={`${section.title}-${i}`}
//               className="mt-6 border-t border-border pt-6"
//             >
//               <h2 className="font-sans text-[14px] font-semibold text-espresso">
//                 {section.title}
//               </h2>

//               {section.type === "steps" ? (
//                 <ol className="mt-3 list-decimal space-y-2 pl-5 font-sans text-[14px] text-warm-gray">
//                   {section.content.map((line, j) => (
//                     <li key={j}>{line}</li>
//                   ))}
//                 </ol>
//               ) : section.type === "list" ? (
//                 <ul className="mt-3 list-disc space-y-1.5 pl-5 font-sans text-[14px] text-warm-gray">
//                   {section.content.map((line, j) => (
//                     <li key={j}>{line}</li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div className="mt-2 space-y-2">
//                   {section.content.map((line, j) => (
//                     <p
//                       key={j}
//                       className="font-sans text-[14px] leading-relaxed text-warm-gray"
//                     >
//                       {line}
//                     </p>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Facts */}
//           {facts.length > 0 && (
//             <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
//               {facts.map((fact) => (
//                 <div key={fact.label}>
//                   <dt className="font-sans text-[12px] text-warm-gray">
//                     {fact.label}
//                   </dt>
//                   <dd className="mt-0.5 font-sans text-[14px] text-espresso">
//                     {fact.value}
//                   </dd>
//                 </div>
//               ))}
//             </dl>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Globe2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getComparePrice, getPriceInfo, type Product } from "@/data/products";
import { useMarket } from "@/components/providers/market-provider";
import { useCart } from "@/components/providers/cart-provider";
import { formatStoreDate } from "@/lib/store-time";

// Product detail view (modern layout). Client component because the price
// depends on the visitor's market (currency) and the cart is a client
// provider. The server page finds the product and passes it in.

// Only keep claims that are true for your shop.
const TRUST: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Globe2, title: "From Indonesia", text: "Shipped worldwide" },
  { icon: Truck, title: "Tracked", text: "Follow your parcel" },
  { icon: ShieldCheck, title: "Secure", text: "Safe checkout" },
];

const BUTTON =
  "group inline-flex h-14 w-full cursor-pointer touch-manipulation items-center justify-center gap-2.5 rounded-full border border-copper/60 bg-gradient-to-br from-green-deep to-green font-sans text-[15px] font-semibold text-cream shadow-[0_16px_32px_-14px_rgba(35,77,42,0.9)] transition-all duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:cursor-not-allowed disabled:border-transparent disabled:bg-none disabled:bg-disabled disabled:text-cream disabled:shadow-none motion-reduce:transition-none [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:from-green [@media(hover:hover)]:hover:to-green-deep";

// Renders the description text without a markdown library.
// Supports **bold**, headings, bullet lists and numbered steps.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.length > 4 && part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-espresso">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const HEADING_MAX_CHARS = 32;

function RichText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="max-w-prose space-y-3">
      {blocks.map((block, i) => {
        const boldOnly = block.match(/^\*\*([^*]+)\*\*:?$/);
        const isTitle =
          i < blocks.length - 1 &&
          !block.includes("\n") &&
          block.length <= HEADING_MAX_CHARS &&
          block.split(/\s+/).length <= 5 &&
          /^\p{L}/u.test(block) &&
          !/[.!?:;,]$/.test(block);

        // Heading
        if (boldOnly || isTitle) {
          return (
            <h3
              key={i}
              className="pt-3 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-green-deep first:pt-0"
            >
              {boldOnly ? boldOnly[1] : block}
            </h3>
          );
        }

        // Numbered steps: "1. ... 2. ..." on one line or on separate lines
        if (/^\d+[.)]\s/.test(block)) {
          const steps = (
            block.includes("\n")
              ? block.split("\n")
              : block.split(/\s(?=\d+[.)]\s)/)
          )
            .map((s) => s.replace(/^\d+[.)]\s+/, "").trim())
            .filter(Boolean);
          return (
            <ol key={i} className="space-y-2.5">
              {steps.map((step, j) => (
                <li
                  key={j}
                  className="flex gap-3 font-sans text-[14.5px] leading-relaxed text-warm-gray"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-deep to-green font-sans text-[12px] font-semibold text-cream"
                  >
                    {j + 1}
                  </span>
                  <span className="pt-0.5">
                    <Inline text={step} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }

        // Bullets: "* a * b * c" on one line, or one per line
        if (/^[*\-•]\s/.test(block)) {
          const items = (
            block.includes("\n") ? block.split("\n") : block.split(/\s[*•]\s+/)
          )
            .map((s) => s.replace(/^[*\-•]\s+/, "").trim())
            .filter(Boolean);
          return (
            <ul key={i} className="flex flex-wrap gap-2">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="rounded-full border border-green/20 bg-[#eef3ea] px-3 py-1 font-sans text-[13px] font-medium text-green-deep"
                >
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }

        // Normal paragraph
        return (
          <p
            key={i}
            className="whitespace-pre-line font-sans text-[14.5px] leading-relaxed text-warm-gray"
          >
            <Inline text={block} />
          </p>
        );
      })}
    </div>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const { market } = useMarket();
  const { addItem } = useCart();

  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<string>("");
  const [showBar, setShowBar] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOutOfStock = product.state === "out-of-stock";
  const isLow = product.state === "low-stock";
  const { amount: price, currency } = getPriceInfo(product, market.currencyCode);
  const compare = getComparePrice(product, market.currencyCode);
  const onOffer = compare !== undefined && compare > price;
  const percentOff = onOffer ? Math.round((1 - price / compare) * 100) : 0;

  const facts = [
    product.origin && { label: "Origin", value: product.origin },
    // product.weight && { label: "Weight", value: product.weight },
    product.category && { label: "Category", value: product.category },
  ].filter(Boolean) as { label: string; value: string }[];

  // Tabs only for content that exists.
  const tabs = [
    {
      id: "about",
      label: "About",
      show: !!product.description || product.tagline.length > 0,
    },
    {
      id: "notes",
      label: "Notes",
      show: !!product.tastingNote || product.features.length > 0,
    },
    {
      id: "details",
      label: "Details",
      show: product.sections.length > 0 || facts.length > 0,
    },
  ].filter((t) => t.show);
  const activeTab = tabs.find((t) => t.id === tab)?.id ?? tabs[0]?.id;

  // Show the mobile bar only once the main buy box has scrolled away.
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    addItem(product.id);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  const label = isOutOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart";
  const ButtonIcon = added ? Check : ShoppingBag;

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 sm:px-8 md:pb-14 lg:pt-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 font-sans text-[13px] text-warm-gray">
          <li>
            <Link
              href="/shop"
              className="inline-flex min-h-[36px] items-center rounded-md transition-colors active:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-copper [@media(hover:hover)]:hover:text-espresso"
            >
              Shop
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li>{product.category}</li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li aria-current="page" className="truncate font-medium text-espresso">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:gap-14">
        {/* Image stage */}
        <div className="lg:col-span-7">
          <div className="relative isolate aspect-[4/4.2] w-full overflow-hidden rounded-[28px] border border-[#e4dac8] bg-gradient-to-br from-white via-[#f7f1e6] to-[#eef3ea] shadow-[0_30px_60px_-36px_rgba(16,38,15,0.55)] lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] dark:border-border">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,128,63,0.18)_0%,rgba(35,77,42,0.08)_50%,transparent_72%)]"
            />
            <Image
              src={product.image}
              alt={`${product.name} — ${product.category}`}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-contain p-8 sm:p-12"
            />

            {/* Floating chips */}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {onOffer && (
                <span className="rounded-full bg-gradient-to-br from-copper-light to-copper px-3 py-1 font-sans text-[12px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(201,128,63,0.9)]">
                  -{percentOff}%
                </span>
              )}
              {isLow && (
                <span className="rounded-full border border-copper/30 bg-white/80 px-3 py-1 font-sans text-[12px] font-medium text-[#8a5220] backdrop-blur">
                  Only a few left
                </span>
              )}
            </div>
            {product.rating !== undefined && (
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-[#e4dac8] bg-white/85 px-3 py-1.5 font-sans text-[13px] font-medium text-espresso backdrop-blur">
                <Star
                  className="h-3.5 w-3.5 fill-copper text-copper"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {product.rating.toFixed(1)}
                {product.reviewCount ? (
                  <span className="font-normal text-warm-gray">
                    ({product.reviewCount})
                  </span>
                ) : null}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col lg:col-span-5">
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-green-deep">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-[38px] font-semibold leading-[1.05] tracking-tight text-espresso md:text-[52px]">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="mt-4 max-w-prose font-sans text-[16px] leading-relaxed text-warm-gray">
              {product.shortDescription}
            </p>
          )}

          {/* Buy box */}
          <div
            ref={buyRef}
            className="relative mt-7 overflow-hidden rounded-3xl border border-[#e4dac8] bg-white p-5 shadow-[0_18px_40px_-28px_rgba(16,38,15,0.4)] dark:border-border sm:p-6"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#10260f] via-green to-[#1b4a24]"
            />

            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-[40px] font-semibold leading-none text-espresso [font-variant-numeric:tabular-nums]">
                  {formatPrice(price, currency)}
                </span>
                {onOffer && (
                  <span className="font-sans text-[17px] text-warm-gray line-through [font-variant-numeric:tabular-nums]">
                    {formatPrice(compare, currency)}
                  </span>
                )}
              </div>
              {!isOutOfStock && (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 font-sans text-[12px] font-medium",
                    isLow
                      ? "bg-[#fbeedc] text-[#8a5220]"
                      : "bg-[#e6f3ea] text-green-deep",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isLow ? "bg-copper" : "bg-green",
                    )}
                  />
                  {isLow ? "Low stock" : "In stock"}
                </span>
              )}
            </div>

            {onOffer && product.offerEndsAt && (
              <p
                suppressHydrationWarning
                className="mt-2 font-sans text-[13px] text-warm-gray"
              >
                Offer ends {formatStoreDate(product.offerEndsAt)}
              </p>
            )}

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={cn(
                BUTTON,
                "mt-5",
                added && "from-green to-green-deep",
              )}
            >
              <ButtonIcon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
              {label}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {added ? `${product.name} added to cart` : ""}
            </span>

            {/* Trust row */}
            <ul className="mt-5 grid grid-cols-3 gap-2 border-t border-[#e4dac8] pt-4 dark:border-border">
              {TRUST.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex flex-col items-center text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3ea] text-green-deep">
                    <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <p className="mt-2 font-sans text-[12px] font-semibold text-espresso">
                    {title}
                  </p>
                  <p className="font-sans text-[11px] text-warm-gray">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="mt-8">
              <div
                role="tablist"
                aria-label="Product information"
                className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-[#e4dac8] bg-[#eef3ea]/70 p-1 dark:border-border"
              >
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={activeTab === t.id}
                    aria-controls={`panel-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "min-h-[40px] shrink-0 cursor-pointer touch-manipulation rounded-full px-5 font-sans text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-copper",
                      activeTab === t.id
                        ? "bg-gradient-to-br from-green-deep to-green text-cream shadow-sm"
                        : "text-warm-gray active:text-espresso [@media(hover:hover)]:hover:text-espresso",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                className="mt-5"
              >
                {activeTab === "about" && (
                  <div className="space-y-4">
                    {product.description && (
                      <RichText text={product.description} />
                    )}
                    {product.tagline.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {product.tagline.map((word) => (
                          <li
                            key={word}
                            className="rounded-full border border-green/20 bg-[#eef3ea] px-3 py-1 font-sans text-[13px] font-medium text-green-deep"
                          >
                            {word}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="space-y-5">
                    {product.tastingNote && (
                      <figure className="rounded-2xl border border-copper/25 bg-gradient-to-br from-copper/10 to-white p-5">
                        <figcaption className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5220]">
                          Tasting notes
                        </figcaption>
                        <p className="mt-2 font-display text-[18px] italic leading-relaxed text-espresso">
                          <Inline text={product.tastingNote} />
                        </p>
                      </figure>
                    )}
                    {product.features.length > 0 && (
                      <ul className="grid gap-2.5">
                        {product.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 font-sans text-[14px] text-warm-gray"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6f3ea] text-green-deep">
                              <Check className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    {facts.length > 0 && (
                      <dl className="grid grid-cols-2 gap-3">
                        {facts.map((fact) => (
                          <div
                            key={fact.label}
                            className="rounded-2xl border border-[#e4dac8] bg-[#eef3ea]/60 px-4 py-3 dark:border-border"
                          >
                            <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-warm-gray">
                              {fact.label}
                            </dt>
                            <dd className="mt-1 font-sans text-[14px] font-medium text-espresso">
                              {fact.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {product.sections.map((section, i) => (
                      <section key={`${section.title}-${i}`}>
                        <h2 className="font-sans text-[14px] font-semibold text-espresso">
                          {section.title}
                        </h2>
                        {section.type === "steps" ? (
                          <ol className="mt-3 space-y-3">
                            {section.content.map((line, j) => (
                              <li
                                key={j}
                                className="flex gap-3 font-sans text-[14px] leading-relaxed text-warm-gray"
                              >
                                <span
                                  aria-hidden="true"
                                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-deep to-green font-sans text-[12px] font-semibold text-cream"
                                >
                                  {j + 1}
                                </span>
                                <span className="pt-0.5">{line}</span>
                              </li>
                            ))}
                          </ol>
                        ) : section.type === "list" ? (
                          <ul className="mt-3 space-y-2">
                            {section.content.map((line, j) => (
                              <li
                                key={j}
                                className="flex gap-2.5 font-sans text-[14px] text-warm-gray"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-green"
                                />
                                {line}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {section.content.map((line, j) => (
                              <p
                                key={j}
                                className="font-sans text-[14px] leading-relaxed text-warm-gray"
                              >
                                <Inline text={line} />
                              </p>
                            ))}
                          </div>
                        )}
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bar: appears only after the main buy box scrolls away */}
      <div
        aria-hidden={!showBar}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-[#e4dac8] bg-white/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-18px_rgba(16,38,15,0.4)] backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none md:hidden dark:border-border",
          showBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-4">
          <div className="min-w-0">
            <p className="truncate font-sans text-[12px] text-warm-gray">
              {product.name}
            </p>
            <p className="font-display text-[20px] font-semibold leading-tight text-espresso [font-variant-numeric:tabular-nums]">
              {formatPrice(price, currency)}
            </p>
          </div>
          <button
            type="button"
            tabIndex={showBar ? 0 : -1}
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={cn(BUTTON, "h-12 flex-1", added && "from-green to-green-deep")}
          >
            <ButtonIcon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}