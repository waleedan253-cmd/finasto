"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteMyLink } from "@/lib/affiliate/links-actions";
import type { MyLink } from "@/lib/affiliate/links-queries";

// Confirmation modal for deleting a referral link. Same look and flow as
// delete-affiliate-dialog.tsx. The delete is a soft delete on the server
// (the row is kept for history), so past sales and earnings are never
// affected, and the affiliate can generate a fresh link for the same
// product right afterwards.

export function DeleteLinkDialog({
  link,
  onClose,
}: {
  link: MyLink | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [link]);

  function handleDelete() {
    if (!link) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMyLink(link.id);
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
      open={!!link}
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
      {link && (
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <AlertTriangle
              className="h-5 w-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            Delete link for “{link.productName}”?
          </h2>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
            This link stops working right away. Anyone who opens it will be
            taken to the normal shop instead. Your past sales and earnings are
            not affected, and you can generate a new link for this product
            afterwards.
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
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-5 font-sans text-[14px] font-medium text-white transition-colors hover:bg-copper/90 disabled:cursor-not-allowed disabled:bg-disabled"
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Delete Link
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
