import {
  Boxes,
  LayoutDashboard,
  type LucideIcon,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  UserPlus,
  Warehouse,
} from "lucide-react";

// Single source of truth for the stockist sidebar AND the top-bar title
// (stockist-shell.tsx looks the current page up here), same pattern as
// admin-nav.ts. Order = what the stockist uses most, top to bottom.

export type StockistNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const stockistNav: StockistNavItem[] = [
  { label: "Dashboard", href: "/stockist", icon: LayoutDashboard },
  { label: "Products", href: "/stockist/products", icon: Package },
  { label: "Bulk Orders", href: "/stockist/bulk-orders", icon: Boxes },
  { label: "Inventory", href: "/stockist/inventory", icon: Warehouse },
  { label: "Orders", href: "/stockist/orders", icon: ShoppingBag },
  {
    label: "Affiliate Requests",
    href: "/stockist/affiliate-requests",
    icon: UserPlus,
  },
  { label: "Settings", href: "/stockist/settings", icon: Settings },
  { label: "Support", href: "/stockist/support", icon: MessageCircle },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/stockist") return pathname === "/stockist";
  return pathname === href || pathname.startsWith(href + "/");
}
