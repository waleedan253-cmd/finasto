import {
  LayoutDashboard,
  Link2,
  ShoppingBag,
  Wallet,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";

// Single source of truth for the affiliate sidebar AND the top-bar title
// (affiliate-shell.tsx looks the current page up here), same pattern as
// admin-nav.ts. Order = build priority.

export type AffiliateNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const affiliateNav: AffiliateNavItem[] = [
  { label: "Dashboard", href: "/affiliate", icon: LayoutDashboard },
  { label: "Referral Links", href: "/affiliate/links", icon: Link2 },
  { label: "Orders", href: "/affiliate/orders", icon: ShoppingBag },
  { label: "Payout Requests", href: "/affiliate/payouts", icon: Wallet },
  { label: "Accounts", href: "/affiliate/accounts", icon: Receipt },
  { label: "Settings", href: "/affiliate/settings", icon: Settings },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/affiliate") return pathname === "/affiliate";
  return pathname === href || pathname.startsWith(href + "/");
}
