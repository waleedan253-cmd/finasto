import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email link types this route accepts. Anything else is rejected.
// "recovery" = forgot password, "invite" = new stockist/affiliate invite.
const ALLOWED_TYPES = ["recovery", "invite"] as const;

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  // Old reset emails have no type in the link, so they default to recovery.
  const rawType = request.nextUrl.searchParams.get("type") ?? "recovery";
  const type = ALLOWED_TYPES.find((t) => t === rawType);

  const url = request.nextUrl.clone();
  url.search = "";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      // Both flows end on the same page: the user now has a session and
      // must choose a password. ?invited=1 lets the page say "Set your
      // password" instead of "Reset your password" if you want that.
      url.pathname = "/reset-password";
      if (type === "invite") url.search = "?invited=1";
      return NextResponse.redirect(url);
    }
  }

  url.pathname = "/forgot-password";
  url.search = "?error=expired";
  return NextResponse.redirect(url);
}

// This will intratla

// <h2>You've been invited</h2>
// <p>You've been invited to create an account. Follow the link below to accept.</p>
// <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">Accept invitation</a></p>
