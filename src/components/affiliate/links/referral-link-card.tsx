"use client";

import { useState } from "react";
import { message } from "antd";
import { Check, Copy, Link2 } from "lucide-react";
import type { MyReferralLink } from "@/lib/affiliate/referral-link-queries";

// The affiliate's one referral link, with a Copy button. Read-only: the
// link comes from the server page (getMyReferralLink) and never changes,
// so there is no create, delete or refresh logic here.

export function ReferralLinkCard({ link }: { link: MyReferralLink }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      message.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error(
        "Couldn't copy automatically. Select the link and copy it.",
      );
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] dark:border-border dark:shadow-none sm:p-7">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-copper/10 text-copper">
        <Link2 className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </span>

      <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
        Your referral link
      </h2>
      <p className="mt-2 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Share this one link anywhere. Anyone who opens it and orders is credited
        to you, whichever product they buy.
      </p>

      {!link.isActive && (
        <div className="mt-4 rounded-xl bg-copper/10 px-4 py-3 font-sans text-[13px] leading-relaxed text-copper">
          Your account is not active right now, so orders through this link are
          not credited to you.
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border-strong bg-cream p-1.5 transition-colors focus-within:border-copper dark:border-border dark:focus-within:border-copper">
        <input
          readOnly
          value={link.url}
          onFocus={(e) => e.target.select()}
          aria-label="Your referral link"
          className="min-w-0 flex-1 bg-transparent px-3 font-sans text-[14px] text-espresso outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 font-sans text-[14px] font-medium transition-colors ${
            copied
              ? "bg-green text-white"
              : "bg-espresso text-cream hover:bg-espresso-deep"
          }`}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className="mt-5 border-t border-border pt-4 font-sans text-[12px] leading-relaxed text-warm-gray">
        Your link never expires. The first link a visitor opens is the one
        credited, for up to one year.
      </p>
    </div>
  );
}
