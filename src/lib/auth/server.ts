// import "server-only";
// import { cache } from "react";
// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import { isRole, roleHome, type Role } from "./roles";

// export type AuthContext = {
//   user: { id: string; email: string | null };
//   role: Role;
//   name: string | null;
// };

// export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
//   const t0 = Date.now();
//   const supabase = await createClient();

//   // Verifies the JWT signature locally. No Supabase Auth network call.
//   const { data, error } = await supabase.auth.getClaims();
//   console.log("[auth] getClaims", Date.now() - t0, "ms");

//   const claims = data?.claims;
//   if (error || !claims) return null;

//   const role = claims.app_metadata?.role;
//   if (!isRole(role)) return null;

//   const t1 = Date.now();
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("name, status")
//     .eq("id", claims.sub)
//     .single();
//   console.log("[auth] profiles", Date.now() - t1, "ms");

//   if (!profile || profile.status !== "active") return null;

//   return {
//     user: { id: claims.sub, email: claims.email ?? null },
//     role,
//     name: profile.name ?? null,
//   };
// });

// export async function requireRole(required: Role): Promise<AuthContext> {
//   const ctx = await getAuthContext();
//   if (!ctx) redirect("/login");
//   if (ctx.role !== required) redirect(roleHome[ctx.role]);
//   return ctx;
// }
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRole, roleHome, type Role } from "./roles";

export type AuthContext = {
  user: { id: string; email: string | null };
  role: Role;
  name: string | null;
};

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const t0 = Date.now();
  const supabase = await createClient();

  // Verifies the JWT signature locally. No Supabase Auth network call.
  const { data, error } = await supabase.auth.getClaims();
  console.log("[auth] getClaims", Date.now() - t0, "ms");

  const claims = data?.claims;
  if (error || !claims) return null;

  const role = claims.app_metadata?.role;
  if (!isRole(role)) return null;

  return {
    user: { id: claims.sub, email: claims.email ?? null },
    role,
    name: (claims.user_metadata?.name as string | undefined) ?? null,
  };
});

export async function requireRole(required: Role): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== required) redirect(roleHome[ctx.role]);
  return ctx;
}
