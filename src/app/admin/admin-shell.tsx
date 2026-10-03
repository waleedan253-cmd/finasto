"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./admin-sidebar";
import { CurrencyMenu } from "./currency-menu";
import { adminNav, isNavActive } from "./admin-nav";
import { NotificationBell } from "@/components/admin/layout/notification-bell";

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
    <div className="min-h-screen bg-[#F5F1EB]">
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

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-cream/95 px-4 backdrop-blur-sm sm:px-6">
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
            <span className="truncate font-display text-[20px] text-espresso">
              {title}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <CurrencyMenu />
            <NotificationBell />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso font-sans text-[12px] font-medium text-cream">
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
