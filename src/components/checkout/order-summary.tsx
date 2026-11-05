// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useCart } from "@/components/providers/cart-provider";
// import { useMarket } from "@/components/providers/market-provider";
// import { getPrice } from "@/data/products";
// import { useProducts } from "@/components/providers/products-provider";
// import { formatPrice } from "@/lib/utils";

// // Read-only order summary for the checkout page. Deliberately reuses the
// // exact same data/calculation pattern as CartDrawer (products prop +
// // getPrice(product, currency)) rather than inventing a second way to
// // compute a cart total — so the subtotal shown here can never disagree
// // with what the customer saw in the cart drawer a moment earlier.
// //
// // No quantity controls here on purpose — editing the cart happens in the
// // drawer; this page is for reviewing and confirming, not adjusting.

// export function OrderSummary() {
//   const products = useProducts();
//   const { lines } = useCart();
//   const { market } = useMarket();
//   const currency = market.currencyCode;

//   const items = lines.flatMap((line) => {
//     const product = products.find((p) => p.id === line.productId);
//     return product ? [{ product, quantity: line.quantity }] : [];
//   });

//   const subtotal = items.reduce(
//     (sum, { product, quantity }) =>
//       sum + getPrice(product, currency) * quantity,
//     0,
//   );

//   if (items.length === 0) {
//     return (
//       <div className="rounded-2xl border border-dashed border-border-strong bg-white p-8 text-center">
//         <p className="font-sans text-[14px] text-espresso">Your bag is empty</p>
//         <Link
//           href="/shop"
//           className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-espresso px-5 font-sans text-[13px] font-medium text-cream transition-colors hover:bg-espresso-deep"
//         >
//           Browse the collection
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
//       <h2 className="font-display text-[22px] leading-tight text-espresso">
//         Order Summary
//       </h2>

//       <ul className="mt-5 flex flex-col gap-4">
//         {items.map(({ product, quantity }) => {
//           const unitPrice = getPrice(product, currency);
//           return (
//             <li key={product.id} className="flex gap-3">
//               <div
//                 style={{
//                   background: `linear-gradient(to bottom, ${product.accentColor}26, #ffffff)`,
//                 }}
//                 className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border border-border"
//               >
//                 <Image
//                   src={product.image}
//                   alt={`${product.name} — ${product.category} pouch`}
//                   fill
//                   sizes="64px"
//                   className="object-contain p-1.5"
//                 />
//                 <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-espresso font-sans text-[11px] font-medium text-cream">
//                   {quantity}
//                 </span>
//               </div>

//               <div className="min-w-0 flex-1">
//                 <p className="truncate font-sans text-[14px] font-medium text-espresso">
//                   {product.name}
//                 </p>
//                 {product.weight && (
//                   <p className="font-sans text-[12px] text-warm-gray">
//                     {product.weight}
//                   </p>
//                 )}
//               </div>

//               <p className="shrink-0 font-sans text-[14px] font-medium text-espresso">
//                 {formatPrice(unitPrice * quantity, currency)}
//               </p>
//             </li>
//           );
//         })}
//       </ul>

//       <div className="mt-5 border-t border-border pt-4">
//         <div className="flex items-center justify-between">
//           <span className="font-sans text-[14px] text-espresso/80">
//             Subtotal
//           </span>
//           <span className="font-sans text-[18px] font-semibold text-espresso">
//             {formatPrice(subtotal, currency)}
//           </span>
//         </div>
//         <p className="mt-1 font-sans text-[12px] text-warm-gray">
//           Shipping and taxes are calculated after order confirmation.
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useMarket } from "@/components/providers/market-provider";
import { getPrice } from "@/data/products";
import { useProducts } from "@/components/providers/products-provider";
import { formatPrice } from "@/lib/utils";

// Read-only order summary for the checkout page. Deliberately reuses the
// exact same data/calculation pattern as CartDrawer (products prop +
// getPrice(product, currency)) rather than inventing a second way to
// compute a cart total — so the subtotal shown here can never disagree
// with what the customer saw in the cart drawer a moment earlier.
//
// No quantity controls here on purpose — editing the cart happens in the
// drawer; this page is for reviewing and confirming, not adjusting.

