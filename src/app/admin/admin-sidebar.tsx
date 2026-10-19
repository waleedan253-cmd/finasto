"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth/actions";
import { adminNav, isNavActive } from "./admin-nav";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="Finasto admin home"
        >
          <Image
            src="/brand/finasto-logo.png"
            alt="Finasto"
            width={120}
            height={90}
            priority
            className="h-11 w-auto dark:hidden"
          />
          <Image
            src="/brand/finasto-logo-dark.png"
            alt="Finasto"
            width={120}
            height={90}
            priority
            className="hidden h-11 w-auto dark:block"
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

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {adminNav.map(({ label, href, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] transition-all duration-200",
                    active
                      ? "bg-copper/10 font-medium text-espresso dark:bg-green/15 dark:ring-1 dark:ring-green/25"
                      : "text-warm-gray hover:bg-espresso/5 hover:text-espresso dark:hover:bg-green/10",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-copper"
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      active ? "text-copper" : "group-hover:text-copper",
                    )}
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
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] text-warm-gray transition-colors hover:bg-red/10 hover:text-red"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
