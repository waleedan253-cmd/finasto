import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Wallet,
  Inbox,
  Boxes,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { label: string; href: string; icon: LucideIcon };

export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Affiliates", href: "/admin/affiliates", icon: Users },
  { label: "Stockists", href: "/admin/stockists", icon: Store },
  { label: "Commissions & Payouts", href: "/admin/payouts", icon: Wallet },
  { label: "Requests", href: "/admin/requests", icon: Inbox },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}
