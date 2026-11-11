"use client";

import { useState } from "react";
import { message } from "antd";
import { Check, Copy, Link2 } from "lucide-react";
import { motion } from "motion/react";
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
      {/* green accent bar on the left edge */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#10260f] via-green to-[#1b4a24]"
      />
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          {/* <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-green/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
          /> */}
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] text-white ring-1 ring-copper/30 shadow-[0_8px_20px_-8px_rgba(16,38,15,0.8)]">
            <Link2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-green-deep">
            Your referral link
          </p>
          <p className="mt-0.5 flex items-center gap-2 font-sans text-[12px] text-warm-gray">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                link.isActive
                  ? "bg-green ring-2 ring-green/20"
                  : "bg-red ring-2 ring-red/20"
              }`}
            />
            {link.isActive
              ? "Orders placed through it are credited to you."
              : "Your account is not active, so orders are not credited."}
          </p>
        </div>
      </div>

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-green/30 bg-green-bg/60 p-1.5 transition-all focus-within:border-green focus-within:ring-4 focus-within:ring-green/15 dark:border-border dark:focus-within:border-green">
        <input
          readOnly
          value={link.url}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.currentTarget.select()}
          aria-label="Your referral link"
          className="min-w-0 flex-1 truncate bg-transparent px-3 font-sans text-[13px] font-medium text-espresso outline-none"
        />
        <motion.button
          type="button"
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
          className={`inline-flex h-11 min-w-[96px] shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg px-5 font-sans text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
            copied
              ? "bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] text-white ring-1 ring-copper/40 shadow-[0_8px_20px_-8px_rgba(16,38,15,0.8)]"
              : "bg-gradient-to-br from-green-deep to-green text-cream ring-1 ring-copper/40 active:from-green active:to-green-deep [@media(hover:hover)]:hover:from-green [@media(hover:hover)]:hover:to-green-deep"
          }`}
        >
          <motion.span
            key={copied ? "copied" : "copy"}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="flex"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </motion.span>
          <span>{copied ? "Copied" : "Copy"}</span>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Referral link copied to clipboard" : ""}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
