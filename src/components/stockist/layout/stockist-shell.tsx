"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { StockistSidebar } from "./stockist-sidebar";
import { stockistNav, isNavActive } from "./stockist-nav";

// import { StockistNotificationBell } from "./notification-bell";
import { ThemeToggle } from "@/components/ThemeToggle";

// Same layout as admin-shell.tsx: fixed 260px sidebar on desktop, a
// slide-in drawer with overlay on mobile, and a sticky top bar showing
// the current page title, the currency menu and the signed-in user.

export function StockistShell({
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
    stockistNav.find((i) => isNavActive(pathname, i.href))?.label ?? "Stockist";
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
          className="fixed inset-0 z-40 bg-espresso-deep/45 lg:hidden"
        />
      )}

      <aside
        id="stockist-sidebar"
        aria-label="Stockist navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border bg-cream transition-[transform,width] duration-300 ease-out lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-[260px]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <StockistSidebar
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
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-border bg-cream/80 px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-controls="stockist-sidebar"
              aria-expanded={open}
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-espresso lg:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={1.6} />
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-warm-gray transition-colors hover:bg-espresso/5 hover:text-espresso lg:inline-flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" strokeWidth={1.6} />
              ) : (
                <PanelLeftClose className="h-5 w-5" strokeWidth={1.6} />
              )}
            </button>
            <div className="min-w-0">
              <p className="hidden font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-copper sm:block">
                Stockist
              </p>
              <h1 className="truncate font-display text-[22px] leading-tight tracking-tight text-espresso">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {/* <StockistNotificationBell /> */}

            <span
              aria-hidden
              className="mx-1 hidden h-6 w-px bg-border sm:block"
            />

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-copper-light to-copper font-sans text-[12px] font-semibold text-espresso-deep ring-2 ring-copper/30">
                {initials}
              </div>
              <div className="hidden min-w-0 md:block">
                <p className="max-w-[160px] truncate font-sans text-[13px] leading-tight text-espresso">
                  {name || "Stockist"}
                </p>
                <p className="max-w-[160px] truncate font-sans text-[11px] leading-tight text-warm-gray">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {needsProfile ? (
            <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8 text-center">
              <h1 className="font-display text-[22px] leading-tight text-espresso">
                Complete your profile
              </h1>
              <p className="mt-3 font-sans text-[14px] leading-relaxed text-warm-gray">
                Add your username, phone number and country first. Your country
                decides the currency your prices are shown in.
              </p>
              <Link
                href="/stockist/settings"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
              >
                Go to Settings
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
