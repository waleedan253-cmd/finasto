"use client";

import { useState } from "react";
import { message } from "antd";
import { Check, Copy, Link2 } from "lucide-react";
import type { MyReferralLink } from "@/lib/affiliate/referral-link-queries";

export function ReferralStrip({ link }: { link: MyReferralLink }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error(
        "Couldn't copy automatically. Select the link and copy it.",
      );
    }
  }

  return (
    <div className="finasto-card flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
          <Link2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
            Your referral link
          </p>
          <p className="mt-0.5 font-sans text-[12px] text-warm-gray">
            {link.isActive
              ? "Orders placed through it are credited to you."
              : "Your account is not active, so orders are not credited."}
          </p>
        </div>
      </div>

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border-strong bg-cream p-1 transition-colors focus-within:border-copper dark:border-border dark:focus-within:border-copper">
        <input
          readOnly
          value={link.url}
          onFocus={(e) => e.target.select()}
          aria-label="Your referral link"
          className="min-w-0 flex-1 bg-transparent px-3 font-sans text-[13px] text-espresso outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 font-sans text-[13px] font-medium transition-colors ${
            copied
              ? "bg-green text-espresso-deep"
              : "bg-espresso text-cream hover:bg-espresso-deep"
          }`}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
