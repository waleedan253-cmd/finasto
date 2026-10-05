"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { useMarket } from "@/components/providers/market-provider";
import { getPrice, type Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";

// Read-only order summary for the checkout page. Deliberately reuses the
// exact same data/calculation pattern as CartDrawer (products prop +
// getPrice(product, currency)) rather than inventing a second way to
// compute a cart total — so the subtotal shown here can never disagree
// with what the customer saw in the cart drawer a moment earlier.
//
// No quantity controls here on purpose — editing the cart happens in the
// drawer; this page is for reviewing and confirming, not adjusting.

export function OrderSummary({ products }: { products: Product[] }) {
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

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-white p-8 text-center">
        <p className="font-sans text-[14px] text-espresso">Your bag is empty</p>
        <Link
          href="/shop"
          className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-espresso px-5 font-sans text-[13px] font-medium text-cream transition-colors hover:bg-espresso-deep"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      <h2 className="font-display text-[22px] leading-tight text-espresso">
        Order Summary
      </h2>

      <ul className="mt-5 flex flex-col gap-4">
        {items.map(({ product, quantity }) => {
          const unitPrice = getPrice(product, currency);
          return (
            <li key={product.id} className="flex gap-3">
              <div
                style={{
                  background: `linear-gradient(to bottom, ${product.accentColor}26, #ffffff)`,
                }}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border border-border"
              >
                <Image
                  src={product.image}
                  alt={`${product.name} — ${product.category} pouch`}
                  fill
                  sizes="64px"
                  className="object-contain p-1.5"
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-espresso font-sans text-[11px] font-medium text-cream">
                  {quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[14px] font-medium text-espresso">
                  {product.name}
                </p>
                {product.weight && (
                  <p className="font-sans text-[12px] text-warm-gray">
                    {product.weight}
                  </p>
                )}
              </div>

              <p className="shrink-0 font-sans text-[14px] font-medium text-espresso">
                {formatPrice(unitPrice * quantity, currency)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[14px] text-espresso/80">
            Subtotal
          </span>
          <span className="font-sans text-[18px] font-semibold text-espresso">
            {formatPrice(subtotal, currency)}
          </span>
        </div>
        <p className="mt-1 font-sans text-[12px] text-warm-gray">
          Shipping and taxes are calculated after order confirmation.
        </p>
      </div>
    </div>
  );
}
