"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal, InputNumber } from "antd";
import { Loader2, PackagePlus, Pencil } from "lucide-react";
import { restock, adjustStock } from "@/lib/admin/inventory-actions";
import type { InventoryRow } from "@/lib/admin/inventory-queries";

// Confirmation modal for adding received stock to a variant. Always
// ADDS to the existing stock (stock = stock + quantity) — this dialog
// never lets the admin type a replacement total, so there's no way to
// accidentally overwrite/erase current stock by mistake.

export function RestockDialog({
  item,
  onClose,
}: {
  item: InventoryRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // false = restock (add only); true = correct a wrong entry (any non-zero delta)
  const [isCorrection, setIsCorrection] = useState(false);

  // Reset the form whenever a new row is targeted / dialog closes.
  useEffect(() => {
    setQuantity(null);
    setError(null);
    setIsCorrection(false);
  }, [item]);

  function handleConfirm() {
    if (!item || quantity === null || quantity === 0) {
      setError(
        isCorrection
          ? "Enter a non-zero amount (negative to reduce stock)."
          : "Enter a quantity greater than 0.",
      );
      return;
    }
    if (!isCorrection && quantity < 0) {
      setError("Enter a quantity greater than 0.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = isCorrection
        ? await adjustStock(item.variantId, quantity)
        : await restock(item.variantId, quantity);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  const newTotal =
    item && quantity !== null && quantity !== 0
      ? item.totalStock + quantity
      : null;

  return (
    <Modal
      open={!!item}
      onCancel={() => !isPending && onClose()}
      footer={null}
      closable={!isPending}
      maskClosable={!isPending}
      centered
      width={380}
      styles={{ container: { borderRadius: 16, padding: 24 } }}
    >
      {item && (
        <>
          <span
            className={
              isCorrection
                ? "flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper"
                : "flex h-11 w-11 items-center justify-center rounded-full bg-green-bg text-green"
            }
          >
            {isCorrection ? (
              <Pencil
                className="h-5 w-5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ) : (
              <PackagePlus
                className="h-5 w-5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
          </span>

          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            {isCorrection ? "Correct stock for" : "Restock"} "{item.productName}
            "
          </h2>
          <p className="mt-1 font-sans text-[13px] text-warm-gray">
            {item.variantName} · SKU {item.sku}
          </p>

          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between">
              <label className="font-sans text-[13px] text-warm-gray">
                {isCorrection ? "Adjustment (+ or −)" : "Quantity received"}
              </label>
              <button
                style={{
                  cursor: "pointer",
                }}
                type="button"
                onClick={() => {
                  setIsCorrection((prev) => !prev);
                  setQuantity(null);
                  setError(null);
                }}
                className="font-sans text-[12px] text-copper underline decoration-dotted underline-offset-2 hover:text-espresso"
              >
                {isCorrection
                  ? "Restock instead"
                  : "Entered wrong amount? Correct stock"}
              </button>
            </div>
            <InputNumber
              autoFocus
              value={quantity}
              onChange={setQuantity}
              min={isCorrection ? -item.totalStock : 1}
              step={1}
              placeholder={isCorrection ? "e.g. -5" : "e.g. 50"}
              style={{ height: 44, width: "100%" }}
              status={error ? "error" : undefined}
              onPressEnter={handleConfirm}
            />
            {error && (
              <p className="mt-1 font-sans text-[12px] text-copper">{error}</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-cream-soft px-4 py-3 font-sans text-[13px]">
            <span className="text-warm-gray">Current stock</span>
            <span className="tabular-nums text-espresso">
              {item.totalStock}
            </span>
          </div>
          {newTotal !== null && (
            <div className="mt-2 flex items-center justify-between rounded-xl bg-green-bg px-4 py-3 font-sans text-[13px]">
              <span className="text-green">New total</span>
              <span className="font-medium tabular-nums text-green">
                {newTotal}
              </span>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              style={{
                cursor: "pointer",
              }}
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              style={{
                cursor: "pointer",
              }}
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              aria-busy={isPending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isCorrection ? "Save Correction" : "Add Stock"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
