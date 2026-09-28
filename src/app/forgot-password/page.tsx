import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password — Finasto",
  description: "Reset your Finasto account password.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(50,30,24,0.06)]">
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
              Forgot password
            </h1>
            <p className="mt-1 font-sans text-[13px] text-warm-gray">
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>
          {error === "expired" && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] text-red"
            >
              That link is invalid or expired. Request a new one.
            </p>
          )}
          <div className="mt-7">
            <ForgotPasswordForm />
          </div>
        </div>
        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="font-sans text-[13px] text-warm-gray transition-colors hover:text-espresso"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
