"use client";

import { useState } from "react";
import { Input, message } from "antd";
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
    <div className="rounded-2xl border border-border p-5 sm:p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
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

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Input
          readOnly
          size="large"
          value={link.url}
          onFocus={(e) => e.target.select()}
          aria-label="Your referral link"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className="mt-4 font-sans text-[12px] leading-relaxed text-warm-gray">
        Your link never expires. The first link a visitor opens is the one
        credited, for up to one year.
      </p>
    </div>
  );
}
