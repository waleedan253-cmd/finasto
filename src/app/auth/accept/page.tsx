"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // adjust to your browser client helper

// Landing page for invite links sent with Supabase's DEFAULT email
// template. That template puts the session tokens in the URL #hash
// (e.g. /auth/accept#access_token=...&refresh_token=...&type=invite),
// which a server route like /auth/confirm can never see. This page reads
// the hash in the browser, starts the session, then sends the user to
// /reset-password to choose a password.
//
// Dev/testing helper: once custom SMTP is set up and the invite template
// uses {{ .TokenHash }}, point redirectTo back at /auth/confirm.

export default function AcceptInvitePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    const hashError = params.get("error_description");

    if (hashError || !accessToken || !refreshToken) {
      setError(
        hashError?.replace(/\+/g, " ") ??
          "This invite link is invalid or has expired. Ask the admin to resend it.",
      );
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        // Remove the tokens from the address bar and history.
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(
          type === "invite" ? "/reset-password?invited=1" : "/reset-password",
        );
      });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="max-w-sm text-center font-sans text-[14px] text-neutral-600">
        {error ?? "Verifying your invitation…"}
      </p>
    </main>
  );
}
