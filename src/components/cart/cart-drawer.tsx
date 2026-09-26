"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { MAX_QUANTITY, useCart } from "@/components/providers/cart-provider";
import { useMarket } from "@/components/providers/market-provider";
import { getPrice, products } from "@/data/products";
import { cn, formatPrice } from "@/lib/utils";

const tint = {
  green: "bg-gradient-to-b from-[#E7ECDF] to-white",
  blue: "bg-gradient-to-b from-[#DEE7EF] to-white",
} as const;

export function CartDrawer() {
  const { lines, count, isOpen, closeCart, setQuantity, removeItem } =
    useCart();
  const { market } = useMarket();
  const currency = market.currencyCode;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button and lock page scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Close with the Escape key.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  // The cart stores only ids and quantities. Details and prices come
  // from the product data in the selected currency.
  const items = lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.productId);
    return product ? [{ product, quantity: line.quantity }] : [];
  });

  const subtotal = items.reduce(
    (sum, { product, quantity }) =>
      sum + getPrice(product, currency) * quantity,
    0,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-overlay"
            aria-hidden="true"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-espresso/40"
          />

          <motion.aside
            key="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-cream shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-[22px] text-espresso">
                Your Bag
                {count > 0 && (
                  <span className="ml-2 font-sans text-[13px] text-warm-gray">
                    ({count})
                  </span>
                )}
              </h2>
              <button
                style={{
                  cursor: "pointer",
                }}
                ref={closeButtonRef}
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-espresso/5 hover:text-espresso"
              >
                <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>

            {items.length === 0 ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag
                  className="h-8 w-8 text-warm-gray"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
                <p className="mt-4 font-sans text-[15px] font-medium text-espresso">
                  Your bag is empty
                </p>
                <p className="mt-1 font-sans text-[13px] text-warm-gray">
                  Discover our teas and add your favorites.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-espresso to-espresso-deep px-6 font-sans text-[13px] font-medium text-cream shadow-sm transition-shadow hover:shadow-md"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
                  {items.map(({ product, quantity }) => {
                    const unitPrice = getPrice(product, currency);
                    return (
                      <li key={product.id} className="flex gap-4 py-5">
                        <Link
                          href={`/shop/${product.slug}`}
                          onClick={closeCart}
                          className={cn(
                            "relative h-24 w-24 shrink-0 overflow-hidden rounded-[12px] border border-border",
                            tint[product.accentTint],
                          )}
                        >
                          <Image
                            src={product.image}
                            alt={`${product.name} — ${product.category} pouch`}
                            fill
                            sizes="96px"
                            className="object-contain p-2"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-warm-gray">
                                {product.category}
                              </p>
                              <Link
                                href={`/shop/${product.slug}`}
                                onClick={closeCart}
                                className="block truncate font-sans text-[15px] font-semibold text-espresso hover:text-copper"
                              >
                                {product.name}
                              </Link>
                              {product.weight && (
                                <p className="font-sans text-[12px] text-warm-gray">
                                  {product.weight}
                                </p>
                              )}
                            </div>
                            <p className="shrink-0 font-sans text-[14px] font-semibold text-espresso">
                              {formatPrice(unitPrice * quantity, currency)}
                            </p>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-border bg-white">
                              <button
                                style={{
                                  cursor: "pointer",
                                }}
                                type="button"
                                onClick={() =>
                                  setQuantity(product.id, quantity - 1)
                                }
                                aria-label={`Decrease quantity of ${product.name}`}
                                className="inline-flex h-8 w-8 items-center justify-center text-espresso transition-colors hover:text-copper"
                              >
                                <Minus
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                              <span
                                className="w-6 text-center font-sans text-[13px] font-medium text-espresso"
                                aria-live="polite"
                              >
                                {quantity}
                              </span>
                              <button
                                style={{
                                  cursor: "pointer",
                                }}
                                type="button"
                                onClick={() =>
                                  setQuantity(product.id, quantity + 1)
                                }
                                disabled={quantity >= MAX_QUANTITY}
                                aria-label={`Increase quantity of ${product.name}`}
                                className="inline-flex h-8 w-8 items-center justify-center text-espresso transition-colors hover:text-copper disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-espresso"
                              >
                                <Plus
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>

                            <button
                              style={{
                                cursor: "pointer",
                              }}
                              type="button"
                              onClick={() => removeItem(product.id)}
                              className="font-sans text-[12px] text-warm-gray underline-offset-4 transition-colors hover:text-copper hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Footer */}
                <div className="border-t border-border bg-white px-5 py-5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[14px] text-espresso/80">
                      Subtotal
                    </span>
                    <span className="font-sans text-[17px] font-semibold text-espresso">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-[12px] text-warm-gray">
                    Shipping and taxes are calculated at checkout.
                  </p>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-b from-espresso to-espresso-deep font-sans text-[14px] font-medium text-cream shadow-sm transition-shadow hover:shadow-md"
                  >
                    Checkout
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-2 h-10 w-full font-sans text-[13px] text-espresso/70 transition-colors hover:text-espresso"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
