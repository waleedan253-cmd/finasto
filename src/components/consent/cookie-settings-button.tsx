"use client";

import { Cookie } from "lucide-react";
import { useConsent } from "@/components/consent/consent-provider";

export function CookieSettingsButton() {
  const { setOpen } = useConsent();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-2 rounded-full border border-copper/60 bg-gradient-to-br from-green-deep to-green px-5 py-2.5 font-sans text-[14px] font-medium text-cream shadow-[0_12px_28px_-12px_rgba(35,77,42,0.9)] transition-colors duration-200 hover:from-green hover:to-green-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
    >
      <Cookie
        className="h-4 w-4 text-copper-light"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      Cookie settings
    </button>
  );
}