import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { AdminShell } from "./admin-shell";

export const metadata: Metadata = {
  title: "Admin — Finasto",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side gate for everything under /admin.
  const { user, name } = await requireRole("admin");
  return (
    <AdminShell name={name} email={user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
