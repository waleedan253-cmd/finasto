"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { AlertTriangle, Loader2 } from "lucide-react";
import { setAffiliateStatus } from "@/lib/admin/affiliate-actions";
import type { AffiliateListItem } from "@/lib/admin/affiliate-queries";

// Confirmation modal for removing an affiliate. This is always a soft
// delete (status = 'deleted'), never a row delete: future orders will
// reference affiliate_id, and historical sales and commission data must
// stay correct. Deleted affiliates are filtered out of every admin list
// and detail query, so they simply disappear from the UI.
//
// Note: this only changes the affiliate record. Their login account (if
// the invite was accepted) is not removed, so the dashboard should check
// the affiliate's status when it is built.

export function DeleteAffiliateDialog({
  affiliate,
  onClose,
}: {
  affiliate: AffiliateListItem | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [affiliate]);

  function handleDelete() {
    if (!affiliate) return;
    setError(null);
    startTransition(async () => {
      const result = await setAffiliateStatus(affiliate.id, "deleted");
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
      open={!!affiliate}
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
      {affiliate && (
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <AlertTriangle
              className="h-5 w-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            Delete “{affiliate.name}”?
          </h2>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
            {affiliate.stockistName
              ? `This affiliate is assigned to ${affiliate.stockistName}. They will be removed from that stockist's list. Their record and any sales history are kept, not erased.`
              : "This removes the affiliate from your lists. Their record and any sales history are kept, not erased."}
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
              Delete Affiliate
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
