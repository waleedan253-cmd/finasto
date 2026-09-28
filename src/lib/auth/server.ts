import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isRole, roleHome, type Role } from "./roles";

export type AuthContext = { user: User; role: Role; name: string | null };

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  // getUser() verifies the token with Supabase. Never trust getSession() on the server.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const role = data.user.app_metadata?.role;
  if (!isRole(role)) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, status")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.status !== "active") return null;

  return { user: data.user, role, name: profile.name ?? null };
});

export async function requireRole(required: Role): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== required) redirect(roleHome[ctx.role]);
  return ctx;
}
