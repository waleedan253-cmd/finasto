import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const url = request.nextUrl.clone();
  url.search = "";

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });
    if (!error) {
      url.pathname = "/reset-password";
      return NextResponse.redirect(url);
    }
  }
  url.pathname = "/forgot-password";
  url.search = "?error=expired";
  return NextResponse.redirect(url);
}
