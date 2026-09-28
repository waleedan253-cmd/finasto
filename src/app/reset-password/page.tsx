import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password — Finasto",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/forgot-password?error=expired");

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(50,30,24,0.06)]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/finasto-logo.png"
            alt="Finasto"
            width={96}
            height={72}
            priority
            className="h-16 w-auto"
          />
          <h1 className="mt-4 font-display text-[30px] text-espresso">
            Set new password
          </h1>
          <p className="mt-1 font-sans text-[13px] text-warm-gray">
            Choose a strong password you don&apos;t use elsewhere
          </p>
        </div>
        <div className="mt-7">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
