import { LayoutDashboard, type LucideIcon, MessageCircle } from "lucide-react";

// Single source of truth for the affiliate sidebar AND the top-bar title
// (affiliate-shell.tsx looks the current page up here), same pattern as
// admin-nav.ts. Order = build priority.

export type StockistNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const stockistNav: StockistNavItem[] = [
  { label: "Dashboard", href: "/stockist", icon: LayoutDashboard },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/stockist") return pathname === "/stockist";
  return pathname === href || pathname.startsWith(href + "/");
}
