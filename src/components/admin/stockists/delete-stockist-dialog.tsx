"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { AlertTriangle, Loader2 } from "lucide-react";
import { setStockistStatus } from "@/lib/admin/stockist-actions";
import type { StockistListItem } from "@/lib/admin/stockist-queries";

// Confirmation modal for removing a stockist. This is always a soft
// delete (status = 'deleted'), never a row delete — order_items will
// reference stockist_id later, and historical financial data must stay
// correct per the Stockist prompt (section 10). So unlike
// delete-product-dialog.tsx, there's no "blocked by history" branch
// here: it always succeeds, because it never actually removes the row.

export function DeleteStockistDialog({
  stockist,
  onClose,
}: {
  stockist: StockistListItem | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [stockist]);

  function handleDelete() {
    if (!stockist) return;
    setError(null);
    startTransition(async () => {
      const result = await setStockistStatus(stockist.id, "deleted");
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Modal
      open={!!stockist}
      onCancel={() => !isPending && onClose()}
      footer={null}
      closable={!isPending}
      maskClosable={!isPending}
      centered
      width={400}
      styles={{
        container: { borderRadius: 16, padding: 24 },
      }}
    >
      {stockist && (
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <AlertTriangle
              className="h-5 w-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            Delete “{stockist.name}”?
          </h2>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
            {stockist.affiliateCount > 0
              ? `This stockist has ${stockist.affiliateCount} assigned ${
                  stockist.affiliateCount === 1 ? "affiliate" : "affiliates"
                }. Their sales history stays intact, but you should reassign ${
                  stockist.affiliateCount === 1
                    ? "that affiliate"
                    : "those affiliates"
                } to another stockist afterward.`
              : "This marks the stockist as deleted. Their record and any sales history are kept, not erased, and they can be restored later if needed."}
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              aria-busy={isPending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-copper px-5 font-sans text-[14px] font-medium text-white transition-colors hover:bg-copper/90 disabled:cursor-not-allowed disabled:bg-disabled"
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Delete Stockist
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
