"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Modal, Select, message } from "antd";
import { Check, Copy, Link2, Loader2, PackageCheck } from "lucide-react";
import { createMyLink } from "@/lib/affiliate/links-actions";
import type { LinkableProduct } from "@/lib/affiliate/links-queries";

// Two steps in one modal:
//   1. Pick a product (searchable) and press Generate.
//   2. The new link is shown with a Copy button, ready to share.
//
// The picker only receives products the affiliate has no live link for,
// so a product can't be chosen twice. The server re-checks everything.

type Generated = { url: string; productName: string };

export function GenerateLinkDialog({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: LinkableProduct[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [productId, setProductId] = useState<string | undefined>();
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Start fresh every time the modal opens.
  useEffect(() => {
    if (open) {
      setProductId(undefined);
      setGenerated(null);
      setError(null);
      setCopied(false);
    }
  }, [open]);

  function handleGenerate() {
    if (!productId) return;
    setError(null);

    const product = products.find((p) => p.id === productId);

    startTransition(async () => {
      const result = await createMyLink(productId);
      if (result.success) {
        setGenerated({
          url: result.link.url,
          productName: product?.name ?? "your product",
        });
        router.refresh(); // the list behind the modal gets the new link
      } else {
        setError(result.error);
      }
    });
  }

  async function handleCopy() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.url);
      setCopied(true);
      message.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error(
        "Couldn't copy automatically. Select the link and copy it.",
      );
    }
  }

  const closeable = !isPending;

  return (
    <Modal
      open={open}
      onCancel={() => closeable && onClose()}
      footer={null}
      closable={closeable}
      maskClosable={closeable}
      centered
      width={440}
      styles={{
        container: { borderRadius: 16, padding: 24 },
      }}
    >
      {generated ? (
        /* ───────────── Step 2: the link is ready ───────────── */
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-bg text-green">
            <Check className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </span>

          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            Your link is ready
          </h2>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
            Share this link for “{generated.productName}”. It stays valid until
            you delete it.
          </p>

          <div className="mt-4 flex gap-2">
            <Input
              readOnly
              size="large"
              value={generated.url}
              onFocus={(e) => e.target.select()}
              aria-label="Your referral link"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-espresso px-4 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper"
          >
            Done
          </button>
        </>
      ) : products.length === 0 ? (
        /* ───────── Nothing left to link ───────── */
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-warm-gray">
            <PackageCheck
              className="h-5 w-5"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </span>
          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            No products left to link
          </h2>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
            You already have a link for every available product. To get a new
            link for a product, delete its current link first.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper"
          >
            Close
          </button>
        </>
      ) : (
        /* ───────────── Step 1: choose a product ───────────── */
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <Link2 className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>

          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            Generate a referral link
          </h2>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
            Choose a product. Visitors who open your link land on that
            product&apos;s page.
          </p>

          <label
            htmlFor="link-product"
            className="mt-4 mb-1 block font-sans text-[13px] text-warm-gray"
          >
            Product
          </label>
          <Select
            id="link-product"
            size="large"
            showSearch
            optionFilterProp="label"
            placeholder="Search and choose a product"
            value={productId}
            onChange={(value) => setProductId(value)}
            disabled={isPending}
            style={{ width: "100%" }}
            options={products.map((p) => ({
              value: p.id,
              label: p.name,
              product: p,
            }))}
            optionRender={(option) => {
              const p = (option.data as { product: LinkableProduct }).product;
              return (
                <div className="flex items-center gap-3 py-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-md border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[14px] text-espresso">
                      {p.name}
                    </p>
                    {p.category && (
                      <p className="truncate font-sans text-[12px] text-warm-gray">
                        {p.category}
                      </p>
                    )}
                  </div>
                </div>
              );
            }}
          />

          {error && (
            <div className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isPending || !productId}
              aria-busy={isPending}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Generate link
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
