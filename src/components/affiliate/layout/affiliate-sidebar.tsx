"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth/actions";
import { affiliateNav, isNavActive } from "./affiliate-nav";

// Same structure and styling as admin-sidebar.tsx: logo on the left,
// nav list, sign out pinned to the bottom. onNavigate closes the mobile
// drawer when a link (or the close button) is tapped.

export function AffiliateSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
        <Link
          href="/affiliate"
          onClick={onNavigate}
          aria-label="Finasto affiliate home"
        >
          <Image
            src="/brand/finasto-logo.png"
            alt="Finasto"
            width={120}
            height={90}
            priority
            className="h-11 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close menu"
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-espresso/70 hover:text-espresso lg:hidden"
        >
          <X className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </div>

      <nav aria-label="Affiliate" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {affiliateNav.map(({ label, href, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-[14px] transition-colors",
                    active
                      ? "bg-espresso text-cream"
                      : "text-espresso/80 hover:bg-espresso/5 hover:text-espresso",
                  )}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.6}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-[14px] text-espresso/80 transition-colors hover:bg-espresso/5 hover:text-espresso"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
