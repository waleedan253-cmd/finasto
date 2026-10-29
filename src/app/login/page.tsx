import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/server";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin Sign in — Finasto",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in as admin: skip the form
  const ctx = await getAuthContext();
  if (ctx?.role === "admin") redirect("/admin");

  return <AdminLoginForm />;
}