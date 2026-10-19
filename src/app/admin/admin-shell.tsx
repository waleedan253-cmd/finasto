"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./admin-sidebar";
import { CurrencyMenu } from "./currency-menu";
import { adminNav, isNavActive } from "./admin-nav";
import { NotificationBell } from "@/components/admin/layout/notification-bell";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string | null;
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const title =
    adminNav.find((i) => isNavActive(pathname, i.href))?.label ?? "Admin";
  const initials = (name || email || "A").trim().slice(0, 2).toUpperCase();

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
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border bg-cream transition-transform duration-300 ease-out lg:w-[260px] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AdminSidebar onNavigate={() => setOpen(false)} />
      </aside>

      <div className="relative z-10 lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-border bg-cream/80 px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-controls="admin-sidebar"
              aria-expanded={open}
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-espresso lg:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={1.6} />
            </button>
            <div className="min-w-0">
              <p className="hidden font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-copper sm:block">
                Admin
              </p>
              <h1 className="truncate font-display text-[22px] leading-tight tracking-tight text-espresso">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <CurrencyMenu />
            <NotificationBell />
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
                  {name || "Admin"}
                </p>
                <p className="max-w-[160px] truncate font-sans text-[11px] leading-tight text-warm-gray">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
