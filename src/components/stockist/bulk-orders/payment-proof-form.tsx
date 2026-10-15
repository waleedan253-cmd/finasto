"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Input, message } from "antd";
import { FileUp, Loader2, X } from "lucide-react";
import { submitBulkPaymentProof } from "@/lib/stockist/bulk-orders-actions";

// Upload the proof of payment for an order that is waiting for payment.
// The browser only does a quick check (size and type) so the stockist gets
// an instant message; the server checks the file again from its real
// content, so these checks are a convenience, not the protection.

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PaymentProofForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setError(null);

    if (!picked) {
      setFile(null);
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("The file is too large (5 MB at most).");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (picked.type && !ALLOWED_TYPES.has(picked.type)) {
      setError("Upload a JPG, PNG, WebP or PDF file.");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(picked);
  }

  function clearFile() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSubmit() {
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("reference", reference.trim());
    formData.set("file", file);

    startTransition(async () => {
      const result = await submitBulkPaymentProof(formData);
      if (result.success) {
        message.success("Proof of payment sent");
        router.refresh(); // the page now shows "Checking payment"
        return;
      }
      setError(result.error);
    });
  }

  return (
    <div>
      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError(null)}
          className="mb-3"
        />
      )}

      <label
        htmlFor="proof-file"
        className="mb-1 block font-sans text-[13px] text-warm-gray"
      >
        Proof of payment (JPG, PNG, WebP or PDF, up to 5 MB)
      </label>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-strong px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-sans text-[14px] text-espresso">
              {file.name}
            </p>
            <p className="font-sans text-[12px] text-warm-gray">
              {formatSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            disabled={isPending}
            aria-label="Remove the selected file"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-strong text-warm-gray transition-colors hover:border-copper hover:text-copper disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-6 font-sans text-[14px] text-warm-gray transition-colors hover:border-copper hover:text-copper disabled:opacity-50"
        >
          <FileUp className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
          Choose a file
        </button>
      )}

      <input
        id="proof-file"
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handlePick}
        className="sr-only"
        tabIndex={-1}
      />

      <label
        htmlFor="proof-reference"
        className="mt-4 mb-1 block font-sans text-[13px] text-warm-gray"
      >
        Payment reference (optional)
      </label>
      <Input
        id="proof-reference"
        size="large"
        maxLength={100}
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Transaction ID or reference number"
        disabled={isPending}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isPending}
        aria-busy={isPending}
        className="mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled sm:w-auto"
      >
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        Send proof of payment
      </button>
    </div>
  );
}
