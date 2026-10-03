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
  type LucideIcon,
  Megaphone,
} from "lucide-react";

export type AdminNavItem = { label: string; href: string; icon: LucideIcon };

export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Stockists", href: "/admin/stockists", icon: Store },
  { label: "Affiliates", href: "/admin/affiliates", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Commissions & Payouts", href: "/admin/payouts", icon: Wallet },
  { label: "Requests", href: "/admin/requests", icon: Inbox },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Announcement", href: "/admin/announcement", icon: Megaphone },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}
