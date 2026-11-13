"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AffiliateSidebar } from "./affiliate-sidebar";
import { affiliateNav, isNavActive } from "./affiliate-nav";

import { AffiliateNotificationBell } from "./notification-bell";
import { ThemeToggle } from "@/components/ThemeToggle";

// Fixed 260px sidebar on desktop (76px collapsed), a slide-in drawer with
// overlay on mobile, and a sticky top bar with the page title, theme
// toggle, notifications and the signed-in user.

export function AffiliateShell({
  name,
  email,
  profileLocked,
  children,
}: {
  name: string | null;
  email: string;
  profileLocked: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  // Until username, phone and country are saved, only Settings is usable.
  const needsProfile =
    !profileLocked && !pathname.startsWith("/affiliate/settings");
  const title =
    affiliateNav.find((i) => isNavActive(pathname, i.href))?.label ??
    "Affiliate";
  const initials = (name || email || "A").trim().slice(0, 2).toUpperCase();

  // Escape closes the drawer; the page behind it can't scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="relative min-h-screen bg-cream dark:bg-cream-soft">
      <div
        aria-hidden
        className="dark-glow pointer-events-none fixed -bottom-40 -right-40 z-0 h-[520px] w-[520px] rounded-full"
      />
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
                    className="fixed inset-0 z-40 animate-[fadeIn_0.2s_ease-out] bg-espresso-deep/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        id="affiliate-sidebar"
        aria-label="Affiliate navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] overflow-hidden border-r border-copper/25 bg-[radial-gradient(ellipse_at_top,#1d4a26_0%,#0d2612_45%,#06140a_100%)] transition-[transform,width] duration-300 ease-out lg:translate-x-0 lg:shadow-none",
          open && "shadow-[0_0_60px_-10px_rgba(16,38,15,0.45)]",
          collapsed ? "lg:w-[76px]" : "lg:w-[260px]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AffiliateSidebar
          onNavigate={() => setOpen(false)}
          collapsed={collapsed}
        />
      </aside>
      <div
        className={cn(
          "transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]",
        )}
      >
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-border bg-cream/85 px-4 shadow-[0_1px_0_0_rgba(201,128,63,0.18)] backdrop-blur-xl backdrop-saturate-150 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-controls="affiliate-sidebar"
              aria-expanded={open}
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-xl text-espresso transition-colors active:bg-espresso/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper lg:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={1.6} />
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-warm-gray transition-colors active:bg-espresso/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper [@media(hover:hover)]:hover:bg-espresso/5 [@media(hover:hover)]:hover:text-espresso lg:inline-flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" strokeWidth={1.6} />
              ) : (
                <PanelLeftClose className="h-5 w-5" strokeWidth={1.6} />
              )}
            </button>
            <div className="min-w-0">
              <p className="hidden font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-copper sm:block">
                Affiliate
              </p>
              {/* <h1 className="truncate font-display text-[20px] font-semibold leading-tight tracking-tight text-espresso sm:text-[22px]">
                {title}
              </h1> */}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <AffiliateNotificationBell />

            <span
              aria-hidden
              className="mx-1 hidden h-6 w-px bg-border sm:block"
            />

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-deep to-green font-sans text-[12px] font-semibold text-cream ring-2 ring-copper/50 ring-offset-2 ring-offset-cream">
                {initials}
              </div>
              <div className="hidden min-w-0 md:block">
                <p className="max-w-[160px] truncate font-sans text-[13px] leading-tight text-espresso">
                  {name || "Affiliate"}
                </p>
                <p className="max-w-[160px] truncate font-sans text-[11px] leading-tight text-warm-gray">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 p-3 sm:p-6 lg:p-8">
          {needsProfile ? (
            <div className="finasto-card relative mx-auto mt-4 max-w-md overflow-hidden p-6 text-center sm:mt-8 sm:p-8">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-copper via-copper-light to-copper"
              />
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-deep to-green text-cream ring-2 ring-copper/50 ring-offset-2 ring-offset-cream">
                <UserRound
                  className="h-5 w-5"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>
              <h1 className="mt-4 font-display text-[22px] font-semibold leading-tight text-espresso">
                Complete your profile
              </h1>
              <p className="mt-3 font-sans text-[14px] leading-relaxed text-warm-gray">
                Add your username, phone number and country first. Your country
                decides the currency your prices are shown in.
              </p>
              <Link
                href="/affiliate/settings"
                className="group mt-6 inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-full border border-copper/60 bg-gradient-to-br from-green-deep to-green px-6 font-sans text-[14px] font-medium text-cream shadow-[0_12px_28px_-12px_rgba(35,77,42,0.9)] transition-all duration-200 active:scale-[0.97] active:from-green active:to-green-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:from-green [@media(hover:hover)]:hover:to-green-deep"
              >
                Go to Settings
                <ArrowRight
                  className="h-4 w-4 text-copper-light transition-transform duration-200 group-active:translate-x-1"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
