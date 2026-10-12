import { NextResponse, type NextRequest } from "next/server";
import { resolveReferralCode } from "@/lib/affiliate/referral-resolve";

// Public route: /r/<code>
//
// 1. Look the affiliate's code up (the affiliate must be active).
// 2. Valid   -> save it in the finasto_ref cookie (the one checkout
//               already reads), then redirect to the shop.
// 3. Invalid -> redirect to the shop, no cookie, no error shown.
//
// Same rules as the existing ?ref= system in middleware.ts: first click
// wins, and the cookie lasts one year.

const SHOP_PATH = "/shop";
const REFERRAL_COOKIE = "finasto_ref"; // must match lib/referral/referral-cookie.ts
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const resolved = await resolveReferralCode(code);

  if (!resolved) {
    return NextResponse.redirect(new URL(SHOP_PATH, request.url));
  }

  const response = NextResponse.redirect(new URL(SHOP_PATH, request.url));

  // First-click-wins: never replace an existing referral.
  if (!request.cookies.has(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, resolved.referralCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
    });
  }

  return response;
}
