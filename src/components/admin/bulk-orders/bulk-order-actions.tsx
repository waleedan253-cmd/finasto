"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Modal, message } from "antd";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BulkOrderDetail } from "@/lib/admin/bulk-order-queries";
import {
  approveBulkPayment,
  cancelBulkOrder,
  quoteBulkOrder,
  rejectBulkOrder,
  returnBulkPayment,
  type ActionResult,
} from "@/lib/admin/bulk-order-actions";

// The buttons for one bulk order, plus one confirmation modal per action.
// Which buttons show depends on the status, matching what the database
// allows. The database re-checks everything, so a stale page can never
// force a wrong change: it only shows the database's message instead.
//
// Every modal says in plain words WHAT WILL HAPPEN (especially to stock)
// before the admin confirms.

type DialogKind = "quote" | "reject" | "return" | "approve" | "cancel";

type DialogConfig = {
  title: string;
  description: string;
  noteLabel: string;
  noteRequired: boolean;
  noteRequiredMessage: string;
  submitLabel: string;
  danger: boolean;
  success: string;
};

function dialogConfig(kind: DialogKind, order: BulkOrderDetail): DialogConfig {
  const units = order.items.reduce((sum, i) => sum + i.quantity, 0);

  switch (kind) {
    case "quote":
      return {
        title: "Send bank details",
        description: `This reserves ${units} units of shop stock for ${order.numberLabel} and shows these bank details to ${order.stockistName}. If any pack is short on stock, nothing is changed and you will see which one.`,
        noteLabel: "Message to the stockist (optional)",
        noteRequired: false,
        noteRequiredMessage: "",
        submitLabel: "Send & reserve stock",
        danger: false,
        success: "Bank details sent and stock reserved",
      };
    case "reject":
      return {
        title: "Reject this request",
        description: `${order.stockistName} will see your reason. No stock has been reserved yet, so nothing else changes.`,
        noteLabel: "Reason for rejection",
        noteRequired: true,
        noteRequiredMessage: "Please add a short note explaining the rejection",
        submitLabel: "Reject order",
        danger: true,
        success: "Order rejected",
      };
    case "return":
      return {
        title: "Ask for a clearer proof",
        description: `The uploaded proof is cleared and ${order.stockistName} is asked to upload a new one. Shop stock stays reserved.`,
        noteLabel: "What is wrong with the proof?",
        noteRequired: true,
        noteRequiredMessage:
          "Please tell the stockist what is wrong with the proof",
        submitLabel: "Return to stockist",
        danger: false,
        success: "Returned to the stockist",
      };
    case "approve":
      return {
        title: "Approve payment",
        description: `Confirm the money has reached your bank account. ${units} units are then added to ${order.stockistName}'s stock. This cannot be undone.`,
        noteLabel: "Note (optional)",
        noteRequired: false,
        noteRequiredMessage: "",
        submitLabel: "Approve payment",
        danger: false,
        success: "Payment approved and stock added",
      };
    case "cancel":
      return {
        title: "Cancel this order",
        description: `The ${units} reserved units are put back into shop stock. ${order.stockistName} will see your reason.`,
        noteLabel: "Reason for cancelling",
        noteRequired: true,
        noteRequiredMessage:
          "Please add a short note explaining the cancellation",
        submitLabel: "Cancel order",
        danger: true,
        success: "Order cancelled and stock released",
      };
  }
}

async function execute(
  kind: DialogKind,
  order: BulkOrderDetail,
  bank: string,
  note: string,
): Promise<ActionResult> {
  const trimmed = note.trim();
  switch (kind) {
    case "quote":
      return quoteBulkOrder(order.id, bank, trimmed || null);
    case "reject":
      return rejectBulkOrder(order.id, trimmed);
    case "return":
      return returnBulkPayment(order.id, trimmed);
    case "approve":
      return approveBulkPayment(order.id, trimmed || null);
    case "cancel":
      return cancelBulkOrder(order.id, trimmed);
  }
}

const BTN_BASE =
  "inline-flex h-11 items-center justify-center rounded-full px-5 font-sans text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const BTN_PRIMARY = `${BTN_BASE} bg-espresso text-cream hover:bg-espresso-deep`;
