"use client";

import { useState } from "react";
import { message } from "antd";
import { Check, Copy, Link2, Plus, Trash2 } from "lucide-react";
import type { LinkableProduct, MyLink } from "@/lib/affiliate/links-queries";
import { GenerateLinkDialog } from "@/components/affiliate/links/generate-link-dialog";
import { DeleteLinkDialog } from "@/components/affiliate/links/delete-link-dialog";

// The list of the affiliate's live links, plus the two dialogs.
// Data comes from the server page (listMyLinks + listLinkableProducts);
// after a create or delete the dialogs call router.refresh(), so the new
// props arrive here without any local list state to keep in sync.

// UTC on purpose: the server and the browser must print the same text,
// otherwise React reports a hydration mismatch.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function LinksTable({
  links,
  products,
}: {
  links: MyLink[];
  products: LinkableProduct[];
}) {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<MyLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(link: MyLink) {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      message.success("Link copied");
      setTimeout(() => setCopiedId((id) => (id === link.id ? null : id)), 2000);
    } catch {
      message.error(
        "Couldn't copy automatically. Select the link and copy it.",
      );
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[14px] text-warm-gray">
          {links.length === 0
            ? "No links yet"
            : `${links.length} active ${links.length === 1 ? "link" : "links"}`}
        </p>
        <button
          type="button"
          onClick={() => setGenerateOpen(true)}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Generate link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-border px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <Link2 className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            Create your first link
          </h2>
          <p className="mt-2 max-w-sm font-sans text-[14px] leading-relaxed text-warm-gray">
            Pick a product and get a link to share. Orders placed through it are
            credited to you.
          </p>
          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-strong px-5 font-sans text-[14px] font-medium text-espresso transition-colors hover:border-copper"
          >
            Generate link
          </button>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {links.map((link) => {
            const copied = copiedId === link.id;
            return (
              <li
                key={link.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4"
              >
                {/* Product */}
                <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={link.productImage}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[14px] font-medium text-espresso">
                      {link.productName}
                    </p>
                    <p className="font-sans text-[12px] text-warm-gray">
                      Created {dateFormat.format(new Date(link.createdAt))}
                    </p>
                  </div>
                </div>

                {/* Link */}
                <p
                  className="min-w-0 flex-1 basis-64 truncate font-sans text-[13px] text-warm-gray"
                  title={link.url}
                >
                  {link.url}
                </p>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(link)}
                    aria-label={`Copy link for ${link.productName}`}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-espresso px-4 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkToDelete(link)}
                    aria-label={`Delete link for ${link.productName}`}
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-strong text-warm-gray transition-colors hover:border-copper hover:text-copper"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <GenerateLinkDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        products={products}
      />

      <DeleteLinkDialog
        link={linkToDelete}
        onClose={() => setLinkToDelete(null)}
      />
    </>
  );
}
