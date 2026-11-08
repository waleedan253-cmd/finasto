"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { usePointerActive } from "@/app/hooks/usePointerActive";

export function ShineCta({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const { bind } = usePointerActive();

  return (
    <Link
      href={href}
      {...bind}
      className="group relative inline-flex h-[54px] items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#F9D976] via-[#E8B84A] to-[#C9952E] px-8 font-sans text-[15px] font-semibold text-[#3B2915] shadow-[0_14px_36px_-10px_rgba(212,175,55,0.55),inset_0_1px_0_0_rgba(255,255,255,0.55)] transition-all data-[active=true]:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-cream [-webkit-tap-highlight-color:transparent]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-data-[active=true]:translate-x-[200%]"
      />
      <span className="relative">{children}</span>
      <ArrowRight
        className="relative h-4 w-4 transition-transform group-data-[active=true]:translate-x-0.5"
        strokeWidth={2}
        aria-hidden="true"
      />
    </Link>
  );
}