const CARD =
  "rounded-3xl border border-border bg-cream-soft shadow-[0_1px_2px_rgba(60,40,25,0.04),0_18px_40px_-18px_rgba(60,40,25,0.18)]";

export function OrderSummary() {
  const products = useProducts();
  const { lines } = useCart();
  const { market } = useMarket();
  const currency = market.currencyCode;

  const items = lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.productId);
    return product ? [{ product, quantity: line.quantity }] : [];
  });

  const subtotal = items.reduce(
    (sum, { product, quantity }) =>
      sum + getPrice(product, currency) * quantity,
    0,
  );

  const itemCount = items.reduce((n, { quantity }) => n + quantity, 0);

  if (items.length === 0) {
    return (
      <div
        className={`${CARD} border-dashed border-border-strong p-8 text-center sm:p-10`}
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-copper">
          <ShoppingBag className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="mt-4 font-display text-[20px] text-espresso">
          Your bag is empty
        </p>
        <p className="mt-1 font-sans text-[13px] text-warm-gray">
          Add something you love to get started.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-espresso px-6 font-sans text-[13px] font-medium text-cream transition-colors hover:bg-espresso-deep"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`${CARD} relative overflow-hidden bg-gradient-to-b from-cream-soft to-cream`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-espresso via-copper to-green"
      />
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-cream to-cream-soft px-5 py-4 pt-5 sm:px-8 sm:py-5 sm:pt-6">
        <h2 className="font-display text-[22px] leading-tight text-espresso">
          Order Summary
        </h2>
        <span className="rounded-full bg-white px-3 py-1 font-sans text-[12px] font-medium text-espresso/80 ring-1 ring-border">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="p-5 sm:p-8">
        <ul className="flex max-h-[340px] flex-col gap-4 overflow-y-auto pr-1">
          {items.map(({ product, quantity }) => {
            const unitPrice = getPrice(product, currency);
            return (
              <li key={product.id} className="flex items-center gap-3 sm:gap-4">
                <div
                  style={{
                    background: `linear-gradient(to bottom, ${product.accentColor}26, #ffffff)`,
                  }}
                  className="relative h-[68px] w-[68px] shrink-0 rounded-2xl border border-border"
                >
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <Image
                      src={product.image}
                      alt={`${product.name} — ${product.category} pouch`}
                      fill
                      sizes="68px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso px-1 font-sans text-[11px] font-medium text-cream ring-2 ring-white">
                    {quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[14px] font-medium text-espresso">
                    {product.name}
                  </p>
                  {product.weight && (
                    <p className="mt-0.5 font-sans text-[12px] text-warm-gray">
                      {product.weight}
                    </p>
                  )}
                  {quantity > 1 && (
                    <p className="mt-0.5 font-sans text-[12px] text-warm-gray">
                      {formatPrice(unitPrice, currency)} each
                    </p>
                  )}
                </div>

                <p className="shrink-0 font-sans text-[14px] font-semibold text-espresso">
                  {formatPrice(unitPrice * quantity, currency)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 space-y-3 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[14px] text-espresso/80">
              Subtotal
            </span>
            <span className="font-sans text-[14px] font-medium text-espresso">
              {formatPrice(subtotal, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans text-[14px] text-espresso/80">
              Shipping
            </span>
            <span className="font-sans text-[13px] text-warm-gray">
              After confirmation
            </span>
          </div>
          <div className="flex items-end justify-between border-t border-dashed border-border-strong pt-4">
            <span className="font-display text-[18px] text-espresso">
              Total
            </span>
            <span className="font-display text-[26px] leading-none text-espresso">
              {formatPrice(subtotal, currency)}
            </span>
          </div>
          <p className="font-sans text-[12px] leading-relaxed text-warm-gray">
            Shipping and taxes are calculated after order confirmation.
          </p>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-cream/70 px-4 py-4 ring-1 ring-border sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-green ring-1 ring-border">
              <Mail className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="font-sans text-[12px] leading-snug text-espresso/80">
              Tracking code sent by email
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-copper ring-1 ring-border">
              <Truck className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="font-sans text-[12px] leading-snug text-espresso/80">
              Delivered by trusted couriers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}