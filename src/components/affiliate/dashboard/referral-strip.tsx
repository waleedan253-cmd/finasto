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
    <div className="relative isolate flex flex-wrap items-center gap-x-5 gap-y-3 overflow-hidden rounded-2xl border border-aff-border bg-gradient-to-b from-aff-ivory to-white px-4 py-3.5 shadow-[0_6px_16px_-12px_rgba(3,24,7,0.3)] sm:px-5">
      {/* thin gold line on top, same as the other cards */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-600 opacity-70"
      />
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-aff-green-900 text-aff-gold-300 ring-1 ring-aff-gold-500/40">
            <Link2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="font-sans text-[13px] font-semibold text-aff-green-900">
            Your referral link
          </p>
          <p className="mt-0.5 flex items-center gap-2 font-sans text-[12px] text-aff-muted">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                link.isActive
                  ? "bg-[#2F9E6B] ring-2 ring-[#2F9E6B]/20"
                  : "bg-[#C8553D] ring-2 ring-[#C8553D]/20"
              }`}
            />
            {link.isActive
              ? "Orders placed through it are credited to you."
              : "Your account is not active, so orders are not credited."}
          </p>
        </div>
      </div>

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-aff-gold-500/40 bg-aff-ivory p-1.5 transition-all focus-within:border-aff-gold-600 focus-within:ring-4 focus-within:ring-aff-gold-500/20">
        <input
          readOnly
          value={link.url}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.currentTarget.select()}
          aria-label="Your referral link"
          className="min-w-0 flex-1 truncate bg-transparent px-3 font-sans text-[13px] font-medium text-aff-green-900 outline-none"
        />
        <motion.button
          type="button"
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
          className={`inline-flex h-11 min-w-[96px] shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg px-5 font-sans text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aff-gold-600 ${
            copied
              ? "bg-aff-gold-300 text-aff-green-950 ring-1 ring-aff-gold-600/40"
              : "bg-aff-green-900 text-aff-cream-50 ring-1 ring-aff-gold-500/40 active:bg-aff-green-800 [@media(hover:hover)]:hover:bg-aff-green-800"
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
