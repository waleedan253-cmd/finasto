"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { deleteProduct } from "@/lib/admin/product-actions";
import { setProductStatus } from "@/lib/admin/product-actions";
import type { ProductListItem } from "@/lib/admin/product-queries";

// Confirmation modal for deleting a product. deleteProduct() only
// succeeds when the product has no order history (enforced by a real
// foreign-key constraint in the database, not just this UI) — when it's
// blocked, this dialog offers "Disable instead" as the safe alternative
// the brief asks for, rather than a dead-end error message.

export function DeleteProductDialog({
  product,
  onClose,
}: {
  product: ProductListItem | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [blockedByHistory, setBlockedByHistory] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Reset local state whenever a new product is targeted / dialog closes.
  useEffect(() => {
    setError(null);
    setBlockedByHistory(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isPending]);

  function handleDelete() {
    if (!product) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.success) {
        router.refresh();
        onClose();
        return;
      }
      setError(result.error);
      setBlockedByHistory(result.error.toLowerCase().includes("order history"));
    });
  }

  function handleDisableInstead() {
    if (!product) return;
    setError(null);
    startTransition(async () => {
      const result = await setProductStatus(product.id, "disabled");
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-espresso-deep/40"
            onClick={() => !isPending && onClose()}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-heading"
            className="relative w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-espresso/60 transition-colors hover:bg-cream-soft hover:text-espresso disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
              <AlertTriangle
                className="h-5 w-5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>

            <h2
              id="delete-product-heading"
              className="mt-4 font-display text-[22px] leading-tight text-espresso"
            >
              Delete “{product.name}”?
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
              This permanently removes the product, its variants and country
              pricing. This can't be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              {blockedByHistory ? (
                <button
                  type="button"
                  onClick={handleDisableInstead}
                  disabled={isPending}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
                >
                  {isPending && (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Disable instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  aria-busy={isPending}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-copper px-5 font-sans text-[14px] font-medium text-white transition-colors hover:bg-copper/90 disabled:cursor-not-allowed disabled:bg-disabled"
                >
                  {isPending && (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Delete Product
                </button>
              )}

              <button
                ref={cancelRef}
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
