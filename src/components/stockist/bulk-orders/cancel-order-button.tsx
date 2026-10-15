"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal, message } from "antd";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cancelMyBulkOrder } from "@/lib/stockist/bulk-orders-actions";

// "Cancel request" button with a confirmation step. Shown only while the
// order is still waiting for Finasto's review. Same look and flow as the
// other confirmation dialogs. The server re-checks the order's state, so if
// Finasto sent the bank details in the meantime the cancel is refused with a
// clear message.

export function CancelOrderButton({
  orderId,
  displayNumber,
}: {
  orderId: string;
  displayNumber: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelMyBulkOrder(orderId);
      if (result.success) {
        message.success("Request cancelled");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper hover:text-copper"
      >
        Cancel request
      </button>

      <Modal
        open={open}
        onCancel={() => !isPending && setOpen(false)}
        footer={null}
        closable={!isPending}
        maskClosable={!isPending}
        centered
        width={400}
        styles={{
          container: { borderRadius: 16, padding: 24 },
        }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
          <AlertTriangle
            className="h-5 w-5"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>

        <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
          Cancel {displayNumber}?
        </h2>
        <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
          This request will be closed and Finasto will not process it. You can
          always make a new request later.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            aria-busy={isPending}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-5 font-sans text-[14px] font-medium text-white transition-colors hover:bg-copper/90 disabled:cursor-not-allowed disabled:bg-disabled"
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Cancel request
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper disabled:opacity-50"
          >
            Keep request
          </button>
        </div>
      </Modal>
    </>
  );
}
