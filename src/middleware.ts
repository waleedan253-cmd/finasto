import type { NextRequest } from "next/server";
import { updateSession } from "../src/lib/supabase/middleware";

// Lifetime attribution, first-click-wins: only set the cookie if the
// visitor doesn't already have one. A later affiliate link in the same
// browser never overrides an earlier referral.
const REFERRAL_COOKIE = "finasto_ref";
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && !request.cookies.has(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, ref, {
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}
