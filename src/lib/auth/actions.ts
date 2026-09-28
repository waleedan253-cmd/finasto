"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isRole, portalEnabled, roleHome } from "./roles";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
});

const GENERIC = "Invalid email or password.";

// Only same-site relative paths (blocks open redirects like //evil.com)
function safeNext(next?: string): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\"))
    return null;
  return next;
}

export async function signInAction(
  input: unknown,
): Promise<{ error: string } | void> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: GENERIC };
  const { email, password, next } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) return { error: GENERIC };

  const role = data.user.app_metadata?.role;
  if (!isRole(role) || !portalEnabled[role]) {
    await supabase.auth.signOut();
    return { error: GENERIC };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();
  if (profile?.status !== "active") {
    await supabase.auth.signOut();
    return { error: GENERIC };
  }

  const target = safeNext(next);
  // Only honour `next` if it belongs to this role's area
  redirect(
    target && target.startsWith(roleHome[role]) ? target : roleHome[role],
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
