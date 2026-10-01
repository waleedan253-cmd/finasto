// import "server-only";
// import { createClient } from "@supabase/supabase-js";

// export function createAdminClient() {
//   return createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     { auth: { autoRefreshToken: false, persistSession: false } },
//   );
// }

import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. Bypasses Row Level Security completely, so it
// must NEVER be imported into a "use client" file, a regular server
// component, or any action that doesn't start with requireRole("admin").
// Used only for things the regular cookie-based client structurally
// cannot do — right now, that's Auth Admin calls like
// inviteUserByEmail(), which create/manage auth.users directly.
//
// The "server-only" import makes any accidental client-side import of
// this file a build error, not just a runtime leak.

let cached: ReturnType<typeof createSupabaseClient> | null = null;

export function createAdminClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — " +
        "the admin client cannot be created.",
    );
  }

  cached = createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