const BTN_SECONDARY = `${BTN_BASE} border border-border-strong text-espresso hover:border-copper`;
const BTN_DANGER_OUTLINE = `${BTN_BASE} border border-copper/40 text-copper hover:bg-copper/10`;

export function BulkOrderActions({ order }: { order: BulkOrderDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [bank, setBank] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openDialog(kind: DialogKind) {
    setBank("");
    setNote("");
    setError(null);
    setDialog(kind);
  }

  function closeDialog() {
    if (!isPending) setDialog(null);
  }

  function submit() {
    if (!dialog) return;
    const cfg = dialogConfig(dialog, order);

    if (dialog === "quote" && bank.trim() === "") {
      setError("Please add the bank details for the stockist");
      return;
    }
    if (cfg.noteRequired && note.trim() === "") {
      setError(cfg.noteRequiredMessage);
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await execute(dialog, order, bank, note);
      if (result.success) {
        messageApi.success(cfg.success);
        setDialog(null);
        router.refresh();
      } else {
        // Keep the modal open so the admin can read the reason
        // (for example "Not enough stock for Velora (100g): 3 left").
        setError(result.error);
      }
    });
  }

  const cfg = dialog ? dialogConfig(dialog, order) : null;

  return (
    <>
      {contextHolder}

      <div className="flex flex-wrap items-center gap-2">
        {order.status === "requested" && (
          <>
            <button
              type="button"
              onClick={() => openDialog("quote")}
              className={BTN_PRIMARY}
            >
              Send bank details
            </button>
            <button
              type="button"
              onClick={() => openDialog("reject")}
              className={BTN_DANGER_OUTLINE}
            >
              Reject
            </button>
          </>
        )}

        {order.status === "awaiting_payment" && (
          <button
            type="button"
            onClick={() => openDialog("cancel")}
            className={BTN_DANGER_OUTLINE}
          >
            Cancel order
          </button>
        )}

        {order.status === "payment_submitted" && (
          <>
            <button
              type="button"
              onClick={() => openDialog("approve")}
              className={BTN_PRIMARY}
            >
              Approve payment
            </button>
            <button
              type="button"
              onClick={() => openDialog("return")}
              className={BTN_SECONDARY}
            >
              Return proof
            </button>
            <button
              type="button"
              onClick={() => openDialog("cancel")}
              className={BTN_DANGER_OUTLINE}
            >
              Cancel order
            </button>
          </>
        )}
      </div>

      <Modal
        open={!!dialog}
        onCancel={closeDialog}
        footer={null}
        closable={!isPending}
        maskClosable={!isPending}
        keyboard={!isPending}
        centered
        width={480}
        // styles={{ content: { borderRadius: 16, padding: 24 } }}
      >
        {dialog && cfg && (
          <>
            <h2 className="font-display text-[22px] leading-tight text-espresso">
              {cfg.title}
            </h2>
            <p className="mt-2 font-sans text-[13px] leading-relaxed text-warm-gray">
              {cfg.description}
            </p>

            <div className="mt-5 flex flex-col gap-4">
              {dialog === "quote" && (
                <div>
                  <label className="mb-1 block font-sans text-[13px] text-warm-gray">
                    Bank details <span className="text-copper">*</span>
                  </label>
                  <Input.TextArea
                    autoFocus
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    rows={5}
                    maxLength={2000}
                    showCount
                    placeholder={
                      "Bank name\nAccount title\nAccount number / IBAN\nSWIFT / routing code\nPayment reference to use"
                    }
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block font-sans text-[13px] text-warm-gray">
                  {cfg.noteLabel}
                  {cfg.noteRequired && <span className="text-copper"> *</span>}
                </label>
                <Input.TextArea
                  autoFocus={dialog !== "quote"}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper"
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={submit}
                disabled={isPending}
                aria-busy={isPending}
                className={cn(
                  BTN_BASE,
                  "flex-1 gap-2",
                  cfg.danger
                    ? "bg-copper text-white hover:bg-copper/90"
                    : "bg-espresso text-cream hover:bg-espresso-deep",
                )}
              >
                {isPending && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {cfg.submitLabel}
              </button>
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                className={cn(BTN_SECONDARY, "flex-1")}
              >
                Back
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
