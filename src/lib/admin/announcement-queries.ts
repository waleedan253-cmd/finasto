// Reads for announcements. Two audiences, two functions:
//  - listAnnouncements(): admin table, re-checks requireRole("admin") and
//    uses the cookie client so the admin RLS policy returns ALL rows.
//  - getLiveAnnouncements(): storefront bar, no login needed. Uses a plain
//    anon client (no cookies) so it can be cached and does not force every
//    page to render dynamically. RLS returns only live rows.

import { unstable_cache } from "next/cache";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const MISSING_CODES = new Set(["PGRST205", "42P01"]);

function isMissingTable(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

export const ANNOUNCEMENTS_TAG = "announcements";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type AnnouncementItem = {
  id: string;
  message: string;
  link: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
};

export type LiveAnnouncement = {
  id: string;
  message: string;
  link: string | null;
};

/* ------------------------------------------------------------------ */
/* Admin list                                                           */
/* ------------------------------------------------------------------ */

export async function listAnnouncements(): Promise<AnnouncementItem[]> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("id, message, link, is_active, starts_at, ends_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) return [];
    throw new Error(`Failed to load announcements: ${error.message}`);
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    message: r.message,
    link: r.link,
    isActive: !!r.is_active,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    createdAt: r.created_at,
  }));
}

/* ------------------------------------------------------------------ */
/* Storefront (public, cached)                                          */
/* ------------------------------------------------------------------ */

export const getLiveAnnouncements = unstable_cache(
  async (): Promise<LiveAnnouncement[]> => {
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // No filters needed: the RLS policy already limits rows to
    // active + inside the start/end window.
    const { data, error } = await supabase
      .from("announcements")
      .select("id, message, link")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingTable(error)) return [];
      throw new Error(`Failed to load announcements: ${error.message}`);
    }
    return data ?? [];
  },
  ["live-announcements"],
  // Tag = instant refresh when admin saves. 60s = safety net so a message
  // whose start/end time passes on its own still appears/disappears.
  { tags: [ANNOUNCEMENTS_TAG], revalidate: 60 },
);
